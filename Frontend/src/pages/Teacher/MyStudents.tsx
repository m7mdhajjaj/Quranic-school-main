import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUserGraduate,
  FaChartBar,
  FaTh,
  FaList,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTimes,
  FaSync,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useMyStudentsSocket } from "../../Socket";
import {
  getAllStudents,
  deleteStudent,
  type Student as ApiStudent,
} from "../../Api/studentApi";

import AddStudentFormWithYup from "../../components/Forms/AddStudentForm";
import ResponsivePagination from "../../components/Pagination/ResponsivePagination";
import {
  showCenteredSwal,
  showSuccessMessage,
  showWarningMessage,
  showErrorMessage,
} from "../../utils/sweetalertUtils";

type Student = ApiStudent;

type SortField = "studentId" | "firstName" | "age" | "group";
type SortOrder = "asc" | "desc";
type ViewMode = "table" | "grid";

interface Group {
  id: string;
  name: string;
  number: number;
}

interface TeacherUser {
  _id: string;
  firstName: string;
  lastName?: string;
  role: string;
  groups?: Group[];
}

const MyStudents: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  // استخدام نظام Socket الجديد مع Heartbeat تلقائي كل 30 ثانية
  const {
    isConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useMyStudentsSocket();

  // Cast user to TeacherUser type
  const teacher = currentUser as TeacherUser;

    const teacherGroups = useMemo(() => teacher?.groups || [], [teacher?.groups]);
//fix
  // const teacherGroups = teacher?.groups || [];

  // Core States
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Sorting States
  const [sortField, setSortField] = useState<SortField>("studentId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  // View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Set default selected group on mount
  useEffect(() => {
    if (teacherGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(teacherGroups[0].name);
    }
  }, [teacherGroups, selectedGroup]);

  // Statistics for selected group
  const stats = useMemo(() => {
    const maleCount = filteredStudents.filter((s) => s.gender === "ذكر").length;
    const femaleCount = filteredStudents.filter(
      (s) => s.gender === "أنثى"
    ).length;
    const avgAge =
      filteredStudents.length > 0
        ? (
            filteredStudents.reduce((sum, s) => sum + (s.age || 0), 0) /
            filteredStudents.length
          ).toFixed(1)
        : 0;

    return {
      total: filteredStudents.length,
      male: maleCount,
      female: femaleCount,
      avgAge,
    };
  }, [filteredStudents]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGender !== "all") count++;
    if (searchTerm) count++;
    return count;
  }, [selectedGender, searchTerm]);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAllStudents();

      if (result.success && result.data) {
        const cleanedStudents = result.data.map((student) => ({
          ...student,
          firstName: student.firstName || "",
          lastName: student.lastName || "",
          fatherName: student.fatherName || "",
          idNumber: student.idNumber || "",
          teacher: student.teacher || "غير محدد",
          group: student.group || "غير محدد",
          gender: student.gender || "غير محدد",
          age: student.age || 0,
        }));

        setStudents(cleanedStudents);
        setError(null);
      } else {
        throw new Error(result.message || "البيانات المستلمة غير صحيحة");
      }
    } catch (error: unknown) {
      console.error("❌ خطأ في تحميل الطلاب:", error);
      let errorMessage = "حدث خطأ في تحميل البيانات";

      if (error instanceof Error) {
        errorMessage = error.message || "خطأ غير محدد";
      }

      setError(errorMessage);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students by selected group
  useEffect(() => {
    if (!selectedGroup || teacherGroups.length === 0) {
      setFilteredStudents([]);
      return;
    }

    const filtered = students.filter(
      (student) => student.group === selectedGroup
    );
    setFilteredStudents(filtered);
  }, [students, selectedGroup, teacherGroups]);

  // Socket: إعادة جلب البيانات عند استقبال تحديث
  useEffect(() => {
    if (socketLastUpdate) {
      console.log("📡 Socket update received, refreshing students...");
      fetchStudents();
    }
  }, [socketLastUpdate, fetchStudents]);

  // Apply filters and search
  const processedStudents = useMemo(() => {
    let result = [...filteredStudents];

    // Apply gender filter
    if (selectedGender !== "all") {
      result = result.filter((s) => s.gender === selectedGender);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(term) ||
          s.lastName?.toLowerCase().includes(term) ||
          s.fatherName?.toLowerCase().includes(term) ||
          s.idNumber?.toString().includes(term) ||
          s.studentId?.toString().includes(term)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "studentId":
          aValue = a.studentId || 0;
          bValue = b.studentId || 0;
          break;
        case "firstName":
          aValue = a.firstName || "";
          bValue = b.firstName || "";
          break;
        case "age":
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case "group":
          aValue = a.group || "";
          bValue = b.group || "";
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue, "ar")
          : bValue.localeCompare(aValue, "ar");
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return result;
  }, [filteredStudents, selectedGender, searchTerm, sortField, sortOrder]);

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = processedStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(processedStudents.length / studentsPerPage);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Handle add student
  const handleAddStudent = () => {
    setIsEditMode(false);
    setSelectedStudent(null);
    setIsFormVisible(true);
  };

  // Handle edit student
  const handleEditStudent = (student: Student) => {
    // Check if student belongs to teacher's group
    if (!teacherGroups.some((g) => g.name === student.group)) {
      showWarningMessage("لا يمكنك تعديل طالب من حلقة أخرى", "تحذير");
      return;
    }

    setIsEditMode(true);
    setSelectedStudent(student);
    setIsFormVisible(true);
  };

  // Handle delete student
  const handleDeleteStudent = async (student: Student) => {
    // Check if student belongs to teacher's group
    if (!teacherGroups.some((g) => g.name === student.group)) {
      showWarningMessage("لا يمكنك حذف طالب من حلقة أخرى", "تحذير");
      return;
    }

    const result = await showCenteredSwal({
      title: "تأكيد الحذف",
      text: `هل أنت متأكد من حذف الطالب ${student.firstName} ${student.lastName}؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteStudent(student._id);
        if (deleteResult.success) {
          showSuccessMessage("تم حذف الطالب بنجاح", "نجاح");
          fetchStudents();
        } else {
          throw new Error(deleteResult.message);
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        showErrorMessage("حدث خطأ أثناء حذف الطالب", "خطأ");
      }
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormVisible(false);
    setIsEditMode(false);
    setSelectedStudent(null);
  };

  // Handle form submit
  const handleFormSubmit = () => {
    fetchStudents();
    handleFormClose();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedGender("all");
    setShowFilters(false);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8"
      dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaUserGraduate className="text-emerald-600" />
                إدارة الطلاب
              </h1>
              <p className="text-gray-600 mt-2">إدارة طلاب حلقاتك</p>
            </div>

            {/* Socket Connection Status */}
            <div 
              className="flex items-center gap-1.5 cursor-help"
              title={
                isConnected
                  ? `💓 Heartbeat نشط (كل 30 ثانية)\nSocket ID: ${socketId || 'N/A'}\nآخر تحديث: ${socketLastUpdate?.toLocaleTimeString('ar-SA') || 'لا يوجد'}`
                  : 'Socket غير متصل - وضع التحديث التلقائي'
              }>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500'
              } animate-pulse`}></div>
              <span className={`text-xs font-medium ${
                isConnected ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {isConnected ? '💓 متصل مباشرة' : 'تحديث تلقائي'}
              </span>
            </div>
          </div>

          {/* Group Filter */}
          {teacherGroups.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                اختر الحلقة
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  setCurrentPage(1);
                }}
                title="اختر الحلقة"
                aria-label="اختر الحلقة"
                className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
                {teacherGroups.map((group) => (
                  <option key={group.id} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                {stats.total} طالب في هذه الحلقة
              </p>
            </div>
          )}

          {/* No Groups Message */}
          {teacherGroups.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <p className="text-yellow-800 text-center">
                ⚠️ لم يتم تعيين أي حلقات لك. يرجى التواصل مع المدير.
              </p>
            </div>
          )}

          {/* Statistics Cards */}
          {selectedGroup && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Students */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">إجمالي الطلاب</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <FaUserGraduate className="text-4xl text-blue-200" />
                </div>
              </div>

              {/* Male Students */}
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm mb-1">طلاب ذكور</p>
                    <p className="text-3xl font-bold">{stats.male}</p>
                  </div>
                  <FaChartBar className="text-4xl text-cyan-200" />
                </div>
              </div>

              {/* Female Students */}
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm mb-1">طالبات إناث</p>
                    <p className="text-3xl font-bold">{stats.female}</p>
                  </div>
                  <FaChartBar className="text-4xl text-pink-200" />
                </div>
              </div>

              {/* Average Age */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">متوسط العمر</p>
                    <p className="text-3xl font-bold">{stats.avgAge}</p>
                  </div>
                  <FaChartBar className="text-4xl text-purple-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        {selectedGroup && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="بحث عن طالب (الاسم، رقم الهوية، رقم الطالب...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    showFilters || activeFiltersCount > 0
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label="تبديل الفلاتر"
                  title="تبديل الفلاتر">
                  <FaFilter />
                  {activeFiltersCount > 0 && (
                    <span className="bg-white text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* View Mode */}
                <button
                  onClick={() =>
                    setViewMode(viewMode === "table" ? "grid" : "table")
                  }
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  aria-label={viewMode === "table" ? "عرض الشبكة" : "عرض الجدول"}
                  title={viewMode === "table" ? "عرض الشبكة" : "عرض الجدول"}>
                  {viewMode === "table" ? <FaTh /> : <FaList />}
                </button>

                {/* Add Student */}
                <button
                  onClick={handleAddStudent}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 font-medium shadow-lg">
                  <FaPlus />
                  <span className="hidden sm:inline">إضافة طالب</span>
                </button>

                {/* Refresh */}
                <button
                  onClick={fetchStudents}
                  disabled={isLoading}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                  aria-label="تحديث قائمة الطلاب"
                  title="تحديث قائمة الطلاب">
                  <FaSync className={isLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gender Filter */}
                  <div>
                    <label htmlFor="gender-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      الجنس
                    </label>
                    <select
                      id="gender-filter"
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="all">الكل</option>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                </div>

                {/* Reset Filters */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2 text-sm font-medium">
                    <FaTimes />
                    إعادة تعيين الفلاتر
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading State with Skeleton */}
        {isLoading && selectedGroup && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      رقم الطالب
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      الاسم الكامل
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      رقم الهوية
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      العمر
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      الجنس
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      الهاتف
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-fadeIn">
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-16 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer rounded"></div>
                          <div className="h-4 w-28 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                          <div className="h-8 w-8 bg-gradient-to-r from-red-100 via-red-200 to-red-100 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <p className="text-red-800 text-center">{error}</p>
            <button
              onClick={fetchStudents}
              className="mt-4 mx-auto block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* No Students Message */}
        {!isLoading &&
          !error &&
          selectedGroup &&
          processedStudents.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                لا يوجد طلاب
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedGender !== "all"
                  ? "لم يتم العثور على طلاب بهذه المعايير"
                  : "لم يتم إضافة أي طلاب في هذه الحلقة بعد"}
              </p>
              {!searchTerm && selectedGender === "all" && (
                <button
                  onClick={handleAddStudent}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all inline-flex items-center gap-2">
                  <FaPlus />
                  إضافة أول طالب
                </button>
              )}
            </div>
          )}

        {/* Students Table/Grid */}
        {!isLoading &&
          !error &&
          selectedGroup &&
          processedStudents.length > 0 && (
            <>
              {viewMode === "table" ? (
                /* Table View */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th
                            onClick={() => handleSort("studentId")}
                            className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-2">
                              <span>رقم الطالب</span>
                              {sortField === "studentId" &&
                                (sortOrder === "asc" ? (
                                  <FaSortAmountUp />
                                ) : (
                                  <FaSortAmountDown />
                                ))}
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort("firstName")}
                            className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-2">
                              <span>الاسم الكامل</span>
                              {sortField === "firstName" &&
                                (sortOrder === "asc" ? (
                                  <FaSortAmountUp />
                                ) : (
                                  <FaSortAmountDown />
                                ))}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                            رقم الهوية
                          </th>
                          <th
                            onClick={() => handleSort("age")}
                            className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-2">
                              <span>العمر</span>
                              {sortField === "age" &&
                                (sortOrder === "asc" ? (
                                  <FaSortAmountUp />
                                ) : (
                                  <FaSortAmountDown />
                                ))}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                            الجنس
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                            الهاتف
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentStudents.map((student) => (
                          <tr
                            key={student._id}
                            className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.studentId}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.firstName} {student.fatherName}{" "}
                                {student.lastName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {student.idNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {student.age || "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  student.gender === "ذكر"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-pink-100 text-pink-800"
                                }`}>
                                {student.gender}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <FaPhone className="text-emerald-600" />
                                {student.phoneNumber || "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditStudent(student)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="تعديل">
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(student)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="حذف">
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentStudents.map((student) => (
                    <div
                      key={student._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {student.firstName} {student.fatherName}{" "}
                            {student.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            رقم الطالب: {student.studentId}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            student.gender === "ذكر"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}>
                          {student.gender}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaUserGraduate className="text-emerald-600" />
                          <span>رقم الهوية: {student.idNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="text-emerald-600" />
                          <span>{student.phoneNumber || "-"}</span>
                        </div>
                        {student.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaEnvelope className="text-emerald-600" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaMapMarkerAlt className="text-emerald-600" />
                          <span>{student.residence || "-"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                          <FaEdit />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                          <FaTrash />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <ResponsivePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={processedStudents.length}
                    itemsPerPage={studentsPerPage}
                    onPageChange={setCurrentPage}
                    itemName="طالب"
                  />
                </div>
              )}

              {/* Results Info */}
              <div className="mt-4 text-center text-sm text-gray-600">
                عرض {indexOfFirstStudent + 1} إلى{" "}
                {Math.min(indexOfLastStudent, processedStudents.length)} من أصل{" "}
                {processedStudents.length} طالب
              </div>
            </>
          )}
      </div>

      {/* Add/Edit Student Form Modal */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
            {/* Gradient Header */}
            <div
              className={`p-6 ${
                isEditMode
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600"
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    {isEditMode ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
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
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {isEditMode ? "تعديل الطالب" : "إضافة طالب جديد"}
                  </h2>
                </div>
                <button
                  onClick={handleFormClose}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition"
                  title="إغلاق"
                  aria-label="إغلاق">
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
            </div>
            <div className="p-6 max-h-[calc(90vh-88px)] overflow-y-auto">
              <AddStudentFormWithYup
                student={selectedStudent || undefined}
                onSuccess={handleFormSubmit}
                onClose={handleFormClose}
                defaultGroup={selectedGroup}
                restrictToGroup={selectedGroup}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MyStudents;
