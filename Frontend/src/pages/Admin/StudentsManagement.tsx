import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaDownload,
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
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import {
  getAllStudents,
  deleteStudent,
  getStudentStats,
  searchStudents,
  bulkDeleteStudents,
  type Student as ApiStudent,
} from '../../Api/studentApi';

import AddStudentFormWithYup from '../../components/Forms/AddStudentForm';
import ResponsivePagination from '../../components/Pagination/ResponsivePagination';
import Avatar from '../../components/Avatar';
import {
  showCenteredSwal,
  showSuccessMessage,
  showWarningMessage,
  showErrorMessage,
} from '../../utils/sweetalertUtils';

// استخدام Student من API
type Student = ApiStudent;

type SortField = 'studentId' | 'firstName' | 'age' | 'group';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

const StudentsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { onStudentUpdate, offStudentUpdate, isConnected } = useSocket();
  const userRole = currentUser?.role || '';
  const hasPermission = userRole === 'teacher' || userRole === 'admin';

  // Core States
  const [students, setStudents] = useState<Student[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [groupsFilter, setGroupsFilter] = useState<'all' | 'withGroups' | 'withoutGroups'>('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  // Sorting States
  const [sortField, setSortField] = useState<SortField>('studentId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  // View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Selected Students for Bulk Actions
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );



  // Enhanced statistics with API integration
  const [apiStats, setApiStats] = useState<{
    totalStudents: number;
    activeStudents: number;
    maleStudents: number;
    femaleStudents: number;
    byGroup: Array<{ group: string; count: number }>;
  } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await getStudentStats();
        if (result.success && result.data) {
          setApiStats(result.data);
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل الإحصائيات:', error);
      }
    };
    if (students.length > 0) {
      loadStats();
    }
  }, [students.length]);

  // Statistics
  const stats = useMemo(() => {
    const maleCount = students.filter((s) => s.gender === 'ذكر').length;
    const femaleCount = students.filter((s) => s.gender === 'أنثى').length;
    const avgAge =
      students.length > 0
        ? (
            students.reduce((sum, s) => sum + (s.age || 0), 0) / students.length
          ).toFixed(1)
        : 0;

    // حساب الطلاب الذين لديهم حلقات وبدون حلقات
    const withGroupCount = students.filter((s) => 
      s.group && 
      s.group.trim() !== '' && 
      s.group.toLowerCase() !== 'غير محدد' &&
      s.group.toLowerCase() !== 'undefined' &&
      s.group !== null
    ).length;
    const withoutGroupCount = students.length - withGroupCount;

    // Use API stats if available, otherwise calculate from local data
    if (apiStats) {
      const apiActiveStudents = apiStats.activeStudents || withGroupCount;
      const apiInactiveStudents = (apiStats.totalStudents || students.length) - apiActiveStudents;
      
      return {
        total: apiStats.totalStudents || students.length,
        male: apiStats.maleStudents || maleCount,
        female: apiStats.femaleStudents || femaleCount,
        active: apiActiveStudents, // الطلاب الذين لديهم حلقات
        inactive: apiInactiveStudents, // الطلاب بدون حلقات
        avgAge: avgAge, // Calculate from local data as API doesn't provide this
      };
    }

    return {
      total: students.length,
      male: maleCount,
      female: femaleCount,
      active: withGroupCount, // الطلاب الذين لديهم حلقات
      inactive: withoutGroupCount, // الطلاب بدون حلقات
      avgAge,
    };
  }, [students, apiStats]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGender !== 'all') count++;
    if (groupsFilter !== 'all') count++;
    if (ageRange[0] !== 0 || ageRange[1] !== 100) count++;
    if (searchTerm) count++;
    return count;
  }, [selectedGender, groupsFilter, ageRange, searchTerm]);

  // Fetch students using the new API system
  const fetchStudents = useCallback(async (retryAttempt = 0) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setRetryCount(retryAttempt);

    try {
      const startTime = performance.now();
      const result = await getAllStudents();

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      if (result.success && result.data) {
        const cleanedStudents = result.data.map((student) => ({
          ...student,
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          fatherName: student.fatherName || '',
          idNumber: student.idNumber || '',
          teacher: student.teacher || 'غير محدد',
          group: student.group || 'غير محدد',
          gender: student.gender || 'غير محدد',
          age: student.age || 0,
        }));

        console.log(
          `✅ تم تحميل ${cleanedStudents.length} طالب بنجاح في ${duration}ms`
        );
        setStudents(cleanedStudents);
        setError(null);
        setRetryCount(0);
      } else {
        throw new Error(result.message || 'البيانات المستلمة غير صحيحة');
      }
    } catch (error: unknown) {
      console.error('❌ خطأ في تحميل الطلاب:', error);
      let errorMessage = 'حدث خطأ في تحميل البيانات';

      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message === 'canceled') {
          return;
        } else {
          errorMessage = error.message || 'خطأ غير محدد';
        }
      }

      setError(errorMessage);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    fetchStudents();
  }, [hasPermission, fetchStudents]);

  // Socket handlers for real-time updates
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  // Track last refresh time for display

  useEffect(() => {
    if (!hasPermission) return;

    const handleStudentUpdate = (event: {
      type: 'created' | 'updated' | 'deleted';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      student: any;
      studentId?: string;
    }) => {
      const now = Date.now();
      if (now - lastUpdateTime < 300) return; // Debounce updates
      setLastUpdateTime(now);

      console.log('📡 Socket event received:', event.type, event);

      switch (event.type) {
        case 'created':
          setStudents((prevStudents) => {
            const existingStudent = prevStudents.find(
              (s) => s._id === event.student._id
            );
            if (existingStudent) return prevStudents;
            return [...prevStudents, event.student];
          });
          break;

        case 'updated':
          setStudents((prevStudents) =>
            prevStudents.map((s) =>
              s._id === event.student._id ? { ...s, ...event.student } : s
            )
          );
          showSuccessMessage(
            '✏️ تم التحديث - تحديث مباشر',
            `تم تحديث بيانات الطالب ${event.student.firstName} ${event.student.lastName}`
          );
          break;

        case 'deleted':
          setStudents((prevStudents) =>
            prevStudents.filter((s) => s._id !== event.studentId)
          );
          showWarningMessage(
            '🗑️ تم الحذف - تحديث مباشر',
            'تم حذف طالب من النظام'
          );
          break;
      }
    };

    onStudentUpdate(handleStudentUpdate);
    return () => offStudentUpdate(handleStudentUpdate);
  }, [hasPermission, onStudentUpdate, offStudentUpdate, lastUpdateTime]);

  // Auto refresh every 60 seconds when not connected to socket
  useEffect(() => {
    if (!hasPermission || isConnected) return;

    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto refreshing students data...');
      fetchStudents();
    }, 60000); // 60 seconds - reduced frequency to improve performance

    return () => clearInterval(autoRefreshInterval);
  }, [hasPermission, isConnected, fetchStudents]);



  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Enhanced search function using API
  const handleSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        await fetchStudents();
        return;
      }

      try {
        const result = await searchStudents(term);
        if (result.success && result.data) {
          setStudents(result.data);
        }
      } catch (error) {
        console.error('❌ خطأ في البحث:', error);
      }
    },
    [fetchStudents]
  );

  // Handle search input change with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.length > 2) {
        handleSearch(searchTerm);
      } else if (searchTerm === '') {
        fetchStudents();
      }
    }, 800); // Increased debounce time to reduce frequent calls

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, handleSearch, fetchStudents]);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      // Groups filter logic
      if (groupsFilter === 'withGroups') {
        if (!student.group || student.group.trim() === '' || student.group === 'غير محدد') {
          return false;
        }
      } else if (groupsFilter === 'withoutGroups') {
        if (student.group && student.group.trim() !== '' && student.group !== 'غير محدد') {
          return false;
        }
      }

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (student.firstName || '').toLowerCase().includes(searchLower) ||
        (student.lastName || '').toLowerCase().includes(searchLower) ||
        (student.fatherName || '').toLowerCase().includes(searchLower) ||
        (student.idNumber || '').includes(searchLower) ||
        student.studentId.toString().includes(searchLower) ||
        (student.teacher || '').toLowerCase().includes(searchLower) ||
        (student.group || '').toLowerCase().includes(searchLower);

      const matchesGender =
        selectedGender === 'all' || student.gender === selectedGender;
      const matchesAge =
        (student.age || 0) >= ageRange[0] && (student.age || 0) <= ageRange[1];

      return matchesSearch && matchesGender && matchesAge;
    });

    filtered.sort((a, b) => {
      let compareResult = 0;

      if (sortField === 'studentId') {
        compareResult = a.studentId - b.studentId;
      } else if (sortField === 'firstName') {
        compareResult = a.firstName.localeCompare(b.firstName, 'ar');
      } else if (sortField === 'age') {
        compareResult = (a.age || 0) - (b.age || 0);
      } else if (sortField === 'group') {
        compareResult = a.group.localeCompare(b.group, 'ar');
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return filtered;
  }, [
    students,
    searchTerm,
    selectedGender,
    groupsFilter,
    ageRange,
    sortField,
    sortOrder,
  ]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedGender,
    groupsFilter,
    ageRange,
    sortField,
    sortOrder,
  ]);

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredAndSortedStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(
    filteredAndSortedStudents.length / studentsPerPage
  );

  // Handle delete
  const handleDelete = async (studentId: string | number) => {
    const student = students.find((s) => s._id === studentId);
    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : 'الطالب';

    const result = await showCenteredSwal({
      title: 'حذف الطالب',
      text: `هل تريد حذف "${studentName}" نهائياً؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'حذف',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-semibold text-gray-800',
        confirmButton: 'rounded-lg px-6 py-2 font-medium',
        cancelButton: 'rounded-lg px-6 py-2 font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        if (typeof studentId === 'string' && studentId.length > 10) {
          const deleteResult = await deleteStudent(studentId);
          if (deleteResult.success) {
            setStudents((prev) => prev.filter((s) => s._id !== studentId));
            
            // رسالة نجاح الحذف
            await showSuccessMessage(
              'تم الحذف!',
              `تم حذف الطالب ${studentName} من النظام بنجاح`
            );
          } else {
            throw new Error(deleteResult.message || 'فشل في حذف الطالب');
          }
        }
      } catch (deleteError) {
        console.error('❌ فشل في حذف الطالب:', deleteError);
        
        await showErrorMessage(
          'خطأ في الحذف!',
          'حدث خطأ أثناء حذف الطالب. يرجى المحاولة مرة أخرى'
        );
      }
    }
  };

  // Handle edit
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditMode(true);
    setIsFormVisible(true);
  };

  // Handle add/edit success
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddSuccess = async (studentData?: any) => {
    try {
      // إغلاق النموذج أولاً
      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedStudent(null);

      // إعادة تحميل البيانات لضمان الحصول على أحدث البيانات
      await fetchStudents();

      // إعادة تعيين البحث والفلاتر لإظهار الطالب الجديد
      setSearchTerm('');
      setSelectedGender('all');
      setGroupsFilter('all');
      setAgeRange([0, 100]);
      setCurrentPage(1);

      // عرض رسالة النجاح
      if (!isEditMode) {
        await showSuccessMessage(
          'مرحباً بالطالب الجديد!',
          `أهلاً وسهلاً! تم إضافة ${studentData?.firstName || 'الطالب الجديد'} إلى المدرسة بنجاح`
        );
      }
    } catch (error: unknown) {
      console.error('❌ خطأ في معالجة نجاح إضافة الطالب:', error);

      const errorMessage = 'حدث خطأ أثناء إعادة تحميل البيانات';

      await showWarningMessage(
        'تحذير ⚠️',
        `${errorMessage} - يرجى تحديث الصفحة يدوياً`
      );
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'رقم الطالب',
      'الاسم الأول',
      'اسم الأب',
      'اسم العائلة',
      'رقم الهوية',
      'العمر',
      'الجنس',
      'المعلم',
      'الحلقة',
    ];
    const rows = filteredAndSortedStudents.map((s) => [
      s.studentId,
      s.firstName,
      s.fatherName,
      s.lastName,
      s.idNumber,
      s.age,
      s.gender,
      s.teacher,
      s.group,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGender('all');
    setGroupsFilter('all');
    setAgeRange([0, 100]);
    setCurrentPage(1);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) return;

    const result = await showCenteredSwal({
      title: 'حذف متعدد',
      text: `هل تريد حذف ${selectedStudents.size} طالب نهائياً؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'حذف الكل',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-semibold text-gray-800',
        confirmButton: 'rounded-lg px-6 py-2 font-medium',
        cancelButton: 'rounded-lg px-6 py-2 font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        const studentIds = Array.from(selectedStudents);
        const bulkDeleteResult = await bulkDeleteStudents(studentIds);

        if (bulkDeleteResult.success) {
          const deletedCount = selectedStudents.size;
          setStudents((prev) =>
            prev.filter((s) => !selectedStudents.has(s._id || ''))
          );
          setSelectedStudents(new Set());

          await showSuccessMessage(
            'تم حذف الطلاب!',
            `تم حذف ${deletedCount} طالب من النظام بنجاح`
          );
        } else {
          throw new Error(bulkDeleteResult.message || 'فشل في حذف الطلاب');
        }
      } catch (bulkDeleteError) {
        console.error('❌ فشل في حذف الطلاب:', bulkDeleteError);
        
        await showErrorMessage(
          'فشل في الحذف!',
          'حدث خطأ أثناء حذف الطلاب المحددين. يرجى المحاولة مرة أخرى'
        );
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 relative"
      dir="rtl"
    >
      {/* Background Design */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
        <div className="relative">
          <div className="absolute left-1/2 top-0 w-0.5 h-screen bg-gradient-to-b from-blue-400 via-indigo-500 to-purple-600 transform -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-0 h-0.5 w-screen bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-2xl">
            <FaUserGraduate className="w-16 h-16 text-white opacity-70" />
          </div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-blue-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-indigo-200 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
        </div>
      </div>

      <div className="max-w-full mx-auto relative z-10 px-2">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-xl">
                <FaUserGraduate className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  إدارة الطلاب
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  نظام متكامل لإدارة بيانات الطلاب
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExport}
                disabled={filteredAndSortedStudents.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload className="w-4 h-4" />
                <span className="hidden sm:inline">تصدير</span>
              </button>

              <button
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedStudent(null);
                  setIsFormVisible(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <FaPlus className="w-4 h-4" />
                إضافة طالب
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="relative md:col-span-8">
                <input
                  type="text"
                  placeholder="ابحث عن طالب (الاسم، رقم الهوية، رقم الطالب...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="مسح البحث"
                    aria-label="مسح البحث"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 md:col-span-4">
                {/* View Mode Toggle */}
                <div className="flex-1 flex items-center border border-gray-300 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                      viewMode === 'table'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="عرض جدول"
                  >
                    <FaList className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">
                      جدول
                    </span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="عرض شبكة"
                  >
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
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
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
                    title="إعادة تعيين الفلاتر"
                  >
                    <FaSync className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border-2 border-gray-100 shadow-lg animate-fadeIn relative">
                {/* Close Button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all duration-200"
                  title="إغلاق الفلاتر">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Gender Filter */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      تصفية حسب الجنس
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedGender('all')}
                        title="عرض جميع الطلاب"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedGender === 'all'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        الكل
                      </button>
                      <button
                        onClick={() => setSelectedGender('ذكر')}
                        title="عرض الطلاب الذكور فقط"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedGender === 'ذكر'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ذكر
                      </button>
                      <button
                        onClick={() => setSelectedGender('أنثى')}
                        title="عرض الطالبات الإناث فقط"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedGender === 'أنثى'
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        أنثى
                      </button>
                    </div>
                  </div>

                  {/* Groups Filter */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      تصفية حسب الحلقات
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => setGroupsFilter('all')}
                        title="عرض جميع الطلاب"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          groupsFilter === 'all'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        الكل
                      </button>
                      <button
                        onClick={() => setGroupsFilter('withGroups')}
                        title="عرض الطلاب الذين لديهم حلقات"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          groupsFilter === 'withGroups'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        🎯 لديهم حلقات
                      </button>
                      <button
                        onClick={() => setGroupsFilter('withoutGroups')}
                        title="عرض الطلاب الذين لا ينتمون لأي حلقة"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          groupsFilter === 'withoutGroups'
                            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        🚫 بلا حلقات
                      </button>
                    </div>
                  </div>

                  {/* Age Range Filter */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      العمر: {ageRange[0]} - {ageRange[1]} سنة
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ageRange[1]}
                        onChange={(e) =>
                          setAgeRange([ageRange[0], parseInt(e.target.value)])
                        }
                        aria-label="الحد الأقصى للعمر"
                        className="w-full h-2 bg-gradient-to-r from-green-200 to-green-400 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>

                  {/* Items per page */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      عدد الطلاب
                    </label>
                    <select
                      value={studentsPerPage}
                      onChange={(e) => {
                        setStudentsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      aria-label="عدد الطلاب في الصفحة"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="10">10 طلاب</option>
                      <option value="25">25 طالب</option>
                      <option value="50">50 طالب</option>
                      <option value="100">100 طالب</option>
                    </select>
                  </div>
                </div>

                {/* Filter Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">
                      الفلاتر النشطة:
                    </span>
                    {selectedGender !== 'all' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedGender === 'ذكر' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        الجنس: {selectedGender}
                      </span>
                    )}

                    {groupsFilter !== 'all' && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        الحلقات:{' '}
                        {groupsFilter === 'withGroups'
                          ? 'لديهم حلقات'
                          : 'بلا حلقات'}
                      </span>
                    )}

                    {(ageRange[0] !== 0 || ageRange[1] !== 100) && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        العمر: {ageRange[0]}-{ageRange[1]}
                      </span>
                    )}

                    {searchTerm && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        البحث: "{searchTerm}"
                      </span>
                    )}

                    {activeFiltersCount === 0 && (
                      <span className="text-xs text-gray-400 italic">
                        لا توجد فلاتر مطبقة
                      </span>
                    )}
                  </div>
                </div>


              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-gray-300 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 w-12 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 w-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[
              {
                label: 'إجمالي',
                value: stats.total,
                icon: FaUserGraduate,
                color: 'blue',
              },
              {
                label: 'ذكور',
                value: stats.male,
                icon: FaUserGraduate,
                color: 'cyan',
              },
              {
                label: 'إناث',
                value: stats.female,
                icon: FaUserGraduate,
                color: 'pink',
              },
              {
                label: 'لديهم حلقات',
                value: stats.active,
                icon: FaUserGraduate,
                color: 'emerald',
              },
              {
                label: 'بلا حلقات',
                value: stats.inactive,
                icon: FaUserGraduate,
                color: 'red',
              },
              {
                label: 'متوسط العمر',
                value: stats.avgAge,
                icon: FaChartBar,
                color: 'amber',
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`bg-white p-4 rounded-xl shadow-lg border-l-4 border-${stat.color}-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600 rounded-lg shadow-md`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium truncate">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {typeof stat.value === 'number' || typeof stat.value === 'string' ? stat.value : 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}



        {/* Bulk Actions */}
        {selectedStudents.size > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              تم تحديد {selectedStudents.size} طالب
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaTrash className="w-4 h-4" />
              حذف المحدد
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-red-600 ml-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  مشكلة في تحميل البيانات
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => fetchStudents(retryCount)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <FaSync className="w-4 h-4" />
                  المحاولة مرة أخرى
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && !isLoading && currentStudents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
            {currentStudents.map((student) => (
              <div
                key={student._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
              >
                {/* Card Header with Gradient */}
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6 text-center">
                  {/* Student Avatar */}
                  <div className="relative inline-block mb-4">
                    <Avatar
                      user={student}
                      size="xl"
                      border="ring"
                      fallbackIcon={<FaUserGraduate className="w-8 h-8" />}
                    />
                    {/* Student ID Badge */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg">
                      <span className="text-blue-600 font-bold text-sm">
                        #{student.studentId}
                      </span>
                    </div>
                  </div>

                  {/* Gender & Age Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        student.gender === 'ذكر'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {student.gender}
                    </span>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                      {student.age} سنة
                    </span>
                  </div>

                  {/* Student Name */}
                  <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-blue-100 text-sm drop-shadow">
                    {student.fatherName} {student.grandFatherName}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* ID Number */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">رقم الهوية</p>
                      <p className="text-sm font-bold text-gray-900 font-mono">
                        {student.idNumber}
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  {student.phoneNumber && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaPhone className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">الهاتف</p>
                        <p className="text-sm font-semibold text-green-700 truncate">
                          {student.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {student.email && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaEnvelope className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">
                          البريد الإلكتروني
                        </p>
                        <p className="text-sm font-semibold text-blue-700 truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Residence */}
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">السكن</p>
                      <p className="text-sm font-semibold text-purple-700">
                        {student.residence}
                      </p>
                    </div>
                  </div>

                  {/* Teacher & Group */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg ${
                      student.teacher && student.teacher.trim() !== '' && student.teacher !== 'غير محدد'
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <p className="text-xs text-gray-500 mb-1">المعلم</p>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          student.teacher && student.teacher.trim() !== '' && student.teacher !== 'غير محدد'
                            ? 'bg-blue-500' 
                            : 'bg-gray-500'
                        }`}></span>
                        <p className={`text-sm font-bold truncate ${
                          student.teacher && student.teacher.trim() !== '' && student.teacher !== 'غير محدد'
                            ? 'text-blue-700' 
                            : 'text-gray-700'
                        }`}>
                          {student.teacher || 'غير محدد'}
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      student.group && student.group.trim() !== '' && student.group !== 'غير محدد'
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className="text-xs text-gray-500 mb-1">الحلقة</p>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          student.group && student.group.trim() !== '' && student.group !== 'غير محدد'
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}></span>
                        <p className={`text-sm font-bold truncate ${
                          student.group && student.group.trim() !== '' && student.group !== 'غير محدد'
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          {student.group || 'غير محدد'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="px-6 pb-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span className="font-medium">تعديل</span>
                    </button>
                    <button
                      onClick={() => handleDelete(student._id!)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaTrash className="w-4 h-4" />
                      <span className="font-medium">حذف</span>
                    </button>
                  </div>

                  {/* Checkbox for bulk selection */}
                  <div className="mt-3 flex items-center justify-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student._id || '')}
                        onChange={(e) => {
                          const newSet = new Set(selectedStudents);
                          if (e.target.checked) {
                            newSet.add(student._id || '');
                          } else {
                            newSet.delete(student._id || '');
                          }
                          setSelectedStudents(newSet);
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">
                        تحديد للحذف الجماعي
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View - Keeping existing table code */}
        {viewMode === 'table' && !isLoading && currentStudents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(
                              new Set(currentStudents.map((s) => s._id || ''))
                            );
                          } else {
                            setSelectedStudents(new Set());
                          }
                        }}
                        aria-label="اختيار جميع الطلاب"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('studentId')}
                    >
                      <div className="flex items-center gap-2">
                        رقم الطالب
                        {sortField === 'studentId' &&
                          (sortOrder === 'asc' ? (
                            <FaSortAmountUp className="w-3 h-3" />
                          ) : (
                            <FaSortAmountDown className="w-3 h-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('firstName')}
                    >
                      <div className="flex items-center gap-2">
                        الاسم الكامل
                        {sortField === 'firstName' &&
                          (sortOrder === 'asc' ? (
                            <FaSortAmountUp className="w-3 h-3" />
                          ) : (
                            <FaSortAmountDown className="w-3 h-3" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      رقم الهوية
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      الجنس
                    </th>
                    <th
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('age')}
                    >
                      <div className="flex items-center gap-2">
                        العمر
                        {sortField === 'age' &&
                          (sortOrder === 'asc' ? (
                            <FaSortAmountUp className="w-3 h-3" />
                          ) : (
                            <FaSortAmountDown className="w-3 h-3" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      المعلم
                    </th>
                    <th
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('group')}
                    >
                      <div className="flex items-center gap-2">
                        الحلقة
                        {sortField === 'group' &&
                          (sortOrder === 'asc' ? (
                            <FaSortAmountUp className="w-3 h-3" />
                          ) : (
                            <FaSortAmountDown className="w-3 h-3" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentStudents.map((student) => (
                    <tr
                      key={student._id}
                      className={`transition-colors ${
                        (() => {
                          const hasGroup = student.group && student.group.trim() !== '' && student.group !== 'غير محدد';
                          const hasTeacher = student.teacher && student.teacher.trim() !== '' && student.teacher !== 'غير محدد';
                          
                          if (hasGroup && hasTeacher) {
                            return 'hover:bg-green-50 bg-green-25 border-l-3 border-l-green-300'; // لديه حلقة ومعلم - أخضر شفاف أكثر
                          } else if (hasGroup) {
                            return 'hover:bg-green-50 bg-green-25 border-l-2 border-l-green-400'; // لديه حلقة فقط - أخضر فاتح
                          } else if (hasTeacher) {
                            return 'hover:bg-blue-50 bg-blue-25 border-l-2 border-l-blue-400'; // لديه معلم فقط - أزرق فاتح
                          } else {
                            return 'hover:bg-red-50 bg-red-25 border-l-2 border-l-red-400'; // لا يوجد حلقة ولا معلم - أحمر
                          }
                        })()
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student._id || '')}
                          onChange={(e) => {
                            const newSet = new Set(selectedStudents);
                            if (e.target.checked) {
                              newSet.add(student._id || '');
                            } else {
                              newSet.delete(student._id || '');
                            }
                            setSelectedStudents(newSet);
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          aria-label={`اختيار الطالب ${student.firstName} ${student.lastName}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.studentId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.fatherName} {student.grandFatherName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {student.idNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.gender === 'ذكر'
                              ? 'bg-cyan-100 text-cyan-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {student.age}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.teacher && student.teacher.trim() !== '' && student.teacher !== 'غير محدد'
                            ? 'bg-blue-100 text-blue-800' // لديه معلم
                            : 'bg-gray-100 text-gray-800'  // بدون معلم
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            student.teacher && student.teacher.trim() !== '' && student.teacher !== 'غير محدد'
                              ? 'bg-blue-500' // نقطة زرقاء
                              : 'bg-gray-500' // نقطة رمادية
                          }`}></span>
                          {student.teacher || 'غير محدد'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.group && student.group.trim() !== '' && student.group !== 'غير محدد'
                            ? 'bg-green-100 text-green-800' // لديه حلقة
                            : 'bg-red-100 text-red-800'     // بدون حلقة
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            student.group && student.group.trim() !== '' && student.group !== 'غير محدد'
                              ? 'bg-green-500' // نقطة خضراء
                              : 'bg-red-500'   // نقطة حمراء
                          }`}></span>
                          {student.group || 'غير محدد'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="تعديل"
                            aria-label="تعديل الطالب"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id!)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="حذف"
                            aria-label="حذف الطالب"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-xl p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && currentStudents.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
              <FaUserGraduate className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {activeFiltersCount > 0 || searchTerm
                ? 'لا توجد نتائج'
                : 'لا يوجد طلاب'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {activeFiltersCount > 0 || searchTerm
                ? 'لم يتم العثور على طلاب يطابقون معايير البحث والفلترة الحالية. جرب تعديل الفلاتر أو البحث عن كلمات مختلفة.'
                : 'ابدأ رحلتك بإضافة أول طالب إلى النظام. انقر على الزر أدناه للبدء.'}
            </p>
            {!searchTerm && activeFiltersCount === 0 ? (
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedStudent(null);
                  setIsFormVisible(true);
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaPlus className="w-5 h-5" />
                <span className="font-semibold">إضافة طالب جديد</span>
              </button>
            ) : (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaSync className="w-5 h-5" />
                <span className="font-semibold">إعادة تعيين الفلاتر</span>
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && currentStudents.length > 0 && totalPages > 1 && (
          <ResponsivePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAndSortedStudents.length}
            itemsPerPage={studentsPerPage}
            onPageChange={setCurrentPage}
            itemName="طالب"
            showQuickJump={true}
          />
        )}
      </div>

      {/* Student Form Modal */}
      {isFormVisible && (
        <AddStudentFormWithYup
          onClose={() => {
            setIsFormVisible(false);
            setIsEditMode(false);
            setSelectedStudent(null);
          }}
          onSuccess={handleAddSuccess}
          student={isEditMode && selectedStudent ? selectedStudent : undefined}
        />
      )}

      {/* Tailwind CSS Styles - Most animations and effects are now built-in */}
      <style>{`
        /* Custom range input styling (not available in default Tailwind) */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        /* Custom scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default StudentsManagement;
