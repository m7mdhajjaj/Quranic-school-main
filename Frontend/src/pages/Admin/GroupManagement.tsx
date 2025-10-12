import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  FaTimes,
  FaSync,
  FaUserGraduate,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import AddGroupForm from "../../components/Forms/AddGroupForm";
import ResponsivePagination from "../../components/Pagination/ResponsivePagination";
import {
  getAllGroups,
  deleteGroup,
  // createGroup, // TODO: Will be used in form submission
  // updateGroup, // TODO: Will be used in edit functionality
  // getGroupsByTeacher, // Not used - filtering done in frontend
  type Group,
} from "../../Api/groupApi";
import { getAllTeachers } from "../../Api/teacherApi";
import { type GroupFormData } from "../../Validation/groupValidation";
import {
  showCenteredSwal,
  showSuccessMessage,
  showErrorMessage,
} from "../../utils/sweetalertUtils";

type SortField = "name" | "teacher" | "capacity";
type SortOrder = "asc" | "desc";

const GroupManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  // Socket temporarily disabled for groups - can be added later
  // const { onGroupUpdate, offGroupUpdate, isConnected } = useSocket();
  const isConnected = false; // Fallback mode - will show auto refresh indicator
  const userRole = currentUser?.role || "";
  const hasPermission = userRole === "teacher" || userRole === "admin";

  // Core States
  const [groups, setGroups] = useState<Group[]>([]);
  const [allTeachers, setAllTeachers] = useState<string[]>([]); // All teachers list
  const teachersFetched = useRef(false); // Track if teachers were fetched
  const initialLoadDone = useRef(false); // Track initial load
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

  // Active Filters Count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedTeacher !== "all") count++;
    if (capacityRange[0] !== 0 || capacityRange[1] !== 100) count++;
    if (searchTerm) count++;
    return count;
  }, [selectedTeacher, capacityRange, searchTerm]);

  // Fetch all teachers for filter dropdown
  const fetchTeachers = useCallback(async () => {
    if (teachersFetched.current) return; // Prevent multiple fetches

    try {
      console.log("🔍 بدء جلب المعلمين للفلتر...");
      const result = await getAllTeachers();
      console.log("📊 نتيجة جلب المعلمين:", result);

      if (result.success && result.data && Array.isArray(result.data)) {
        console.log("✅ عدد المعلمين:", result.data.length);

        if (result.data.length === 0) {
          console.warn("⚠️ لا يوجد معلمين في قاعدة البيانات");
          teachersFetched.current = true;
          return;
        }

        // استخراج أسماء المعلمين: firstName + lastName
        const teacherNames = result.data
          .map((teacher: any) => {
            // جرب مختلف التنسيقات
            if (teacher.name) return teacher.name;
            if (teacher.firstName && teacher.lastName) {
              return `${teacher.firstName} ${teacher.lastName}`;
            }
            if (teacher.firstName) return teacher.firstName;
            return null;
          })
          .filter(Boolean)
          .sort();

        console.log("📝 أسماء المعلمين:", teacherNames);
        setAllTeachers(teacherNames);
        teachersFetched.current = true;
      } else {
        console.warn("⚠️ استجابة غير صالحة من الخادم:", result);
        teachersFetched.current = true;
      }
    } catch (error) {
      console.error("❌ خطأ في جلب المعلمين:", error);
      teachersFetched.current = true;
    }
  }, []);

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

  // Initial load
  useEffect(() => {
    if (!hasPermission) return;

    fetchGroups();
    fetchTeachers();
    initialLoadDone.current = true;

    // Auto refresh every 30 seconds as fallback when socket not connected
    const refreshInterval = setInterval(() => {
      if (!isConnected) {
        console.log("🔄 تحديث تلقائي للحلقات (وضع احتياطي)");
        fetchGroups(); // Always fetch all groups, filtering is done in frontend
        // Don't refetch teachers in auto-refresh
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [hasPermission, fetchGroups, fetchTeachers, isConnected]);

  // Fallback: Use teachers from groups if API returns empty (only once)
  useEffect(() => {
    if (
      teachersFetched.current &&
      allTeachers.length === 0 &&
      groups.length > 0
    ) {
      const teachersFromGroups = [
        ...new Set(groups.map((g) => g.teacher).filter(Boolean)),
      ].sort();
      if (teachersFromGroups.length > 0) {
        console.log(
          "📋 استخدام المعلمين من الحلقات كخطة احتياطية:",
          teachersFromGroups
        );
        setAllTeachers(teachersFromGroups);
      }
    }
  }, [groups]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter and sort groups (all filtering done in frontend)
  const filteredAndSortedGroups = useMemo(() => {
    console.log("🔍 بدء فلترة الحلقات...", {
      totalGroups: groups.length,
      selectedTeacher,
      searchTerm,
    });

    const filtered = groups.filter((group) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (group.name || "").toLowerCase().includes(searchLower) ||
        (group.description || "").toLowerCase().includes(searchLower) ||
        (group.teacher || "").toLowerCase().includes(searchLower) ||
        (group.schedule || "").toLowerCase().includes(searchLower);

      const matchesTeacher =
        selectedTeacher === "all" || group.teacher === selectedTeacher;

      const matchesCapacity =
        (group.capacity || 0) >= capacityRange[0] &&
        (group.capacity || 0) <= capacityRange[1];

      const matches = matchesSearch && matchesTeacher && matchesCapacity;

      if (!matches && selectedTeacher !== "all") {
        console.log("❌ حلقة لم تطابق الفلتر:", {
          name: group.name,
          teacher: group.teacher,
          selectedTeacher,
          matchesTeacher,
        });
      }

      return matches;
    }); // Sort
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

    console.log("✅ نتيجة الفلترة:", {
      إجمالي_الحلقات: groups.length,
      الحلقات_المفلترة: filtered.length,
      المعلم_المختار: selectedTeacher,
      نص_البحث: searchTerm || "لا يوجد",
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

        await showSuccessMessage("تم الحذف!", "تم حذف الحلقة بنجاح");
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

      await showErrorMessage("خطأ!", "حدث خطأ أثناء حفظ بيانات الحلقة");
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

  // Note: Teacher filtering is now done in frontend only (filteredAndSortedGroups)
  // No need for API-based filtering as it causes issues with auto-refresh  // Bulk delete
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
        await showErrorMessage("خطأ!", "حدث خطأ أثناء حذف الحلقات");
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
        <div className="max-w-full mx-auto px-2">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 text-right">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-xl">
                    <FaUsers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      إدارة الحلقات
                    </h1>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <p className="text-gray-600">
                        إدارة وتنظيم حلقات تحفيظ القرآن الكريم
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isConnected ? "bg-green-500" : "bg-yellow-500"
                          } animate-pulse`}></div>
                        <span
                          className={`text-xs ${
                            isConnected ? "text-green-600" : "text-yellow-600"
                          }`}>
                          {isConnected ? "متصل مباشرة" : "تحديث تلقائي"}
                        </span>
                      </div>
                    </div>
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="relative md:col-span-8">
                  <input
                    type="text"
                    placeholder="ابحث عن حلقة (الاسم، المعلم، المواعيد...)"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="مسح البحث">
                      <FaTimes className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 md:col-span-4">
                  {/* View Mode Toggle */}
                  <div className="flex-1 flex items-center border border-gray-300 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                        viewMode === "table"
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      title="عرض جدول">
                      <FaList className="w-4 h-4" />
                      <span className="text-xs font-medium hidden sm:inline">
                        جدول
                      </span>
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                        viewMode === "grid"
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      title="عرض شبكة">
                      <FaTh className="w-4 h-4" />
                      <span className="text-xs font-medium hidden sm:inline">
                        شبكة
                      </span>
                    </button>
                  </div>

                  {/* Filter Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`relative flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl transition-all ${
                      showFilters
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-300 hover:border-blue-400"
                    }`}>
                    <FaFilter className="w-4 h-4" />
                    <span className="hidden sm:inline">فلاتر</span>
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Reset Filters */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                      title="إعادة تعيين الفلاتر">
                      <FaSync className="w-5 h-5 text-gray-600" />
                    </button>
                  )}

                  {selectedGroups.size > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">
                      <FaTrash className="w-4 h-4" />
                      <span>حذف ({selectedGroups.size})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-100 shadow-xl animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FaFilter className="text-blue-600" />
                    الفلاتر المتقدمة
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                    title="إغلاق">
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Teacher Filter */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <FaChalkboardTeacher className="text-blue-600" />
                      المعلم
                    </label>
                    <select
                      value={selectedTeacher}
                      onChange={(e) => {
                        setSelectedTeacher(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white">
                      <option value="all">
                        جميع المعلمين ({allTeachers.length})
                      </option>
                      {allTeachers.map((teacher) => (
                        <option key={teacher} value={teacher}>
                          {teacher}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Capacity Range Filter */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <FaUsers className="text-purple-600" />
                      نطاق السعة
                    </label>
                    <div className="flex gap-2 items-center justify-between mb-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={capacityRange[0]}
                        onChange={(e) =>
                          setCapacityRange([
                            parseInt(e.target.value) || 0,
                            capacityRange[1],
                          ])
                        }
                        className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-center font-bold"
                      />
                      <span className="text-gray-400 font-bold">←</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={capacityRange[1]}
                        onChange={(e) =>
                          setCapacityRange([
                            capacityRange[0],
                            parseInt(e.target.value) || 100,
                          ])
                        }
                        className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-center font-bold"
                      />
                    </div>
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
                      className="w-full accent-purple-600"
                    />
                    <p className="text-xs text-gray-500 text-center mt-1">
                      من {capacityRange[0]} إلى {capacityRange[1]} طالب
                    </p>
                  </div>

                  {/* Items Per Page Filter */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <FaTh className="text-green-600" />
                      عدد العرض
                    </label>
                    <select
                      value={groupsPerPage}
                      onChange={(e) => {
                        setGroupsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white font-medium">
                      <option value="5">5 حلقات</option>
                      <option value="10">10 حلقات</option>
                      <option value="25">25 حلقة</option>
                      <option value="50">50 حلقة</option>
                      <option value="100">100 حلقة</option>
                    </select>
                  </div>

                  {/* Reset Filters Button */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center justify-center">
                    <button
                      onClick={() => {
                        setSelectedTeacher("all");
                        setCapacityRange([0, 100]);
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium">
                      <FaSync className="w-4 h-4" />
                      إعادة تعيين
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {/* إجمالي الحلقات */}
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    إجمالي الحلقات
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {groups.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* إجمالي الطلاب المشتركين */}
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    إجمالي الطلاب
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {groups.reduce((total, group) => total + (group.currentStudents || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-md">
                  <FaUserGraduate className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* الحلقات الممتلئة */}
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">حلقات ممتلئة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {groups.filter(g => g.isFull || (g.currentStudents && g.capacity && g.currentStudents >= g.capacity)).length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* حلقات فارغة */}
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    حلقات فارغة
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {groups.filter(g => (g.currentStudents || 0) === 0).length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* السعة الإجمالية */}
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    السعة الإجمالية
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {groups.reduce((total, group) => total + (group.capacity || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* المقاعد المتاحة */}
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">مقاعد متاحة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const totalCapacity = groups.reduce((total, group) => total + (group.capacity || 0), 0);
                      const totalStudents = groups.reduce((total, group) => total + (group.currentStudents || 0), 0);
                      return Math.max(0, totalCapacity - totalStudents);
                    })()}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

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
                      الجدول الأسبوعي
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
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            group.teacher === "غير محدد" 
                              ? "bg-gray-100 text-gray-600" 
                              : "bg-blue-100 text-blue-700"
                          }`}>
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
                                {group.capacityStatus ||
                                  `${group.currentStudents || 0}/${
                                    group.capacity || 30
                                  }`}
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
                                  (group.capacityPercentage || 0) >= 100
                                    ? "w-full"
                                    : (group.capacityPercentage || 0) >= 90
                                    ? "w-11/12"
                                    : (group.capacityPercentage || 0) >= 80
                                    ? "w-4/5"
                                    : (group.capacityPercentage || 0) >= 70
                                    ? "w-3/5"
                                    : (group.capacityPercentage || 0) >= 50
                                    ? "w-1/2"
                                    : (group.capacityPercentage || 0) >= 30
                                    ? "w-1/3"
                                    : (group.capacityPercentage || 0) >= 20
                                    ? "w-1/5"
                                    : (group.capacityPercentage || 0) >= 10
                                    ? "w-1/12"
                                    : "w-0"
                                }`}></div>
                            </div>
                            <span className="text-xs text-gray-500 text-center">
                              {group.capacityPercentage || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {group.timetable && group.timetable.length > 0 ? (
                            <div className="space-y-1">
                              {group.timetable.map(
                                (session: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 text-xs bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                    <FaCalendar className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                    <span className="font-medium text-blue-900">
                                      {session.day}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-blue-700 font-semibold">
                                      {session.startHour} - {session.endHour}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-500 text-sm">
                              <FaCalendar className="w-3 h-3" />
                              لا يوجد جدول
                            </span>
                          )}
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
                className="bg-white rounded-xl shadow-lg border border-gray-100 w-full">
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                    </div>
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Grid View */}
        {!isLoading && !error && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {currentGroups.length === 0 ? (
              <div className="col-span-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl p-16 text-center border-2 border-dashed border-gray-300">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUsers className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد حلقات</h3>
                <p className="text-gray-500">ابدأ بإضافة حلقة جديدة لتظهر هنا</p>
              </div>
            ) : (
              currentGroups.map((group) => (
                <div
                  key={group._id}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-100 hover:border-blue-300 transform hover:-translate-y-2 hover:scale-105">
                  
                  {/* Card Header - Islamic Design */}
                  <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-6">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                        group.isFull
                          ? "bg-red-500 text-white"
                          : (group.capacityPercentage || 0) >= 80
                          ? "bg-yellow-500 text-white"
                          : "bg-green-500 text-white"
                      }`}>
                        {group.isFull ? "ممتلئة" : (group.capacityPercentage || 0) >= 80 ? "شبه ممتلئة" : "متاحة"}
                      </span>
                    </div>

                    {/* Main Icon */}
                    <div className="text-center relative z-10">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
                        <FaUsers className="w-10 h-10 text-blue-600" />
                      </div>
                      
                      {/* Group Name */}
                      <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                        {group.name}
                      </h3>
                      
                      {/* Capacity Info */}
                      <div className="flex items-center justify-center gap-2 text-white/90 text-sm">
                        <span>السعة:</span>
                        <span className="bg-white/20 px-2 py-1 rounded-full font-semibold">
                          {group.capacity} طالب
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-5">
                    {/* Teacher Section */}
                    <div className={`flex items-center gap-4 p-4 rounded-2xl ${
                      group.teacher === "غير محدد" 
                        ? "bg-gray-50 border-2 border-gray-200 border-dashed" 
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                    }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        group.teacher === "غير محدد" 
                          ? "bg-gray-200" 
                          : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      }`}>
                        <FaChalkboardTeacher className={`w-6 h-6 ${
                          group.teacher === "غير محدد" ? "text-gray-500" : "text-white"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 mb-1">المعلم المسؤول</p>
                        <p className={`font-bold text-lg ${
                          group.teacher === "غير محدد" 
                            ? "text-gray-600" 
                            : "text-blue-700"
                        }`}>
                          {group.teacher}
                        </p>
                      </div>
                    </div>

                    {/* Students Progress */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <FaUserFriends className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600">الطلاب المسجلين</p>
                            <p className="text-lg font-bold text-purple-700">
                              {group.currentStudents || 0} / {group.capacity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            (group.currentStudents || 0) === 0 
                              ? "bg-gray-100 text-gray-600" 
                              : group.isFull 
                              ? "bg-red-100 text-red-700"
                              : (group.capacityPercentage || 0) >= 80
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {(group.currentStudents || 0) === 0 ? "فارغة" : group.isFull ? "ممتلئة" : "متاحة"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-3 rounded-full transition-all duration-700 ${
                            (group.currentStudents || 0) === 0
                              ? "bg-gray-400"
                              : group.isFull
                              ? "bg-gradient-to-r from-red-400 to-red-600"
                              : (group.capacityPercentage || 0) >= 80
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                              : "bg-gradient-to-r from-green-400 to-emerald-600"
                          }`}
                          style={{ width: `${group.capacityPercentage || 0}%` }}>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 text-center mt-2 font-medium">
                        {group.capacityPercentage || 0}% من السعة الإجمالية
                      </p>
                    </div>

                    {/* Schedule Section */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-2xl border border-amber-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
                          <FaCalendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-amber-800">المواعيد الأسبوعية</p>
                          <p className="text-xs text-amber-600">جدول الحصص</p>
                        </div>
                      </div>
                      
                      {group.timetable && group.timetable.length > 0 ? (
                        <div className="space-y-2">
                          {group.timetable.map((session: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-300 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                  <span className="text-xs font-bold text-amber-800">
                                    {session.day.charAt(0)}
                                  </span>
                                </div>
                                <span className="font-semibold text-amber-800">
                                  {session.day}
                                </span>
                              </div>
                              <div className="bg-amber-100 px-3 py-1 rounded-full">
                                <span className="text-xs font-bold text-amber-700">
                                  {session.startHour} - {session.endHour}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-amber-600 text-lg">📅</span>
                          </div>
                          <p className="text-sm text-amber-700 font-medium">لم يتم تحديد مواعيد</p>
                          <p className="text-xs text-amber-600">يمكن إضافة المواعيد لاحقاً</p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {group.description && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {group.description}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Card Footer */}
                  <div className="bg-gray-50 px-6 py-5 border-t border-gray-100">
                    {/* Available Spots Alert */}
                    {(group.currentStudents || 0) === 0 ? (
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-sm">⚠️</span>
                          </div>
                          <p className="text-sm font-semibold text-orange-700">حلقة فارغة - تحتاج لطلاب</p>
                        </div>
                      </div>
                    ) : !group.isFull && (
                      <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600 text-sm">✓</span>
                            </div>
                            <p className="text-sm font-semibold text-emerald-700">مقاعد متاحة</p>
                          </div>
                          <span className="bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold text-emerald-700">
                            {(group.capacity || 0) - (group.currentStudents || 0)} مقعد
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={() => handleEdit(group)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <FaEdit className="w-4 h-4" />
                        <span className="font-bold">تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDelete(group._id || "")}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <FaTrash className="w-4 h-4" />
                        <span className="font-bold">حذف</span>
                      </button>
                    </div>

                    {/* Selection Checkbox */}
                    <div className="flex items-center justify-center">
                      <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedGroups.has(group._id || "")}
                          onChange={() => toggleGroupSelection(group._id || "")}
                          className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                        />
                        <span className="text-sm text-gray-600 font-medium group-hover:text-gray-800">
                          تحديد للحذف الجماعي
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* Enhanced Responsive Pagination */}
        {!isLoading &&
          !error &&
          filteredAndSortedGroups.length > 0 &&
          totalPages > 1 && (
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
