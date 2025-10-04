import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaDownload,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUsers,
  FaChalkboardTeacher,
  FaTh,
  FaList,
  FaCalendar,
  FaUserFriends,
  FaBookOpen,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import AddGroupForm from "../../components/Forms/AddGroupForm";
import ResponsivePagination from "../../components/Pagination/ResponsivePagination";
import { getAllGroups, deleteGroup, type Group } from "../../Api/groupApi";
import { type GroupFormData } from "../../Validation/groupValidation";
import Swal from "sweetalert2";
import "../../styles/sweetalert.css";
import { showCenteredSwal, showSuccessMessage, showErrorMessage } from "../../utils/sweetalertUtils";


type SortField = "name" | "teacher" | "capacity";
type SortOrder = "asc" | "desc";

const GroupManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const userRole = currentUser?.role || "";
  const hasPermission = userRole === "teacher" || userRole === "admin";

  // Core States
  const [groups, setGroups] = useState<Group[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [capacityRange, setCapacityRange] = useState<[number, number]>([
    0, 100,
  ]);
  const [showFilters, setShowFilters] = useState(false);

  // Sorting States
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [groupsPerPage, setGroupsPerPage] = useState(10);

  // View Mode State
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selected Groups for Bulk Actions
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  // Extract unique teachers
  const teachers = useMemo(() => {
    return [...new Set(groups.map((g) => g.teacher).filter(Boolean))].sort();
  }, [groups]);

  // Fetch groups with optimized loading and student count
  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🚀 بدء تحميل بيانات الحلقات مع عدد الطلاب المحسن...");
      const startTime = performance.now();

      const result = await getAllGroups();

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      if (result.success && result.data) {
        const cleanedGroups = result.data.map(
          (group: Group & { teacherName?: string }) => ({
            ...group,
            name: group.name || "",
            // دعم البيانات القديمة: استخدم teacherName إذا كان teacher غير موجود
            teacher: group.teacher || group.teacherName || "غير محدد",
            capacity: group.capacity || 30,
            description: group.description || "",
            schedule: group.schedule || "غير محدد",
            isActive: group.isActive !== false,
            currentStudents: group.currentStudents || 0, // عدد الطلاب المشتركين
          })
        );
        const totalStudents = cleanedGroups.reduce(
          (sum, g) => sum + (g.currentStudents || 0),
          0
        );

        console.log(
          `✅ تم تحميل ${cleanedGroups.length} حلقة مع ${totalStudents} طالب مشترك في ${duration}ms`
        );
        console.log(
          `⚡ سرعة التحميل: ${(
            (cleanedGroups.length / parseFloat(duration)) *
            1000
          ).toFixed(0)} حلقة/ثانية`
        );
        console.log("📊 إحصائيات سريعة:", {
          totalGroups: cleanedGroups.length,
          totalStudents,
          avgStudentsPerGroup: (totalStudents / cleanedGroups.length).toFixed(
            1
          ),
        });

        setGroups(cleanedGroups);
        setError(null);
      } else {
        throw new Error(result.message || "البيانات المستلمة غير صحيحة");
      }
    } catch (error: unknown) {
      console.error(`❌ خطأ في تحميل الحلقات:`, error);

      let errorMessage = "حدث خطأ في تحميل البيانات";

      if (error instanceof Error) {
        errorMessage = error.message || "خطأ غير محدد";
      }

      setError(errorMessage);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    fetchGroups();
  }, [hasPermission, fetchGroups]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter and sort groups
  const filteredAndSortedGroups = useMemo(() => {
    const filtered = groups.filter((group) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (group.name || "").toLowerCase().includes(searchLower) ||
        (group.description || "").toLowerCase().includes(searchLower) ||
        (group.teacher || "").toLowerCase().includes(searchLower) ||
        (group.schedule || "").toLowerCase().includes(searchLower);

      const matchesTeacher =
        selectedTeacher === "all" || group.teacher === selectedTeacher;
      const matchesCapacity =
        (group.capacity || 0) >= capacityRange[0] &&
        (group.capacity || 0) <= capacityRange[1];

      return matchesSearch && matchesTeacher && matchesCapacity;
    });

    // Sort
    filtered.sort((a, b) => {
      let compareResult = 0;

      if (sortField === "name") {
        compareResult = (a.name || "").localeCompare(b.name || "", "ar");
      } else if (sortField === "teacher") {
        compareResult = (a.teacher || "").localeCompare(b.teacher || "", "ar");
      } else if (sortField === "capacity") {
        compareResult = (a.capacity || 0) - (b.capacity || 0);
      }

      return sortOrder === "asc" ? compareResult : -compareResult;
    });

    return filtered;
  }, [
    groups,
    searchTerm,
    selectedTeacher,
    capacityRange,
    sortField,
    sortOrder,
  ]);

  // Pagination
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = filteredAndSortedGroups.slice(
    indexOfFirstGroup,
    indexOfLastGroup
  );
  const totalPages = Math.ceil(filteredAndSortedGroups.length / groupsPerPage);

  // Handle delete
  const handleDelete = async (groupId: string) => {
    const result = await showCenteredSwal({
      title: "تأكيد حذف الحلقة",
      text: "هل أنت متأكد من حذف هذه الحلقة؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      customClass: {
        popup: "rtl-popup",
        title: "rtl-title",
      },
    });

    if (result.isConfirmed) {
      try {
        await deleteGroup(groupId);

        setGroups((prevGroups) => prevGroups.filter((g) => g._id !== groupId));

        await showSuccessMessage(
          "تم الحذف!",
          "تم حذف الحلقة بنجاح"
        );
      } catch (deleteError: unknown) {
        console.error("❌ فشل في حذف الحلقة:", deleteError);

        // التعامل مع خطأ وجود طلاب مرتبطين
        const error = deleteError as {
          response?: {
            status: number;
            data: { details: { studentsCount: number }; message: string };
          };
        };
        if (error.response?.status === 400 && error.response?.data?.details) {
          const { studentsCount } = error.response.data.details;

          await showCenteredSwal({
            title: "⚠️ لا يمكن حذف الحلقة ⚠️",
            html: `
              <div class="text-center py-4">
                <div class="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <p class="text-lg font-semibold text-gray-800 mb-2">الحلقة تحتوي على:</p>
                <p class="text-2xl font-bold text-orange-600 mb-2">👥 ${studentsCount} طالب</p>
                <p class="text-sm text-gray-600 mb-2">يجب نقل الطلاب إلى حلقة أخرى أولاً</p>
                <p class="text-xs text-yellow-600">أو إلغاء تسجيلهم من الحلقة</p>
              </div>
            `,
            icon: "warning",
            timer: 7000,
            timerProgressBar: true,
            showConfirmButton: true,
            confirmButtonText: "فهمت",
            customClass: {
              popup: "rtl-popup swal2-rtl-popup swal2-center-popup",
              title: "rtl-title",
              htmlContainer: "rtl-content",
            },
          });
        } else {
          // خطأ عام
          await showErrorMessage(
            "خطأ!",
            error.response?.data?.message || "حدث خطأ أثناء حذف الحلقة"
          );
        }
      }
    }
  };

  // Handle edit
  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setIsEditMode(true);
    setIsFormVisible(true);
  };

  // Handle add/edit success
  const handleAddSuccess = async (data?: Group | GroupFormData) => {
    try {
      console.log("تمت العملية بنجاح:", data);
      fetchGroups();
      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedGroup(null);

      // SweetAlert for success
      await showSuccessMessage(
        isEditMode ? "تم التحديث!" : "تم الإضافة!",
        isEditMode
          ? "تم تحديث بيانات الحلقة بنجاح"
          : "تم إضافة الحلقة الجديدة بنجاح"
      );
    } catch (error) {
      console.error("خطأ في حفظ الحلقة:", error);

      await showErrorMessage(
        "خطأ!",
        "حدث خطأ أثناء حفظ بيانات الحلقة"
      );
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "اسم الحلقة",
      "المعلم",
      "السعة",
      "الطلاب المشتركين",
      "المواعيد",
      "الوصف",
    ];
    const rows = filteredAndSortedGroups.map((g) => [
      g.name,
      g.teacher,
      g.capacity,
      g.currentStudents || 0,
      g.schedule || "",
      g.description || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `groups_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedTeacher("all");
    setCapacityRange([0, 100]);
    setCurrentPage(1);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedGroups.size === 0) return;

    const result = await showCenteredSwal({
      title: `حذف ${selectedGroups.size} حلقة`,
      text: "هل أنت متأكد من حذف الحلقات المحددة؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف الكل",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          Array.from(selectedGroups).map((id) => deleteGroup(id))
        );

        setGroups((prev) =>
          prev.filter((g) => !selectedGroups.has(g._id || ""))
        );
        setSelectedGroups(new Set());

        await showSuccessMessage(
          "تم الحذف!",
          "تم حذف الحلقات بنجاح",
          `${selectedGroups.size} حلقة`
        );
      } catch (bulkDeleteError) {
        console.error("❌ فشل في حذف الحلقات:", bulkDeleteError);
        await showErrorMessage(
          "خطأ!",
          "حدث خطأ أثناء حذف الحلقات"
        );
      }
    }
  };

  // Toggle group selection
  const toggleGroupSelection = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  // Select all groups
  const selectAllGroups = () => {
    if (selectedGroups.size === currentGroups.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(currentGroups.map((g) => g._id || "")));
    }
  };

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaUsers className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6"
        dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 text-right">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <FaUsers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      إدارة الحلقات
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                      إدارة وتنظيم حلقات تحفيظ القرآن الكريم
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExport}
                  disabled={filteredAndSortedGroups.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed">
                  <FaDownload className="w-4 h-4" />
                  تصدير
                </button>

                <button
                  onClick={() => {
                    setSelectedGroup(null);
                    setIsEditMode(false);
                    setIsFormVisible(true);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
                  <FaPlus className="w-4 h-4" />
                  إضافة حلقة جديدة
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 w-full">
              {/* Search and Controls in one row */}
              <div className="flex flex-wrap gap-4 w-full items-center">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-80">
                  <input
                    type="text"
                    placeholder="ابحث عن حلقة (الاسم، المعلم، المواعيد...)"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-right"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                        viewMode === 'table'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                      }`}
                      title="عرض جدول"
                    >
                      <FaList className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        جدول
                      </span>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                      }`}
                      title="عرض شبكة"
                    >
                      <FaTh className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        شبكة
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl transition-all ${
                      showFilters
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <FaFilter className="w-4 h-4" />
                    <span className="hidden sm:inline">فلاتر</span>
                  </button>

                  <button
                    onClick={resetFilters}
                    className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                    title="إعادة تعيين الفلاتر"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {selectedGroups.size > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                    >
                      <FaTrash className="w-4 h-4" />
                      <span>حذف ({selectedGroups.size})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Extended Filters */}
              {showFilters && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المعلم
                      </label>
                      <select
                        value={selectedTeacher}
                        onChange={(e) => {
                          setSelectedTeacher(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all">
                          جميع المعلمين ({teachers.length})
                        </option>
                        {teachers.map((teacher) => (
                          <option key={teacher} value={teacher}>
                            {teacher}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        السعة: {capacityRange[0]} - {capacityRange[1]}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={capacityRange[1]}
                        onChange={(e) =>
                          setCapacityRange([
                            capacityRange[0],
                            parseInt(e.target.value),
                          ])
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نطاق السعة
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={capacityRange[0]}
                          onChange={(e) =>
                            setCapacityRange([
                              parseInt(e.target.value),
                              capacityRange[1],
                            ])
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={capacityRange[1]}
                          onChange={(e) =>
                            setCapacityRange([
                              capacityRange[0],
                              parseInt(e.target.value),
                            ])
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عرض
                      </label>
                      <select
                        value={groupsPerPage}
                        onChange={(e) => {
                          setGroupsPerPage(parseInt(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="5">5 حلقات</option>
                        <option value="10">10 حلقات</option>
                        <option value="25">25 حلقة</option>
                        <option value="50">50 حلقة</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Loading State - Table Skeleton */}
          {isLoading && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-right">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <div className="h-4 w-14 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.from({ length: groupsPerPage }, (_, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-18 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl px-6 py-4 mt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">حدث خطأ</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchGroups()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                إعادة المحاولة
              </button>
            </div>
          )}
          {/* Table View */}
          {!isLoading && !error && viewMode === "table" && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-right">
                        <input
                          type="checkbox"
                          checked={
                            selectedGroups.size === currentGroups.length &&
                            currentGroups.length > 0
                          }
                          onChange={selectAllGroups}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th
                        className="px-6 py-4 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort("name")}>
                        <div className="flex items-center gap-2">
                          <span>اسم الحلقة</span>
                          {sortField === "name" &&
                            (sortOrder === "asc" ? (
                              <FaSortAmountUp />
                            ) : (
                              <FaSortAmountDown />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort("teacher")}>
                        <div className="flex items-center gap-2">
                          <span>المعلم</span>
                          {sortField === "teacher" &&
                            (sortOrder === "asc" ? (
                              <FaSortAmountUp />
                            ) : (
                              <FaSortAmountDown />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort("capacity")}>
                        <div className="flex items-center gap-2">
                          <span>السعة القصوى</span>
                          {sortField === "capacity" &&
                            (sortOrder === "asc" ? (
                              <FaSortAmountUp />
                            ) : (
                              <FaSortAmountDown />
                            ))}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                        الطلاب المشتركين
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                        المواعيد
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                        الوصف
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentGroups.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">
                            لا توجد حلقات
                          </p>
                        </td>
                      </tr>
                    ) : (
                      currentGroups.map((group, index) => (
                        <tr
                          key={group._id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors`}>
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedGroups.has(group._id || "")}
                              onChange={() =>
                                toggleGroupSelection(group._id || "")
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {group.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              <FaChalkboardTeacher className="w-3 h-3" />
                              {group.teacher}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                              <FaUsers className="w-3 h-3" />
                              {group.capacity} طالب
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                    group.isFull
                                      ? "bg-red-100 text-red-700"
                                      : (group.capacityPercentage || 0) >= 80
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                  }`}>
                                  <FaUserFriends className="w-3 h-3" />
                                  {group.capacityStatus || `${group.currentStudents || 0}/${group.capacity || 30}`}
                                </span>
                                {group.isFull && (
                                  <span className="text-red-500 text-xs font-bold">
                                    ممتلئة
                                  </span>
                                )}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 relative">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 absolute top-0 left-0 ${
                                    group.isFull
                                      ? "bg-red-500"
                                      : (group.capacityPercentage || 0) >= 80
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  } ${
                                    (group.capacityPercentage || 0) >= 100 ? "w-full" :
                                    (group.capacityPercentage || 0) >= 90 ? "w-11/12" :
                                    (group.capacityPercentage || 0) >= 80 ? "w-4/5" :
                                    (group.capacityPercentage || 0) >= 70 ? "w-3/5" :
                                    (group.capacityPercentage || 0) >= 50 ? "w-1/2" :
                                    (group.capacityPercentage || 0) >= 30 ? "w-1/3" :
                                    (group.capacityPercentage || 0) >= 20 ? "w-1/5" :
                                    (group.capacityPercentage || 0) >= 10 ? "w-1/12" : "w-0"
                                  }`}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 text-center">
                                {group.capacityPercentage || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-gray-600 text-sm">
                              <FaCalendar className="w-3 h-3" />
                              {group.schedule || "غير محدد"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {group.description || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(group)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="تعديل">
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(group._id || "")}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="حذف">
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Grid View Loading Skeleton */}
          {isLoading && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: groupsPerPage }, (_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                      <div>
                        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
                    </div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Grid View */}
          {!isLoading && !error && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
              {currentGroups.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl shadow-xl p-16 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
                    <FaUsers className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    لا توجد حلقات
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    لم يتم العثور على أي حلقات. قم بإضافة حلقة جديدة.
                  </p>
                </div>
              ) : (
                currentGroups.map((group) => (
                  <div
                    key={group._id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
                    {/* Card Header with Gradient */}
                    <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-6 text-center">
                      {/* Group Avatar */}
                      <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/30">
                          <FaBookOpen className="w-12 h-12 text-orange-600" />
                        </div>
                        {/* Capacity Badge */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg">
                          <span className="text-orange-600 font-bold text-sm">
                            {group.capacity || 30} طالب
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          (group.currentStudents || 0) >= (group.capacity || 30)
                            ? "bg-red-100 text-red-800"
                            : (group.currentStudents || 0) >= (group.capacity || 30) * 0.8
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {(group.currentStudents || 0) >= (group.capacity || 30) ? 'ممتلئة' : 'متاحة'}
                        </span>
                      </div>

                      {/* Group Name */}
                      <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
                        {group.name}
                      </h3>
                      <p className="text-orange-100 text-sm drop-shadow">
                        {group.teacher || 'غير محدد'}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      {/* Teacher Information */}
                      {group.teacher && (
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaChalkboardTeacher className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">المعلم</p>
                            <p className="text-sm font-semibold text-purple-700 truncate">
                              {group.teacher}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Schedule Information */}
                      {group.schedule && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaCalendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">موعد الحلقة</p>
                            <p className="text-sm font-semibold text-blue-700">
                              {group.schedule}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Students Count with Progress */}
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FaUserFriends className="w-4 h-4 text-green-600" />
                            <p className="text-xs text-gray-500">الطلاب المشتركين</p>
                          </div>
                          <span className={`font-bold text-sm ${
                            (group.currentStudents || 0) >= (group.capacity || 30)
                              ? "text-red-600"
                              : (group.currentStudents || 0) >= (group.capacity || 30) * 0.8
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}>
                            {group.currentStudents || 0}/{group.capacity || 30}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 relative">
                          <div
                            className={`h-2 rounded-full transition-all absolute top-0 left-0 ${
                              (group.currentStudents || 0) >= (group.capacity || 30)
                                ? "bg-red-500"
                                : (group.currentStudents || 0) >= (group.capacity || 30) * 0.8
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            } ${
                              ((group.currentStudents || 0) / (group.capacity || 30)) * 100 >= 100 ? "w-full" :
                              ((group.currentStudents || 0) / (group.capacity || 30)) * 100 >= 90 ? "w-11/12" :
                              ((group.currentStudents || 0) / (group.capacity || 30)) * 100 >= 80 ? "w-4/5" :
                              ((group.currentStudents || 0) / (group.capacity || 30)) * 100 >= 70 ? "w-3/5" :
                              ((group.currentStudents || 0) / (group.capacity || 30)) * 100 >= 50 ? "w-1/2" :
                              ((group.currentStudents || 0) / (group.capacity || 30)) * 100 >= 30 ? "w-1/3" :
                              ((group.currentStudents || 0) / (group.capacity || 30)) * 100 >= 20 ? "w-1/5" :
                              ((group.currentStudents || 0) / (group.capacity || 30)) * 100 >= 10 ? "w-1/12" : "w-0"
                            }`}>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {group.description && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">الوصف</p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {group.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer - Actions */}
                    <div className="px-6 pb-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(group)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                          <FaEdit className="w-4 h-4" />
                          <span className="font-medium">تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDelete(group._id || "")}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                          <FaTrash className="w-4 h-4" />
                          <span className="font-medium">حذف</span>
                        </button>
                      </div>

                      {/* Checkbox for bulk selection */}
                      <div className="mt-3 flex items-center justify-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedGroups.has(group._id || "")}
                            onChange={() => toggleGroupSelection(group._id || "")}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-600">تحديد للحذف الجماعي</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {/* Enhanced Responsive Pagination */}
          {!isLoading && !error && filteredAndSortedGroups.length > 0 && (
            <ResponsivePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedGroups.length}
              itemsPerPage={groupsPerPage}
              onPageChange={setCurrentPage}
              itemName="حلقة"
              showQuickJump={true}
            />
          )}{" "}
          {/* Add/Edit Form Modal */}
          {isFormVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? "تعديل الحلقة" : "إضافة حلقة جديدة"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsFormVisible(false);
                      setIsEditMode(false);
                      setSelectedGroup(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-2xl text-gray-500">×</span>
                  </button>
                </div>
                <div className="p-6">
                  <AddGroupForm
                    group={isEditMode ? selectedGroup : undefined}
                    onSuccess={handleAddSuccess}
                    onClose={() => {
                      setIsFormVisible(false);
                      setIsEditMode(false);
                      setSelectedGroup(null);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Responsive pagination styles */
        @media (max-width: 480px) {
          .pagination-mobile {
            gap: 0.25rem;
          }
          .pagination-button-mobile {
            min-width: 28px;
            height: 28px;
            font-size: 11px;
            padding: 0.25rem;
          }
        }
        
        @media (min-width: 481px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </>
  );
};

export default GroupManagement;
