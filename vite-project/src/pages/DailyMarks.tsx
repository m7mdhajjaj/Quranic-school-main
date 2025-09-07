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
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isAddMarkModalOpen, setIsAddMarkModalOpen] = useState(false);
  const [isUpdateMarkModalOpen, setIsUpdateMarkModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedSectionsForBulk, setSelectedSectionsForBulk] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  ); // Current month (1-12)
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  ); // Current year

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

  // Open the update mark modal
  const openUpdateMarkModal = (mark: Mark, section: Section) => {
    setEditingMark(mark);
    setSelectedSection(section);
    setNewMark({
      reviewMark: mark.reviewMark || 7,
      memorizationMark: mark.memorizationMark || 7,
    });
    setIsUpdateMarkModalOpen(true);
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

  // Handle updating existing mark
  const handleUpdateMark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMark || !selectedStudentId || !selectedSection) return;

    try {
      const markData = {
        studentId: selectedStudentId,
        sectionId: selectedSection._id,
        reviewMark: newMark.reviewMark,
        memorizationMark: newMark.memorizationMark,
      };

      const response = await axios.post(`${API_URL}/marks`, markData);

      // Update marks array with updated mark
      setMarks((prev) =>
        prev.map((mark) =>
          mark._id === editingMark._id ? response.data : mark
        )
      );
      setIsUpdateMarkModalOpen(false);
      setEditingMark(null);
    } catch (err) {
      console.error("Error updating mark:", err);
      alert("حدث خطأ أثناء تحديث العلامة");
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

  // Handle editing section
  const handleEditSection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingSection) return;

    try {
      const response = await axios.put(
        `${API_URL}/sections/${editingSection._id}`,
        {
          date: editingSection.date,
          memorizationSection: editingSection.memorizationSection,
          reviewSection: editingSection.reviewSection,
        }
      );

      // Update sections array with edited section
      setSections((prev) =>
        prev.map((section) =>
          section._id === editingSection._id ? response.data : section
        )
      );
      setIsEditSectionModalOpen(false);
      setEditingSection(null);
    } catch (err) {
      console.error("Error updating section:", err);
      alert("حدث خطأ أثناء تحديث المقطع");
    }
  };

  // Handle deleting section
  const handleDeleteSection = async (sectionId: string) => {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذا المقطع؟ سيتم حذف جميع العلامات المرتبطة به."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/sections/${sectionId}`);

      // Remove section from sections array
      setSections((prev) =>
        prev.filter((section) => section._id !== sectionId)
      );

      // Remove related marks
      setMarks((prev) =>
        prev.filter((mark) => {
          if (typeof mark.sectionId === "string") {
            return mark.sectionId !== sectionId;
          } else {
            return mark.sectionId._id !== sectionId;
          }
        })
      );
    } catch (err) {
      console.error("Error deleting section:", err);
      alert("حدث خطأ أثناء حذف المقطع");
    }
  };

  // Open edit section modal
  const openEditSectionModal = (section: Section) => {
    setEditingSection({ ...section });
    setIsEditSectionModalOpen(true);
  };

  // Handle bulk update sections - opens modal to select sections
  const handleBulkUpdateSections = () => {
    setIsBulkUpdateModalOpen(true);
  };

  // Handle bulk delete sections - opens modal to select sections
  const handleBulkDeleteSections = () => {
    setIsBulkDeleteModalOpen(true);
  };

  // Handle bulk delete execution
  const executeBulkDelete = async () => {
    if (selectedSectionsForBulk.length === 0) {
      alert("الرجاء اختيار مقطع واحد على الأقل للحذف");
      return;
    }

    if (
      !confirm(
        `هل أنت متأكد من حذف ${selectedSectionsForBulk.length} مقطع؟ سيتم حذف جميع العلامات المرتبطة بهم.`
      )
    ) {
      return;
    }

    try {
      // Delete each selected section
      await Promise.all(
        selectedSectionsForBulk.map((sectionId) =>
          axios.delete(`${API_URL}/sections/${sectionId}`)
        )
      );

      // Remove sections from state
      setSections((prev) =>
        prev.filter((section) => !selectedSectionsForBulk.includes(section._id))
      );

      // Remove related marks
      setMarks((prev) =>
        prev.filter((mark) => {
          if (typeof mark.sectionId === "string") {
            return !selectedSectionsForBulk.includes(mark.sectionId);
          } else {
            return !selectedSectionsForBulk.includes(mark.sectionId._id);
          }
        })
      );

      setIsBulkDeleteModalOpen(false);
      setSelectedSectionsForBulk([]);
      alert("تم حذف المقاطع بنجاح");
    } catch (err) {
      console.error("Error bulk deleting sections:", err);
      alert("حدث خطأ أثناء حذف المقاطع");
    }
  };

  // Handle bulk update execution
  const executeBulkUpdate = async (updateData: {
    reviewSection?: string;
    memorizationSection?: string;
  }) => {
    if (selectedSectionsForBulk.length === 0) {
      alert("الرجاء اختيار مقطع واحد على الأقل للتحديث");
      return;
    }

    try {
      // Update each selected section
      const updatePromises = selectedSectionsForBulk.map(async (sectionId) => {
        const sectionToUpdate = sections.find((s) => s._id === sectionId);
        if (!sectionToUpdate) return null;

        const updatedData = {
          date: sectionToUpdate.date,
          reviewSection:
            updateData.reviewSection || sectionToUpdate.reviewSection,
          memorizationSection:
            updateData.memorizationSection ||
            sectionToUpdate.memorizationSection,
        };

        return axios.put(`${API_URL}/sections/${sectionId}`, updatedData);
      });

      const results = await Promise.all(updatePromises);

      // Update sections in state
      setSections((prev) =>
        prev.map((section) => {
          const result = results.find((r) => r?.data._id === section._id);
          return result ? result.data : section;
        })
      );

      setIsBulkUpdateModalOpen(false);
      setSelectedSectionsForBulk([]);
      alert("تم تحديث المقاطع بنجاح");
    } catch (err) {
      console.error("Error bulk updating sections:", err);
      alert("حدث خطأ أثناء تحديث المقاطع");
    }
  };

  // Toggle section selection for bulk operations
  const toggleSectionSelection = (sectionId: string) => {
    setSelectedSectionsForBulk((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Handle input changes for editing section
  const handleEditSectionInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditingSection((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : null
    );
  };

  // Handle input changes for new mark
  const handleMarkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMark((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Filter sections by selected month and year
  const getFilteredSections = () => {
    return sections.filter((section) => {
      const sectionDate = new Date(section.date);
      const sectionMonth = sectionDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
      const sectionYear = sectionDate.getFullYear();
      return sectionMonth === selectedMonth && sectionYear === selectedYear;
    });
  };

  // Handle month change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(e.target.value));
  };

  // Handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  // Calculate averages for the selected month and year
  const calculateAverages = () => {
    const filteredSections = getFilteredSections();

    if (filteredSections.length === 0) {
      return {
        reviewAverage: 0,
        memorizationAverage: 0,
        overallAverage: 0,
        totalMarks: 0,
      };
    }

    // For students, use currentUser._id; for teachers, use selectedStudentId
    const targetStudentId =
      currentUser?.role === "student" ? currentUser._id : selectedStudentId;

    if (!targetStudentId) {
      return {
        reviewAverage: 0,
        memorizationAverage: 0,
        overallAverage: 0,
        totalMarks: 0,
      };
    }

    const relevantMarks = marks.filter((mark) => {
      const markSectionId =
        typeof mark.sectionId === "string"
          ? mark.sectionId
          : mark.sectionId._id;

      const markStudentId =
        typeof mark.studentId === "string"
          ? mark.studentId
          : mark.studentId._id;

      return (
        markStudentId === targetStudentId &&
        filteredSections.some((section) => section._id === markSectionId)
      );
    });

    if (relevantMarks.length === 0) {
      return {
        reviewAverage: 0,
        memorizationAverage: 0,
        overallAverage: 0,
        totalMarks: 0,
      };
    }

    const reviewMarks = relevantMarks
      .filter((mark) => mark.reviewMark !== null)
      .map((mark) => mark.reviewMark || 0);
    const memorizationMarks = relevantMarks
      .filter((mark) => mark.memorizationMark !== null)
      .map((mark) => mark.memorizationMark || 0);

    const reviewAverage =
      reviewMarks.length > 0
        ? reviewMarks.reduce((sum, mark) => sum + mark, 0) / reviewMarks.length
        : 0;
    const memorizationAverage =
      memorizationMarks.length > 0
        ? memorizationMarks.reduce((sum, mark) => sum + mark, 0) /
          memorizationMarks.length
        : 0;

    // Overall average out of 100 (combining both review and memorization)
    const overallAverage = ((reviewAverage + memorizationAverage) / 2) * 10; // Convert to percentage

    return {
      reviewAverage: Number(reviewAverage.toFixed(2)),
      memorizationAverage: Number(memorizationAverage.toFixed(2)),
      overallAverage: Number(overallAverage.toFixed(2)),
      totalMarks: relevantMarks.length,
    };
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

        {/* Month and Year Filter */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              فلترة العلامات حسب الشهر والسنة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  اختر الشهر:
                </label>
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value={1}>يناير (1)</option>
                  <option value={2}>فبراير (2)</option>
                  <option value={3}>مارس (3)</option>
                  <option value={4}>أبريل (4)</option>
                  <option value={5}>مايو (5)</option>
                  <option value={6}>يونيو (6)</option>
                  <option value={7}>يوليو (7)</option>
                  <option value={8}>أغسطس (8)</option>
                  <option value={9}>سبتمبر (9)</option>
                  <option value={10}>أكتوبر (10)</option>
                  <option value={11}>نوفمبر (11)</option>
                  <option value={12}>ديسمبر (12)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  اختر السنة:
                </label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value={2023}>2023</option>
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>
          </div>
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
                  <div className="p-4 bg-gray-50 space-y-3">
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

                    <button
                      onClick={() => handleBulkUpdateSections()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition shadow-md flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      تحديث المقطع لجميع الطلاب
                    </button>

                    <button
                      onClick={() => handleBulkDeleteSections()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition shadow-md flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      حذف المقطع لجميع الطلاب
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
                              <th className="py-3 px-4 text-sm font-medium text-gray-600">
                                الإجراءات
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
                                  colSpan={6}
                                  className="py-8 text-center text-gray-500">
                                  لا توجد مقاطع مضافة بعد
                                </td>
                              </tr>
                            ) : getFilteredSections().length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="py-8 text-center text-gray-500">
                                  لا توجد مقاطع في الشهر والسنة المحددة
                                </td>
                              </tr>
                            ) : (
                              getFilteredSections().map((section) => {
                                const mark = marks.find((m) => {
                                  const markStudentId =
                                    typeof m.studentId === "string"
                                      ? m.studentId
                                      : m.studentId._id;

                                  if (typeof m.sectionId === "string") {
                                    return (
                                      markStudentId === selectedStudentId &&
                                      m.sectionId === section._id
                                    );
                                  } else {
                                    return (
                                      markStudentId === selectedStudentId &&
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
                                      <span>{section.reviewSection}</span>
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
                                      <span>{section.memorizationSection}</span>
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
                                    <td className="py-4 px-4">
                                      <div className="flex items-center space-x-2">
                                        {mark ? (
                                          <button
                                            onClick={() =>
                                              openUpdateMarkModal(mark, section)
                                            }
                                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm font-medium transition"
                                            title="تحديث العلامة">
                                            تحديث العلامة
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() =>
                                              openAddMarkModal(section)
                                            }
                                            className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg text-sm font-medium transition"
                                            title="إضافة علامة">
                                            إضافة علامة
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Averages Section for Teacher View */}
                      {selectedStudentId &&
                        getFilteredSections().length > 0 && (
                          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                              معدلات الشهر المحدد
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Review Average */}
                              <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-emerald-500">
                                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                                  معدل المراجعة
                                </h4>
                                <div className="text-2xl font-bold text-emerald-600">
                                  {calculateAverages().reviewAverage}/10
                                </div>
                                <div className="text-xs text-gray-500">
                                  من {calculateAverages().totalMarks} علامة
                                </div>
                              </div>

                              {/* Memorization Average */}
                              <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-amber-500">
                                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                                  معدل الحفظ
                                </h4>
                                <div className="text-2xl font-bold text-amber-600">
                                  {calculateAverages().memorizationAverage}/10
                                </div>
                                <div className="text-xs text-gray-500">
                                  من {calculateAverages().totalMarks} علامة
                                </div>
                              </div>

                              {/* Overall Average */}
                              <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-blue-500">
                                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                                  المعدل الإجمالي
                                </h4>
                                <div className="text-2xl font-bold text-blue-600">
                                  {calculateAverages().overallAverage}/100
                                </div>
                                <div className="text-xs text-gray-500">
                                  الحفظ + المراجعة
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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
                        ) : getFilteredSections().length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-8 text-center text-gray-500">
                              لا توجد مقاطع في الشهر والسنة المحددة
                            </td>
                          </tr>
                        ) : (
                          getFilteredSections().map((section) => {
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

                  {/* Averages Section for Student View */}
                  {getFilteredSections().length > 0 && (
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                        معدلاتي للشهر المحدد
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Review Average */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-emerald-500">
                          <h4 className="text-sm font-semibold text-gray-600 mb-1">
                            معدل المراجعة
                          </h4>
                          <div className="text-2xl font-bold text-emerald-600">
                            {calculateAverages().reviewAverage}/10
                          </div>
                          <div className="text-xs text-gray-500">
                            من {calculateAverages().totalMarks} علامة
                          </div>
                        </div>

                        {/* Memorization Average */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-amber-500">
                          <h4 className="text-sm font-semibold text-gray-600 mb-1">
                            معدل الحفظ
                          </h4>
                          <div className="text-2xl font-bold text-amber-600">
                            {calculateAverages().memorizationAverage}/10
                          </div>
                          <div className="text-xs text-gray-500">
                            من {calculateAverages().totalMarks} علامة
                          </div>
                        </div>

                        {/* Overall Average */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-blue-500">
                          <h4 className="text-sm font-semibold text-gray-600 mb-1">
                            المعدل الإجمالي
                          </h4>
                          <div className="text-2xl font-bold text-blue-600">
                            {calculateAverages().overallAverage}/100
                          </div>
                          <div className="text-xs text-gray-500">
                            الحفظ + المراجعة
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

      {/* Edit Section Modal - Only for teachers */}
      {isEditSectionModalOpen &&
        editingSection &&
        currentUser?.role !== "student" && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  تعديل المقطع
                </h3>
                <button
                  onClick={() => {
                    setIsEditSectionModalOpen(false);
                    setEditingSection(null);
                  }}
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

              <form onSubmit={handleEditSection}>
                {/* Date Field */}
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="edit-date">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    id="edit-date"
                    name="date"
                    value={editingSection.date}
                    onChange={handleEditSectionInputChange}
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
                      htmlFor="edit-reviewSection">
                      مقطع المراجعة
                    </label>
                    <input
                      type="text"
                      id="edit-reviewSection"
                      name="reviewSection"
                      placeholder="مثال: البقرة (1-10)"
                      value={editingSection.reviewSection}
                      onChange={handleEditSectionInputChange}
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
                      htmlFor="edit-memorizationSection">
                      مقطع الحفظ
                    </label>
                    <input
                      type="text"
                      id="edit-memorizationSection"
                      name="memorizationSection"
                      placeholder="مثال: البقرة (11-15)"
                      value={editingSection.memorizationSection}
                      onChange={handleEditSectionInputChange}
                      className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditSectionModalOpen(false);
                      setEditingSection(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition">
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg transition shadow-md">
                    حفظ التعديل
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

      {/* Update Mark Modal - Only for teachers */}
      {isUpdateMarkModalOpen &&
        selectedSection &&
        editingMark &&
        currentUser?.role !== "student" && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  تحديث علامة الطالب:{" "}
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
                  onClick={() => {
                    setIsUpdateMarkModalOpen(false);
                    setEditingMark(null);
                  }}
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

              <form onSubmit={handleUpdateMark}>
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
                    htmlFor="updateReviewMark">
                    علامة المراجعة (1-10)
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="range"
                      id="updateReviewMark"
                      name="reviewMark"
                      min="1"
                      max="10"
                      value={newMark.reviewMark}
                      onChange={handleMarkInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="mr-2 font-bold text-blue-700 min-w-[30px] text-center">
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
                    htmlFor="updateMemorizationMark">
                    علامة الحفظ (1-10)
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="range"
                      id="updateMemorizationMark"
                      name="memorizationMark"
                      min="1"
                      max="10"
                      value={newMark.memorizationMark}
                      onChange={handleMarkInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="mr-2 font-bold text-blue-700 min-w-[30px] text-center">
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
                    onClick={() => {
                      setIsUpdateMarkModalOpen(false);
                      setEditingMark(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition">
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg transition shadow-md">
                    تحديث العلامات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Bulk Update Modal */}
      {isBulkUpdateModalOpen && currentUser?.role !== "student" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                تحديث المقاطع لجميع الطلاب
              </h3>
              <button
                onClick={() => {
                  setIsBulkUpdateModalOpen(false);
                  setSelectedSectionsForBulk([]);
                }}
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updateData = {
                  reviewSection:
                    (formData.get("reviewSection") as string) || undefined,
                  memorizationSection:
                    (formData.get("memorizationSection") as string) ||
                    undefined,
                };
                executeBulkUpdate(updateData);
              }}>
              {/* Section Selection */}
              <div className="mb-6">
                <h4 className="text-md font-bold text-gray-700 mb-3">
                  اختر المقاطع المراد تحديثها:
                </h4>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                  {getFilteredSections().map((section) => (
                    <label
                      key={section._id}
                      className="flex items-center mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSectionsForBulk.includes(section._id)}
                        onChange={() => toggleSectionSelection(section._id)}
                        className="ml-2"
                      />
                      <span className="text-sm">
                        {new Date(section.date).toLocaleDateString("en-GB")} -
                        مراجعة: {section.reviewSection} - حفظ:{" "}
                        {section.memorizationSection}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Update Fields */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  مقطع المراجعة الجديد (اتركه فارغاً للاحتفاظ بالقيمة الحالية)
                </label>
                <input
                  type="text"
                  name="reviewSection"
                  placeholder="مثال: البقرة (1-10)"
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  مقطع الحفظ الجديد (اتركه فارغاً للاحتفاظ بالقيمة الحالية)
                </label>
                <input
                  type="text"
                  name="memorizationSection"
                  placeholder="مثال: البقرة (11-15)"
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkUpdateModalOpen(false);
                    setSelectedSectionsForBulk([]);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition">
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg transition shadow-md">
                  تحديث المقاطع المحددة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteModalOpen && currentUser?.role !== "student" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                حذف المقاطع لجميع الطلاب
              </h3>
              <button
                onClick={() => {
                  setIsBulkDeleteModalOpen(false);
                  setSelectedSectionsForBulk([]);
                }}
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

            {/* Section Selection */}
            <div className="mb-6">
              <h4 className="text-md font-bold text-gray-700 mb-3">
                اختر المقاطع المراد حذفها:
              </h4>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                {getFilteredSections().map((section) => (
                  <label
                    key={section._id}
                    className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSectionsForBulk.includes(section._id)}
                      onChange={() => toggleSectionSelection(section._id)}
                      className="ml-2"
                    />
                    <span className="text-sm">
                      {new Date(section.date).toLocaleDateString("en-GB")} -
                      مراجعة: {section.reviewSection} - حفظ:{" "}
                      {section.memorizationSection}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">
                <strong>تحذير:</strong> سيتم حذف جميع العلامات المرتبطة بالمقاطع
                المحددة نهائياً. هذا الإجراء لا يمكن التراجع عنه.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => {
                  setIsBulkDeleteModalOpen(false);
                  setSelectedSectionsForBulk([]);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition">
                إلغاء
              </button>
              <button
                type="button"
                onClick={executeBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-8 rounded-lg transition shadow-md">
                حذف المقاطع المحددة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMarks;
