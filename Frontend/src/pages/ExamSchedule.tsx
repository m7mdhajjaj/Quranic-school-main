import React, { useState } from "react";

interface Exam {
  id: number;
  name: string;
  date: string;
  time: string;
  result?: string;
}

const initialExams: Exam[] = [
  {
    id: 1,
    name: "اختبار القرآن",
    date: "2025-10-01",
    time: "15:00",
    result: "ممتاز",
  },
  { id: 2, name: "اختبار الفقه", date: "2025-10-05", time: "16:30" },
  {
    id: 3,
    name: "اختبار الحديث",
    date: "2025-10-10",
    time: "14:00",
    result: "جيد جداً",
  },
];

const ExamSchedule: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [mark, setMark] = useState("");
  const [markDetail, setMarkDetail] = useState("");
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExam, setNewExam] = useState({ name: "", date: "", time: "" });
  // Detect user role from localStorage
  const user = localStorage.getItem("user");
  let role = "student";
  if (user) {
    try {
      role = JSON.parse(user).role || "student";
    } catch {}
  }

  // Add exam for all students (demo: just adds to list)
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    setExams([
      ...exams,
      {
        id: exams.length + 1,
        name: newExam.name,
        date: newExam.date,
        time: newExam.time,
      },
    ]);
    setShowAddExamModal(false);
    setNewExam({ name: "", date: "", time: "" });
  };

  // Add mark to exam (demo: just updates result)
  const handleAddMark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    setExams(
      exams.map((ex) =>
        ex.id === selectedExam.id
          ? { ...ex, result: mark + (markDetail ? ` (${markDetail})` : "") }
          : ex
      )
    );
    setShowMarkModal(false);
    setMark("");
    setMarkDetail("");
    setSelectedExam(null);
  };

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
          {exams.map((exam) => (
            <tr
              key={exam.id}
              className="bg-white hover:bg-emerald-50 transition">
              <td className="border px-3 py-2 font-bold text-emerald-900">
                {exam.name}
              </td>
              <td className="border px-3 py-2">{exam.date}</td>
              <td className="border px-3 py-2">{exam.time}</td>
              <td className="border px-3 py-2 text-emerald-700">
                {exam.result ? exam.result : "-"}
              </td>
              {role === "teacher" || role === "admin" ? (
                <td className="border px-3 py-2">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow text-sm"
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowMarkModal(true);
                    }}>
                    إضافة علامة/تفاصيل
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 text-right text-sm text-gray-700">
        <p>الامتحانات القادمة تظهر هنا، والنتائج تظهر بعد التصحيح.</p>
      </div>

      {/* Modal for adding exam */}
      {showAddExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-emerald-200">
            <h3 className="text-2xl font-bold mb-6 text-center text-emerald-700 border-b pb-3">
              إضافة امتحان جديد
            </h3>
            <form onSubmit={handleAddExam} className="space-y-5">
              <div>
                <label className="block mb-2 font-bold text-emerald-700">
                  اسم الامتحان
                </label>
                <input
                  className="w-full border border-emerald-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg"
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
                <label className="block mb-2 font-bold text-emerald-700">
                  التاريخ
                </label>
                <input
                  className="w-full border border-emerald-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg"
                  type="date"
                  value={newExam.date}
                  onChange={(e) =>
                    setNewExam({ ...newExam, date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-bold text-emerald-700">
                  الوقت
                </label>
                <input
                  className="w-full border border-emerald-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg"
                  type="time"
                  value={newExam.time}
                  onChange={(e) =>
                    setNewExam({ ...newExam, time: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow text-lg">
                  حفظ
                </button>
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg shadow text-lg"
                  onClick={() => setShowAddExamModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for adding mark/details */}
      {showMarkModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-center text-blue-700">
              إضافة علامة أو تفاصيل للامتحان
            </h3>
            <form onSubmit={handleAddMark}>
              <div className="mb-3">
                <label className="block mb-1 font-bold">العلامة</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  type="text"
                  value={mark}
                  onChange={(e) => setMark(e.target.value)}
                  placeholder="مثلاً ممتاز، جيد جداً، أو رقم العلامة"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-bold">تفاصيل إضافية</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  type="text"
                  value={markDetail}
                  onChange={(e) => setMarkDetail(e.target.value)}
                  placeholder="ملاحظات أو تفاصيل أخرى (اختياري)"
                />
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">
                  حفظ
                </button>
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded shadow"
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
