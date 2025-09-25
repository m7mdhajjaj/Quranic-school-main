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
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setExams(data))
      .catch(() => setExams([]));
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
    // Prepare marks array
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
            // Map examId to mark
            const marksMap: { [examId: string]: string } = {};
            data.forEach((markObj: any) => {
              // markObj.exam may be object or id
              const examId =
                (markObj.exam && (markObj.exam._id || markObj.exam.id)) ||
                markObj.exam ||
                markObj.examId ||
                markObj.exam_id ||
                markObj.examId ||
                markObj.exam;
              marksMap[examId] = markObj.mark;
            });
            setStudentMarks(marksMap);
          })
          .catch(() => setStudentMarks({}));
      } catch {}
    }
  }, [role, user]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-emerald-700 drop-shadow">
        جدول الامتحانات
      </h2>
      {role === "teacher" || role === "admin" ? (
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow"
            onClick={() => setShowAddExamModal(true)}>
            إضافة امتحان لكل الطلاب
          </button>
        </div>
      ) : null}
      <table className="w-full border rounded-xl shadow-lg text-center overflow-hidden">
        <thead>
          <tr className="bg-emerald-100 text-emerald-800">
            <th className="border px-3 py-3">اسم الامتحان</th>
            <th className="border px-3 py-3">التاريخ</th>
            <th className="border px-3 py-3">الوقت</th>
            <th className="border px-3 py-3">النتيجة</th>
            {role === "teacher" || role === "admin" ? (
              <th className="border px-3 py-3">إجراءات</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => {
            const examId =
              exam._id || exam.id ? String(exam._id || exam.id) : "";
            return (
              <tr
                key={examId}
                className="bg-white hover:bg-emerald-50 transition">
                <td className="border px-3 py-2 font-bold text-emerald-900">
                  {exam.name}
                </td>
                <td className="border px-3 py-2">{exam.date}</td>
                <td className="border px-3 py-2">{exam.time}</td>
                <td className="border px-3 py-2 text-emerald-700">
                  {role === "student"
                    ? studentMarks[examId] || "-"
                    : exam.result
                    ? exam.result
                    : "-"}
                </td>
                {role === "teacher" || role === "admin" ? (
                  <td className="border px-3 py-2 flex gap-2 justify-center">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow text-sm"
                      onClick={() => {
                        setSelectedExam(exam);
                        setShowMarkModal(true);
                      }}>
                      إضافة العلامات
                    </button>
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow text-sm"
                      onClick={() => {
                        setEditExam({ ...exam });
                        setShowEditExamModal(true);
                      }}>
                      تعديل الامتحان
                    </button>
                    {/* Modal for editing exam (teacher/admin only) */}
                    {role === "teacher" || role === "admin" ? (
                      showEditExamModal && editExam ? (
                        <div className="fixed inset-0 bg-yellow-100 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
                          <div className="bg-white/90 rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-yellow-200">
                            <h3 className="text-3xl font-extrabold mb-8 text-center text-yellow-700 border-b pb-4 tracking-wide">
                              تعديل الامتحان
                            </h3>
                            <form
                              onSubmit={handleEditExam}
                              className="space-y-7">
                              <div>
                                <label className="block mb-2 font-bold text-yellow-700 text-lg">
                                  اسم الامتحان
                                </label>
                                <input
                                  className="w-full border border-yellow-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg bg-yellow-50 placeholder:text-yellow-400"
                                  type="text"
                                  value={editExam.name}
                                  onChange={(e) =>
                                    setEditExam({
                                      ...editExam,
                                      name: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="block mb-2 font-bold text-yellow-700 text-lg">
                                  التاريخ
                                </label>
                                <input
                                  className="w-full border border-yellow-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg bg-yellow-50"
                                  type="date"
                                  value={editExam.date}
                                  onChange={(e) =>
                                    setEditExam({
                                      ...editExam,
                                      date: e.target.value,
                                    })
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
                                    setEditExam({
                                      ...editExam,
                                      time: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="flex justify-between mt-8">
                                <button
                                  type="submit"
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-extrabold py-3 px-8 rounded-xl shadow-lg text-xl transition">
                                  حفظ التعديل
                                </button>
                                <button
                                  type="button"
                                  className="bg-gray-300 hover:bg-gray-400 text-yellow-700 font-bold py-3 px-8 rounded-xl shadow text-xl transition"
                                  onClick={() => setShowEditExamModal(false)}>
                                  إلغاء
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      ) : null
                    ) : null}
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow text-sm"
                      onClick={() => handleDeleteExam(examId)}>
                      حذف الامتحان
                    </button>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-6 text-right text-sm text-gray-700">
        <p>الامتحانات القادمة تظهر هنا، والنتائج تظهر بعد التصحيح.</p>
      </div>

      {/* Modal for adding exam */}
      {showAddExamModal && (
        <div className="fixed inset-0 bg-emerald-100 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
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
              <div className="flex justify-between mt-8">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-8 rounded-xl shadow-lg text-xl transition">
                  حفظ
                </button>
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-emerald-700 font-bold py-3 px-8 rounded-xl shadow text-xl transition"
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
        <div className="fixed inset-0 bg-emerald-100 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-2xl overflow-y-auto max-h-[90vh] border border-emerald-200">
            <h3 className="text-xl font-bold mb-6 text-center text-blue-700 border-b pb-3">
              إضافة علامات الطلاب للامتحان
            </h3>
            <form onSubmit={handleAddMark}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="border rounded-xl p-4 mb-2 bg-emerald-50 shadow">
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
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
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
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
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
                        <div className="fixed inset-0 bg-yellow-100 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
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
                                className="bg-gray-300 hover:bg-gray-400 text-yellow-700 font-bold py-2 px-6 rounded-lg shadow text-lg"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">
                  حفظ جميع العلامات
                </button>
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-emerald-700 font-bold py-2 px-4 rounded shadow"
                  onClick={() => setShowMarkModal(false)}>
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
