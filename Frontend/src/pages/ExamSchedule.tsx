import React, { useState, useEffect } from "react";

interface Exam {
  _id?: string;
  id?: number;
  name: string;
  date: string;
  time: string;
  result?: string;
}

const API_URL = "http://localhost:5005/api/exams";
const STUDENTS_URL = "http://localhost:5005/api/students";
const EXAM_MARKS_URL = "http://localhost:5005/api/exam-marks";

const ExamSchedule: React.FC = () => {
  // State for edit exam modal
  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);

  // Loading & empty states for table
  const [loadingExams, setLoadingExams] = useState(true);

  // Handler for saving exam edits
  const handleEditExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExam) return;
    const examId = String(editExam._id || editExam.id);
    await fetch(`${API_URL}/${examId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editExam),
    });
    setExams((prev: Exam[]) =>
      prev.map((ex: Exam) =>
        String(ex._id || ex.id) === examId ? editExam : ex
      )
    );
    setShowEditExamModal(false);
    setEditExam(null);
  };

  const [exams, setExams] = useState<Exam[]>([]);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<{
    [studentId: string]: { mark: string; detail: string };
  }>({});
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExam, setNewExam] = useState({ name: "", date: "", time: "" });
  const [studentMarks, setStudentMarks] = useState<{
    [examId: string]: string;
  }>({});

  // Detect user role from localStorage
  const user = localStorage.getItem("user");
  let role = "student";
  if (user) {
    try {
      role = JSON.parse(user).role || "student";
    } catch {}
  }

  // حذف الامتحان
  const handleDeleteExam = async (examIdRaw: string | number) => {
    const examId = String(examIdRaw);
    if (!window.confirm("هل أنت متأكد من حذف الامتحان؟")) return;
    await fetch(`${API_URL}/${examId}`, { method: "DELETE" });
    setExams((prev: Exam[]) =>
      prev.filter((e: Exam) => String(e._id || e.id) !== examId)
    );
  };

  // حذف العلامة لطالب
  const handleDeleteMark = async (
    examIdRaw: string | number,
    studentIdRaw: string | number
  ) => {
    const examId = String(examIdRaw);
    const studentId = String(studentIdRaw);
    if (!window.confirm("هل أنت متأكد من حذف العلامة؟")) return;
    await fetch(`${EXAM_MARKS_URL}/${examId}/${studentId}`, {
      method: "DELETE",
    });
    setMarks((prev: any) => ({
      ...prev,
      [studentId]: { mark: "", detail: "" },
    }));
  };

  // تعديل العلامة لطالب
  const [showEditMarkModal, setShowEditMarkModal] = useState(false);
  const [editMarkStudent, setEditMarkStudent] = useState<any>(null);
  const [editMarkValue, setEditMarkValue] = useState("");
  const [editMarkDetail, setEditMarkDetail] = useState("");

  const handleEditMark = (examIdRaw: string | number, student: any) => {
    setEditMarkStudent(student);
    setEditMarkValue(marks[student._id]?.mark || "");
    setEditMarkDetail(marks[student._id]?.detail || "");
    setShowEditMarkModal(true);
  };

  const handleSaveEditMark = async () => {
    if (!selectedExam || !editMarkStudent) return;
    const examId = String(selectedExam._id || selectedExam.id);
    const studentId = String(editMarkStudent._id);
    await fetch(`${EXAM_MARKS_URL}/${examId}/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark: editMarkValue, detail: editMarkDetail }),
    });
    setMarks((prev: any) => ({
      ...prev,
      [editMarkStudent._id]: { mark: editMarkValue, detail: editMarkDetail },
    }));
    setShowEditMarkModal(false);
    setEditMarkStudent(null);
  };

  useEffect(() => {
    setLoadingExams(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setExams(data))
      .catch(() => setExams([]))
      .finally(() => setLoadingExams(false));
  }, []);

  // Add exam for all students (send to backend)
  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExam),
      });
      if (res.ok) {
        const added = await res.json();
        setExams((prev) => [...prev, added]);
        setShowAddExamModal(false);
        setNewExam({ name: "", date: "", time: "" });
      }
    } catch {}
  };

  // When opening mark modal, fetch students
  useEffect(() => {
    if (showMarkModal && selectedExam) {
      fetch(STUDENTS_URL)
        .then((res) => res.json())
        .then((data) => setStudents(data))
        .catch(() => setStudents([]));
    }
  }, [showMarkModal, selectedExam]);

  // Add marks for all students to backend
  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    const marksArr = students.map((student) => ({
      student: student._id,
      mark: marks[student._id]?.mark || "",
      detail: marks[student._id]?.detail || "",
    }));
    try {
      const examId = selectedExam._id || selectedExam.id;
      await fetch(`${EXAM_MARKS_URL}/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marks: marksArr }),
      });
      setShowMarkModal(false);
      setMarks({});
      setSelectedExam(null);
    } catch {}
  };

  // Fetch student marks if role is student
  useEffect(() => {
    if (role === "student" && user) {
      try {
        const studentId = JSON.parse(user)._id;
        fetch(`${EXAM_MARKS_URL}/student/${studentId}`)
          .then((res) => res.json())
          .then((data) => {
            const marksMap: { [examId: string]: string } = {};
            data.forEach((markObj: any) => {
              const examId =
                (markObj.exam && (markObj.exam._id || markObj.exam.id)) ||
                markObj.exam ||
                markObj.examId ||
                markObj.exam_id ||
                markObj.examId ||
                markObj.exam;
              marksMap[String(examId)] = markObj.mark;
            });
            setStudentMarks(marksMap);
          })
          .catch(() => setStudentMarks({}));
      } catch {}
    }
  }, [role, user]);

  // شارة نتيجة لطيفة
  const ResultBadge: React.FC<{ text?: string }> = ({ text }) => {
    if (!text || !text.trim()) {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
          -
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
        {text}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6" dir="rtl" lang="ar">
      <div className="mb-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-emerald-700 tracking-tight">
          جدول الامتحانات
        </h2>
        <p className="text-center text-sm text-emerald-900/70 mt-2">
          الامتحانات القادمة تظهر هنا، والنتائج تُعرض بعد التصحيح.
        </p>
      </div>

      {(role === "teacher" || role === "admin") && (
        <div className="flex flex-wrap gap-3 justify-center mb-5">
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition"
            onClick={() => setShowAddExamModal(true)}>
            إضافة امتحان لكل الطلاب
          </button>
        </div>
      )}

      {/* Card + Scroll container */}
      <div className="bg-white/90 backdrop-blur rounded-2xl border border-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.08)] overflow-hidden">
        {/* Table (md and up) */}
        <div className="hidden md:block overflow-auto">
          <table className="min-w-full text-center align-middle">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-l from-emerald-600 to-emerald-500 text-white">
                <th className="px-4 py-3 text-sm font-bold">اسم الامتحان</th>
                <th className="px-4 py-3 text-sm font-bold">التاريخ</th>
                <th className="px-4 py-3 text-sm font-bold">الوقت</th>
                <th className="px-4 py-3 text-sm font-bold">النتيجة</th>
                {(role === "teacher" || role === "admin") && (
                  <th className="px-4 py-3 text-sm font-bold">إجراءات</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-emerald-50">
              {loadingExams && (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="px-4 py-4">
                        <div className="h-3.5 w-40 mx-auto rounded bg-emerald-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3.5 w-24 mx-auto rounded bg-emerald-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3.5 w-16 mx-auto rounded bg-emerald-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 w-10 mx-auto rounded-full bg-emerald-100" />
                      </td>
                      {(role === "teacher" || role === "admin") && (
                        <td className="px-4 py-4">
                          <div className="h-8 w-28 mx-auto rounded bg-emerald-100" />
                        </td>
                      )}
                    </tr>
                  ))}
                </>
              )}

              {!loadingExams && exams.length === 0 && (
                <tr>
                  <td
                    colSpan={role === "teacher" || role === "admin" ? 5 : 4}
                    className="px-6 py-10 text-emerald-700/70">
                    لا توجد امتحانات حالياً.
                  </td>
                </tr>
              )}

              {!loadingExams &&
                exams.map((exam, idx) => {
                  const examId =
                    exam._id || exam.id ? String(exam._id || exam.id) : "";
                  const isZebra = idx % 2 === 0;
                  return (
                    <tr
                      key={examId}
                      className={`${
                        isZebra ? "bg-emerald-50/30" : "bg-white"
                      } hover:bg-emerald-50 transition-colors`}>
                      <td className="px-4 py-3 font-semibold text-emerald-900">
                        {exam.name}
                      </td>
                      <td className="px-4 py-3 text-emerald-800">
                        {exam.date}
                      </td>
                      <td className="px-4 py-3 text-emerald-800">
                        {exam.time}
                      </td>
                      <td className="px-4 py-3">
                        {role === "student" ? (
                          <ResultBadge text={studentMarks[examId] || ""} />
                        ) : (
                          <ResultBadge text={exam.result} />
                        )}
                      </td>

                      {(role === "teacher" || role === "admin") && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              onClick={() => {
                                setSelectedExam(exam);
                                setShowMarkModal(true);
                              }}>
                              إضافة العلامات
                            </button>
                            <button
                              className="px-3 py-1.5 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                              onClick={() => {
                                setEditExam({ ...exam });
                                setShowEditExamModal(true);
                              }}>
                              تعديل
                            </button>
                            <button
                              className="px-3 py-1.5 text-sm rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                              onClick={() => handleDeleteExam(examId)}>
                              حذف
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden divide-y divide-emerald-50">
          {loadingExams &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`m-skel-${i}`} className="p-4 animate-pulse">
                <div className="h-4 w-48 rounded bg-emerald-100 mb-3" />
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-3 w-20 rounded bg-emerald-100" />
                  <div className="h-3 w-14 rounded bg-emerald-100" />
                </div>
              </div>
            ))}

          {!loadingExams && exams.length === 0 && (
            <div className="p-6 text-center text-emerald-700/70">
              لا توجد امتحانات حالياً.
            </div>
          )}

          {!loadingExams &&
            exams.map((exam) => {
              const examId =
                exam._id || exam.id ? String(exam._id || exam.id) : "";
              return (
                <div key={`m-${examId}`} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-base font-extrabold text-emerald-900">
                        {exam.name}
                      </div>
                      <div className="mt-1 text-sm text-emerald-800/80">
                        <span className="ml-2">📅 {exam.date}</span>
                        <span>⏰ {exam.time}</span>
                      </div>
                    </div>
                    <ResultBadge
                      text={
                        role === "student"
                          ? studentMarks[examId] || ""
                          : exam.result
                      }
                    />
                  </div>

                  {(role === "teacher" || role === "admin") && (
                    <div className="mt-3 flex gap-2">
                      <button
                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        onClick={() => {
                          setSelectedExam(exam);
                          setShowMarkModal(true);
                        }}>
                        إضافة العلامات
                      </button>
                      <button
                        className="px-3 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                        onClick={() => {
                          setEditExam({ ...exam });
                          setShowEditExamModal(true);
                        }}>
                        تعديل
                      </button>
                      <button
                        className="px-3 py-2 text-sm rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                        onClick={() => handleDeleteExam(examId)}>
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* ملاحظة صغيرة أسفل الجدول */}
    

      {/* Modal for adding exam */}
      {showAddExamModal && (
        <div className="fixed inset-0 bg-emerald-100/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-emerald-200">
            <h3 className="text-3xl font-extrabold mb-8 text-center text-emerald-700 border-b pb-4 tracking-wide">
              إضافة امتحان جديد
            </h3>
            <form onSubmit={handleAddExam} className="space-y-7">
              <div>
                <label className="block mb-2 font-bold text-emerald-700 text-lg">
                  اسم الامتحان
                </label>
                <input
                  className="w-full border border-emerald-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-emerald-50 placeholder:text-emerald-400"
                  type="text"
                  value={newExam.name}
                  onChange={(e) =>
                    setNewExam({ ...newExam, name: e.target.value })
                  }
                  required
                  placeholder="مثلاً اختبار القرآن"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-bold text-emerald-700 text-lg">
                    التاريخ
                  </label>
                  <input
                    className="w-full border border-emerald-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-emerald-50"
                    type="date"
                    value={newExam.date}
                    onChange={(e) =>
                      setNewExam({ ...newExam, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-bold text-emerald-700 text-lg">
                    الوقت
                  </label>
                  <input
                    className="w-full border border-emerald-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-emerald-50"
                    type="time"
                    value={newExam.time}
                    onChange={(e) =>
                      setNewExam({ ...newExam, time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-8 rounded-xl shadow-lg text-xl transition">
                  حفظ
                </button>
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-emerald-700 font-bold py-3 px-8 rounded-xl shadow text-xl transition"
                  onClick={() => setShowAddExamModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for adding marks for all students */}
      {showMarkModal && selectedExam && (
        <div className="fixed inset-0 bg-emerald-100/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-2xl overflow-y-auto max-h-[90vh] border border-emerald-200">
            <h3 className="text-xl font-bold mb-6 text-center text-blue-700 border-b pb-3">
              إضافة علامات الطلاب للامتحان
            </h3>
            <form onSubmit={handleAddMark}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="border rounded-xl p-4 bg-emerald-50 shadow-sm">
                    <div className="font-bold mb-2 text-emerald-700 text-lg">
                      {student.firstName} {student.lastName}
                    </div>
                    <input
                      className="w-full border border-emerald-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-white placeholder:text-emerald-400"
                      type="text"
                      value={marks[student._id]?.mark || ""}
                      onChange={(e) =>
                        setMarks((m) => ({
                          ...m,
                          [student._id]: {
                            ...m[student._id],
                            mark: e.target.value,
                          },
                        }))
                      }
                      placeholder="العلامة (اختياري)"
                    />
                    <input
                      className="w-full border border-emerald-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-white placeholder:text-emerald-400"
                      type="text"
                      value={marks[student._id]?.detail || ""}
                      onChange={(e) =>
                        setMarks((m) => ({
                          ...m,
                          [student._id]: {
                            ...m[student._id],
                            detail: e.target.value,
                          },
                        }))
                      }
                      placeholder="تفاصيل أو ملاحظة (اختياري)"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-xs"
                        onClick={() =>
                          handleEditMark(
                            String(selectedExam?._id || selectedExam?.id || ""),
                            student
                          )
                        }>
                        تعديل العلامة
                      </button>
                      <button
                        type="button"
                        className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-xs"
                        onClick={() =>
                          handleDeleteMark(
                            String(selectedExam?._id || selectedExam?.id || ""),
                            String(student._id)
                          )
                        }>
                        حذف العلامة
                      </button>

                      {/* Modal for editing mark */}
                      {showEditMarkModal && editMarkStudent && (
                        <div className="fixed inset-0 bg-yellow-100/50 backdrop-blur-sm flex items-center justify-center z-50">
                          <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-yellow-200">
                            <h3 className="text-2xl font-bold mb-6 text-center text-yellow-700 border-b pb-3">
                              تعديل علامة الطالب
                            </h3>
                            <div className="mb-4 font-bold text-lg text-yellow-700 text-center">
                              {editMarkStudent.firstName}{" "}
                              {editMarkStudent.lastName}
                            </div>
                            <div className="mb-4">
                              <label className="block mb-2 font-bold text-yellow-700">
                                العلامة
                              </label>
                              <input
                                className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                type="text"
                                value={editMarkValue}
                                onChange={(e) =>
                                  setEditMarkValue(e.target.value)
                                }
                              />
                            </div>
                            <div className="mb-4">
                              <label className="block mb-2 font-bold text-yellow-700">
                                تفاصيل أو ملاحظة
                              </label>
                              <input
                                className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                type="text"
                                value={editMarkDetail}
                                onChange={(e) =>
                                  setEditMarkDetail(e.target.value)
                                }
                              />
                            </div>
                            <div className="flex justify-between mt-6">
                              <button
                                type="button"
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg shadow text-lg"
                                onClick={handleSaveEditMark}>
                                حفظ التعديل
                              </button>
                              <button
                                type="button"
                                className="bg-gray-200 hover:bg-gray-300 text-yellow-700 font-bold py-2 px-6 rounded-lg shadow text-lg"
                                onClick={() => setShowEditMarkModal(false)}>
                                إلغاء
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm">
                  حفظ جميع العلامات
                </button>
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-emerald-700 font-bold py-2 px-4 rounded-xl shadow-sm"
                  onClick={() => setShowMarkModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: تعديل الامتحان */}
      {(role === "teacher" || role === "admin") &&
        showEditExamModal &&
        editExam && (
          <div className="fixed inset-0 bg-yellow-100/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/90 rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-yellow-200">
              <h3 className="text-3xl font-extrabold mb-8 text-center text-yellow-700 border-b pb-4 tracking-wide">
                تعديل الامتحان
              </h3>
              <form onSubmit={handleEditExam} className="space-y-7">
                <div>
                  <label className="block mb-2 font-bold text-yellow-700 text-lg">
                    اسم الامتحان
                  </label>
                  <input
                    className="w-full border border-yellow-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg bg-yellow-50 placeholder:text-yellow-400"
                    type="text"
                    value={editExam.name}
                    onChange={(e) =>
                      setEditExam({ ...editExam, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-bold text-yellow-700 text-lg">
                      التاريخ
                    </label>
                    <input
                      className="w-full border border-yellow-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg bg-yellow-50"
                      type="date"
                      value={editExam.date}
                      onChange={(e) =>
                        setEditExam({ ...editExam, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-bold text-yellow-700 text-lg">
                      الوقت
                    </label>
                    <input
                      className="w-full border border-yellow-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg bg-yellow-50"
                      type="time"
                      value={editExam.time}
                      onChange={(e) =>
                        setEditExam({ ...editExam, time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-extrabold py-3 px-8 rounded-xl shadow-lg text-xl transition">
                    حفظ التعديل
                  </button>
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-yellow-700 font-bold py-3 px-8 rounded-xl shadow text-xl transition"
                    onClick={() => setShowEditExamModal(false)}>
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default ExamSchedule;
