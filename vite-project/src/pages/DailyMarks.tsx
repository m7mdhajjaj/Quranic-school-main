import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// Interface for Student data
interface Student {
  id: number;
  name: string;
}

// Interface for Section data (assignments for all students)
interface Section {
  id: number;
  date: string;
  memorizationSection: string;
  reviewSection: string;
}

// Interface for Mark data (individual student grades)
interface Mark {
  id: number;
  studentId: number;
  sectionId: number;
  reviewMark: number | null;
  memorizationMark: number | null;
}

const DailyMarks = () => {
  // State for students, sections, and marks
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "أحمد محمد" },
    { id: 2, name: "خالد عبدالله" },
    { id: 3, name: "زياد علي" },
    { id: 4, name: "سعد محمود" },
    { id: 5, name: "عبدالرحمن محمد" },
    { id: 6, name: "فهد سعيد" },
    { id: 7, name: "محمد إبراهيم" },
    { id: 8, name: "يوسف عمر" },
  ]);

  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      date: "2024-06-21",
      memorizationSection: "البقرة (11-15)",
      reviewSection: "البقرة (1-10)",
    },
    {
      id: 2,
      date: "2024-06-20",
      memorizationSection: "البقرة (16-20)",
      reviewSection: "البقرة (1-15)",
    },
    {
      id: 3,
      date: "2024-06-19",
      memorizationSection: "البقرة (1-5)",
      reviewSection: "الفاتحة (1-7)",
    },
  ]);

  const [marks, setMarks] = useState<Mark[]>([
    { id: 1, studentId: 1, sectionId: 1, reviewMark: 9, memorizationMark: 8 },
    { id: 2, studentId: 1, sectionId: 2, reviewMark: 8, memorizationMark: 9 },
    { id: 3, studentId: 2, sectionId: 1, reviewMark: 7, memorizationMark: 8 },
    { id: 4, studentId: 3, sectionId: 1, reviewMark: 10, memorizationMark: 9 },
  ]);

  // State for UI
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isAddMarkModalOpen, setIsAddMarkModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // New section and mark state
  const [newSection, setNewSection] = useState<Omit<Section, "id">>({
    date: new Date().toISOString().split("T")[0],
    memorizationSection: "",
    reviewSection: "",
  });

  const [newMark, setNewMark] = useState({
    reviewMark: 7,
    memorizationMark: 7,
  });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });
  }, []);

  // Get student name by ID
  const getStudentName = (id: number) => {
    return students.find((student) => student.id === id)?.name || "غير معروف";
  };

  // Open the add mark modal
  const openAddMarkModal = (section: Section) => {
    setSelectedSection(section);
    setNewMark({
      reviewMark: 7,
      memorizationMark: 7,
    });
    setIsAddMarkModalOpen(true);
  };

  // Handle adding new section
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();

    const newSectionEntry: Section = {
      id: Date.now(),
      ...newSection,
    };

    setSections((prev) => [newSectionEntry, ...prev]);
    setIsAddSectionModalOpen(false);

    // Reset form
    setNewSection({
      date: new Date().toISOString().split("T")[0],
      memorizationSection: "",
      reviewSection: "",
    });
  };

  // Handle adding new mark
  const handleAddMark = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId || !selectedSection) return;

    const newMarkEntry: Mark = {
      id: Date.now(),
      studentId: selectedStudentId,
      sectionId: selectedSection.id,
      reviewMark: newMark.reviewMark,
      memorizationMark: newMark.memorizationMark,
    };

    setMarks((prev) => [newMarkEntry, ...prev]);
    setIsAddMarkModalOpen(false);
  };

  // Handle input changes for new section
  const handleSectionInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewSection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle input changes for new mark
  const handleMarkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMark((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        <div className="text-center mb-10" data-aos="fade-down">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            نظام العلامات اليومية
          </h1>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List Card */}
          <div
            className="bg-white rounded-xl shadow-md overflow-hidden lg:col-span-1"
            data-aos="fade-up"
            data-aos-delay="100">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6">
              <h2 className="text-xl font-bold text-white">قائمة الطلاب</h2>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {students
                  .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
                  .map((student) => (
                    <li key={student.id} className="py-3">
                      <button
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`w-full text-right py-2 px-4 rounded-lg transition ${
                          selectedStudentId === student.id
                            ? "bg-emerald-100 text-emerald-800 font-bold"
                            : "hover:bg-gray-100"
                        }`}>
                        {student.name}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="p-4 bg-gray-50">
              <button
                onClick={() => setIsAddSectionModalOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition shadow-md flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                إضافة مقطع جديد لجميع الطلاب
              </button>
            </div>
          </div>

          {/* Student Details and Marks */}
          <div className="lg:col-span-2">
            {selectedStudentId ? (
              <div
                className="bg-white rounded-xl shadow-md overflow-hidden"
                data-aos="fade-up"
                data-aos-delay="200">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    علامات الطالب: {getStudentName(selectedStudentId)}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr className="text-right">
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">
                          التاريخ
                        </th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">
                          مقطع المراجعة
                        </th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">
                          علامة المراجعة
                        </th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">
                          مقطع الحفظ
                        </th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">
                          علامة الحفظ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sections.map((section) => {
                        const mark = marks.find(
                          (m) =>
                            m.studentId === selectedStudentId &&
                            m.sectionId === section.id
                        );

                        return (
                          <tr key={section.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm text-gray-700">
                              {new Date(section.date).toLocaleDateString(
                                "ar-SA"
                              )}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-700">
                              <div className="flex items-center">
                                <span>{section.reviewSection}</span>
                                {!mark && (
                                  <button
                                    onClick={() => openAddMarkModal(section)}
                                    className="mr-2 text-emerald-600 hover:text-emerald-800"
                                    title="إضافة علامة">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor">
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {mark ? (
                                <div className="flex items-center">
                                  <span
                                    className={`font-semibold ${
                                      (mark.reviewMark || 0) > 8
                                        ? "text-emerald-600"
                                        : (mark.reviewMark || 0) > 6
                                        ? "text-amber-600"
                                        : "text-red-600"
                                    }`}>
                                    {mark.reviewMark}/10
                                  </span>
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                    <div
                                      className={`h-full ${
                                        (mark.reviewMark || 0) > 8
                                          ? "bg-emerald-500"
                                          : (mark.reviewMark || 0) > 6
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${
                                          (mark.reviewMark || 0) * 10
                                        }%`,
                                      }}></div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-700">
                              <div className="flex items-center">
                                <span>{section.memorizationSection}</span>
                                {!mark && (
                                  <button
                                    onClick={() => openAddMarkModal(section)}
                                    className="mr-2 text-emerald-600 hover:text-emerald-800"
                                    title="إضافة علامة">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor">
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {mark ? (
                                <div className="flex items-center">
                                  <span
                                    className={`font-semibold ${
                                      (mark.memorizationMark || 0) > 8
                                        ? "text-emerald-600"
                                        : (mark.memorizationMark || 0) > 6
                                        ? "text-amber-600"
                                        : "text-red-600"
                                    }`}>
                                    {mark.memorizationMark}/10
                                  </span>
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                    <div
                                      className={`h-full ${
                                        (mark.memorizationMark || 0) > 8
                                          ? "bg-emerald-500"
                                          : (mark.memorizationMark || 0) > 6
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${
                                          (mark.memorizationMark || 0) * 10
                                        }%`,
                                      }}></div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div
                className="bg-white rounded-xl shadow-md p-8 text-center flex flex-col items-center justify-center h-full"
                data-aos="fade-up"
                data-aos-delay="200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <h3 className="text-xl font-bold text-gray-500 mb-2">
                  الرجاء اختيار طالب
                </h3>
                <p className="text-gray-400">
                  اختر طالباً من القائمة لعرض علاماته
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            data-aos="zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                إضافة مقطع جديد لجميع الطلاب
              </h3>
              <button
                onClick={() => setIsAddSectionModalOpen(false)}
                className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSection}>
              {/* Date Field */}
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="date">
                  التاريخ
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newSection.date}
                  onChange={handleSectionInputChange}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Review Section */}
              <div className="mb-4 mt-6">
                <h4 className="text-md font-bold text-emerald-700 mb-3 border-r-4 border-emerald-500 pr-2">
                  معلومات المراجعة
                </h4>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="reviewSection">
                    مقطع المراجعة
                  </label>
                  <input
                    type="text"
                    id="reviewSection"
                    name="reviewSection"
                    placeholder="مثال: البقرة (1-10)"
                    value={newSection.reviewSection}
                    onChange={handleSectionInputChange}
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Memorization Section */}
              <div className="mb-4 mt-6">
                <h4 className="text-md font-bold text-amber-600 mb-3 border-r-4 border-amber-500 pr-2">
                  معلومات الحفظ
                </h4>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="memorizationSection">
                    مقطع الحفظ
                  </label>
                  <input
                    type="text"
                    id="memorizationSection"
                    name="memorizationSection"
                    placeholder="مثال: البقرة (11-15)"
                    value={newSection.memorizationSection}
                    onChange={handleSectionInputChange}
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition">
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg transition shadow-md">
                  إضافة المقطع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Mark Modal */}
      {isAddMarkModalOpen && selectedSection && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            data-aos="zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                إضافة علامة للطالب: {getStudentName(selectedStudentId || 0)}
              </h3>
              <button
                onClick={() => setIsAddMarkModalOpen(false)}
                className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddMark}>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-bold text-gray-700 mb-2">
                  معلومات المقطع:
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">التاريخ:</span>{" "}
                  {new Date(selectedSection.date).toLocaleDateString("ar-SA")}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">مقطع المراجعة:</span>{" "}
                  {selectedSection.reviewSection}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">مقطع الحفظ:</span>{" "}
                  {selectedSection.memorizationSection}
                </p>
              </div>

              {/* Review Mark Input */}
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="reviewMark">
                  علامة المراجعة (1-10)
                </label>
                <div className="flex items-center mb-2">
                  <input
                    type="range"
                    id="reviewMark"
                    name="reviewMark"
                    min="1"
                    max="10"
                    value={newMark.reviewMark}
                    onChange={handleMarkInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <span className="mr-2 font-bold text-emerald-700 min-w-[30px] text-center">
                    {newMark.reviewMark}/10
                  </span>
                </div>

                <div
                  className={`h-1.5 w-full rounded-full mt-2 ${
                    newMark.reviewMark > 8
                      ? "bg-emerald-500"
                      : newMark.reviewMark > 6
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}></div>
              </div>

              {/* Memorization Mark Input */}
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="memorizationMark">
                  علامة الحفظ (1-10)
                </label>
                <div className="flex items-center mb-2">
                  <input
                    type="range"
                    id="memorizationMark"
                    name="memorizationMark"
                    min="1"
                    max="10"
                    value={newMark.memorizationMark}
                    onChange={handleMarkInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <span className="mr-2 font-bold text-emerald-700 min-w-[30px] text-center">
                    {newMark.memorizationMark}/10
                  </span>
                </div>

                <div
                  className={`h-1.5 w-full rounded-full mt-2 ${
                    newMark.memorizationMark > 8
                      ? "bg-emerald-500"
                      : newMark.memorizationMark > 6
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}></div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setIsAddMarkModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition">
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg transition shadow-md">
                  إضافة العلامات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMarks;
