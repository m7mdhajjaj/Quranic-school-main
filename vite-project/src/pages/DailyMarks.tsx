import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Backend API URL
const API_URL = "http://localhost:5005/api";

// Interface for Student data from backend
interface Student {
  _id: string;
  studentId: number;
  firstName: string;
  fatherName: string;
  lastName: string;
  group: string;
}

// Interface for Teacher data from backend
interface Teacher {
  _id: string;
  teacherId: number;
  firstName: string;
  lastName: string;
  groups: string[];
  role: string;
}

// Interface for logged-in user
interface LoggedInUser {
  _id: string;
  firstName: string;
  lastName?: string;
  fatherName?: string;
  group?: string;
  groups?: string[];
  role: string;
}

// Interface for Section data (assignments for all students)
interface Section {
  _id: string;
  date: string;
  memorizationSection: string;
  reviewSection: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for Mark data (individual student grades)
interface Mark {
  _id: string;
  studentId:
    | {
        _id: string;
        firstName: string;
        fatherName: string;
        lastName: string;
        group: string;
      }
    | string;
  sectionId:
    | {
        _id: string;
        date: string;
        memorizationSection: string;
        reviewSection: string;
      }
    | string;
  reviewMark: number | null;
  memorizationMark: number | null;
  createdAt?: string;
  updatedAt?: string;
}

const DailyMarks = () => {
  const navigate = useNavigate();

  // State for students, sections, and marks
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);

  // State for UI
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isAddMarkModalOpen, setIsAddMarkModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(false);

  // Current logged-in user state
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);

  // New section and mark state
  const [newSection, setNewSection] = useState<Omit<Section, "_id">>({
    date: new Date().toISOString().split("T")[0],
    memorizationSection: "",
    reviewSection: "",
  });

  const [newMark, setNewMark] = useState({
    reviewMark: 7,
    memorizationMark: 7,
  });

  // Fetch current user and data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current user from localStorage
        const userJson = localStorage.getItem("user");

        if (!userJson) {
          // If no user is logged in, redirect to login page
          navigate("/login");
          return;
        }

        const user = JSON.parse(userJson);
        setCurrentUser(user);

        // Fetch sections for everyone
        const sectionsResponse = await axios.get(`${API_URL}/sections`);
        setSections(sectionsResponse.data);

        // If user is a teacher, fetch all students
        if (user.role === "teacher" || user.role === "admin") {
          // Fetch students filtered by teacher's groups if needed
          const studentsResponse = await axios.get(`${API_URL}/students`);
          setStudents(studentsResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Fetch marks based on user role
  useEffect(() => {
    if (!currentUser) return;

    const fetchMarks = async () => {
      setLoadingMarks(true);
      try {
        if (currentUser.role === "student") {
          // For students, fetch only their marks
          const response = await axios.get(
            `${API_URL}/marks/student/${currentUser._id}`
          );
          setMarks(response.data);
        } else if (selectedStudentId) {
          // For teachers with selected student
          const response = await axios.get(
            `${API_URL}/marks/student/${selectedStudentId}`
          );
          setMarks(response.data);
        } else {
          // For teachers initially, don't fetch any marks until a student is selected
          setMarks([]);
        }
      } catch (err) {
        console.error("Error fetching marks:", err);
      } finally {
        setLoadingMarks(false);
      }
    };

    fetchMarks();
  }, [currentUser, selectedStudentId]);

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
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/sections`, newSection);
      setSections((prev) => [response.data, ...prev]);
      setIsAddSectionModalOpen(false);

      // Reset form
      setNewSection({
        date: new Date().toISOString().split("T")[0],
        memorizationSection: "",
        reviewSection: "",
      });
    } catch (err) {
      console.error("Error adding section:", err);
      alert("حدث خطأ أثناء إضافة المقطع");
    }
  };

  // Handle adding new mark
  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId || !selectedSection) return;

    try {
      const markData = {
        studentId: selectedStudentId,
        sectionId: selectedSection._id,
        reviewMark: newMark.reviewMark,
        memorizationMark: newMark.memorizationMark,
      };

      const response = await axios.post(`${API_URL}/marks`, markData);

      // Update marks array with new mark
      setMarks((prev) => [response.data, ...prev]);
      setIsAddMarkModalOpen(false);
    } catch (err) {
      console.error("Error adding mark:", err);
      alert("حدث خطأ أثناء إضافة العلامة");
    }
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
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            نظام العلامات اليومية
          </h1>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          {currentUser && (
            <h2 className="text-xl text-gray-700">
              {currentUser.role === "student"
                ? `الطالب: ${currentUser.firstName} ${currentUser.fatherName} ${currentUser.lastName}`
                : `المعلم: ${currentUser.firstName} ${currentUser.lastName}`}
              {currentUser.role === "student" && (
                <span className="block text-sm text-gray-500 mt-1">
                  {currentUser.group}
                </span>
              )}
            </h2>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <>
            {/* Teacher View */}
            {currentUser?.role !== "student" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student List Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden lg:col-span-1">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6">
                    <h2 className="text-xl font-bold text-white">
                      قائمة الطلاب
                    </h2>
                  </div>
                  <div className="p-4">
                    <ul className="divide-y divide-gray-200">
                      {students
                        .sort((a, b) =>
                          `${a.firstName} ${a.lastName}`.localeCompare(
                            `${b.firstName} ${b.lastName}`
                          )
                        )
                        .map((student) => (
                          <li key={student._id} className="py-3">
                            <button
                              onClick={() => setSelectedStudentId(student._id)}
                              className={`w-full text-right py-2 px-4 rounded-lg transition ${
                                selectedStudentId === student._id
                                  ? "bg-emerald-100 text-emerald-800 font-bold"
                                  : "hover:bg-gray-100"
                              }`}>
                              {`${student.firstName} ${student.fatherName} ${student.lastName}`}
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
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">
                          علامات الطالب:{" "}
                          {students.find((s) => s._id === selectedStudentId)
                            ? `${
                                students.find(
                                  (s) => s._id === selectedStudentId
                                )?.firstName
                              } ${
                                students.find(
                                  (s) => s._id === selectedStudentId
                                )?.fatherName
                              } ${
                                students.find(
                                  (s) => s._id === selectedStudentId
                                )?.lastName
                              }`
                            : "غير معروف"}
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
                            {loadingMarks ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="py-4 px-4 text-center">
                                  <p className="text-sm text-gray-500">
                                    جاري تحميل العلامات...
                                  </p>
                                </td>
                              </tr>
                            ) : sections.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="py-8 text-center text-gray-500">
                                  لا توجد مقاطع مضافة بعد
                                </td>
                              </tr>
                            ) : (
                              sections.map((section) => {
                                const mark = marks.find((m) => {
                                  if (typeof m.sectionId === "string") {
                                    return (
                                      m.studentId === selectedStudentId &&
                                      m.sectionId === section._id
                                    );
                                  } else {
                                    return (
                                      m.studentId === selectedStudentId &&
                                      m.sectionId._id === section._id
                                    );
                                  }
                                });

                                return (
                                  <tr
                                    key={section._id}
                                    className="hover:bg-gray-50">
                                    <td className="py-4 px-4 text-sm text-gray-700">
                                      {new Date(
                                        section.date
                                      ).toLocaleDateString("en-GB", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                      })}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-700">
                                      <div className="flex items-center">
                                        <span>{section.reviewSection}</span>
                                        {!mark && (
                                          <button
                                            onClick={() =>
                                              openAddMarkModal(section)
                                            }
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
                                        <span>
                                          {section.memorizationSection}
                                        </span>
                                        {!mark && (
                                          <button
                                            onClick={() =>
                                              openAddMarkModal(section)
                                            }
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
                                                : (mark.memorizationMark || 0) >
                                                  6
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
                                                  : (mark.memorizationMark ||
                                                      0) > 6
                                                  ? "bg-amber-500"
                                                  : "bg-red-500"
                                              }`}
                                              style={{
                                                width: `${
                                                  (mark.memorizationMark || 0) *
                                                  10
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
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center flex flex-col items-center justify-center h-full">
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
            ) : (
              /* Student View */
              <div className="grid grid-cols-1 gap-6">
                {/* Student Marks */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">علاماتي</h2>
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
                        {loadingMarks ? (
                          <tr>
                            <td colSpan={5} className="py-4 px-4 text-center">
                              <p className="text-sm text-gray-500">
                                جاري تحميل العلامات...
                              </p>
                            </td>
                          </tr>
                        ) : sections.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-8 text-center text-gray-500">
                              لا توجد مقاطع مضافة بعد
                            </td>
                          </tr>
                        ) : (
                          sections.map((section) => {
                            const mark = marks.find((m) => {
                              if (typeof m.sectionId === "string") {
                                return m.sectionId === section._id;
                              } else {
                                return m.sectionId._id === section._id;
                              }
                            });

                            return (
                              <tr
                                key={section._id}
                                className="hover:bg-gray-50">
                                <td className="py-4 px-4 text-sm text-gray-700">
                                  {new Date(section.date).toLocaleDateString(
                                    "en-GB",
                                    {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                    }
                                  )}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-700">
                                  <div className="flex items-center">
                                    <span>{section.reviewSection}</span>
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
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Section Modal - Only for teachers */}
      {isAddSectionModalOpen && currentUser?.role !== "student" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
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

      {/* Add Mark Modal - Only for teachers */}
      {isAddMarkModalOpen &&
        selectedSection &&
        currentUser?.role !== "student" && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  إضافة علامة للطالب:{" "}
                  {students.find((s) => s._id === selectedStudentId)
                    ? `${
                        students.find((s) => s._id === selectedStudentId)
                          ?.firstName
                      } ${
                        students.find((s) => s._id === selectedStudentId)
                          ?.lastName
                      }`
                    : "غير معروف"}
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
                    {new Date(selectedSection.date).toLocaleDateString(
                      "en-GB",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }
                    )}
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
