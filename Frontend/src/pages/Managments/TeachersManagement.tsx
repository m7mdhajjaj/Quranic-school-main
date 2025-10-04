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
  FaUserTie,
  FaChartBar,
  FaTh,
  FaList,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';

import api from '../../Api/api';
import { getAllTeachers } from '../../Api/teacherApi';
import type { Teacher } from '../../Api/teacherApi';
import type { TeacherFormData } from '../../Validation/teacherValidation';
import EnhancedTeacherForm from '../../components/Forms/AddTeacherForm';
import ResponsivePagination from '../../components/Pagination/ResponsivePagination';
import CustomSnackbar from '../../components/Snackbar/CustomSnackbar';
import Swal from 'sweetalert2';
import "../../styles/sweetalert.css";
import { showCenteredSwal, showSuccessMessage, showErrorMessage, showWarningMessage } from "../../utils/sweetalertUtils";

type SortField = 'teacherId' | 'firstName' | 'age' | 'email';
type SortOrder = 'asc' | 'desc';

// دالة مساعدة للحصول على اسم الحلقة بشكل آمن
const getGroupDisplayName = (
  group:
    | string
    | { name?: string; id?: string; number?: number }
    | null
    | undefined
): string => {
  if (!group) return 'حلقة غير محددة';
  if (typeof group === 'string') return group;
  return group.name || 'حلقة غير محددة';
};



const TeachersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();

  const userRole = currentUser?.role || '';
  const hasPermission = userRole === 'admin';

  // Core States
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [groupsFilter, setGroupsFilter] = useState<
    'all' | 'withGroups' | 'withoutGroups'
  >('all');
  const [showFilters, setShowFilters] = useState(false);

  // View Mode State
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  // إزالة التحكم في عدد الأعمدة - تم تعيين 3 أعمدة ثابت

  // Sorting States
  const [sortField, setSortField] = useState<SortField>('teacherId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [teachersPerPage, setTeachersPerPage] = useState(10);

  // Selected Teachers for Bulk Actions
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(
    new Set()
  );

  // Snackbar States
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    title: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
    actionType: 'general' as 'add' | 'edit' | 'delete' | 'general',
  });

  // Helper function to show snackbar
  const showSnackbar = (
    message: string,
    title: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'success',
    actionType: 'add' | 'edit' | 'delete' | 'general' = 'general'
  ) => {
    setSnackbar({
      open: true,
      message,
      title,
      severity,
      actionType,
    });
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Statistics
  const stats = useMemo(() => {
    const maleCount = teachers.filter((t) => t.gender === 'ذكر').length;
    const femaleCount = teachers.filter((t) => t.gender === 'أنثى').length;
    const activeCount = teachers.filter((t) => t.isActive).length;
    const withGroupsCount = teachers.filter(
      (t) => t.groups && Array.isArray(t.groups) && t.groups.length > 0
    ).length;
    const withoutGroupsCount = teachers.length - withGroupsCount;
    const avgAge =
      teachers.length > 0
        ? (
            teachers.reduce((sum, t) => sum + (t.age || 0), 0) / teachers.length
          ).toFixed(1)
        : 0;

    return {
      total: teachers.length,
      active: activeCount,
      inactive: teachers.length - activeCount,
      male: maleCount,
      female: femaleCount,
      withGroups: withGroupsCount,
      withoutGroups: withoutGroupsCount,
      avgAge,
    };
  }, [teachers]);

  // Fetch teachers
  const fetchTeachers = useCallback(async (retryAttempt = 0) => {
    setIsLoading(true);
    setError(null);
    setRetryCount(retryAttempt);

    try {
      const result = await getAllTeachers();

      if (result.success && result.data) {
        console.log(`✅ تم تحميل ${result.data.length} معلم بنجاح`);
        setTeachers(result.data);
        setError(null);
        setRetryCount(0);
      } else {
        throw new Error(result.message || 'فشل في تحميل بيانات المعلمين');
      }
    } catch (error: unknown) {
      console.error('خطأ في تحميل المعلمين:', error);

      let errorMessage = 'حدث خطأ في تحميل البيانات';

      // Check if it's a network error (backend not running)
      if (error instanceof Error) {
        if (
          error.message.includes('Network Error') ||
          error.message.includes('ERR_CONNECTION_REFUSED')
        ) {
          errorMessage =
            'لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم الخلفي على البورت 5005';
        } else {
          errorMessage = error.message || 'خطأ غير محدد';
        }
      }

      setError(errorMessage);
      setTeachers([]);
      console.log('❌ فشل في تحميل بيانات المعلمين:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    fetchTeachers();
  }, [hasPermission, fetchTeachers]);

  // Socket event handlers for real-time updates
  useEffect(() => {
    if (!hasPermission || !socket) return;

    const handleTeacherUpdate = (event: {
      type: 'created' | 'updated' | 'deleted';
      teacher: Teacher;
      teacherId?: string;
    }) => {
      console.log('📡 Received teacher update via socket:', event);

      switch (event.type) {
        case 'created':
          setTeachers((prevTeachers) => {
            // Check if teacher already exists to prevent duplicates
            const existingTeacher = prevTeachers.find(
              (t) =>
                t._id === event.teacher._id ||
                (t.email && t.email === event.teacher.email)
            );

            if (existingTeacher) {
              console.log('Teacher already exists, skipping add');
              return prevTeachers;
            }

            console.log('➕ Adding new teacher to local state');
            return [
              ...prevTeachers,
              {
                ...event.teacher,
                gender: event.teacher.gender || 'غير محدد',
                age: event.teacher.age || 0,
              },
            ];
          });

          // Log notification instead of showing toast
          console.log(
            '✅ معلم جديد تم إضافته:',
            event.teacher.firstName,
            event.teacher.lastName
          );
          break;

        case 'updated':
          setTeachers((prevTeachers) =>
            prevTeachers.map((t) =>
              t._id === event.teacher._id
                ? {
                    ...event.teacher,
                    gender: event.teacher.gender || 'غير محدد',
                    age: event.teacher.age || 0,
                  }
                : t
            )
          );

          // Log notification instead of showing toast
          console.log(
            '🔄 تم تحديث بيانات المعلم:',
            event.teacher.firstName,
            event.teacher.lastName
          );
          break;

        case 'deleted':
          setTeachers((prevTeachers) =>
            prevTeachers.filter((t) => t._id !== event.teacherId)
          );

          // Log notification instead of showing toast
          console.log('🗑️ تم حذف معلم من قبل مستخدم آخر');
          break;
      }
    };

    // Listen for teacher events
    socket.on('teacherCreated', (data: Teacher) =>
      handleTeacherUpdate({ type: 'created', teacher: data })
    );
    socket.on('teacherUpdated', (data: Teacher) =>
      handleTeacherUpdate({ type: 'updated', teacher: data })
    );
    socket.on(
      'teacherDeleted',
      (data: { teacherId: string; teacher?: Teacher }) =>
        handleTeacherUpdate({
          type: 'deleted',
          teacher: data.teacher!,
          teacherId: data.teacherId,
        })
    );

    // Cleanup: remove event listeners
    return () => {
      if (socket) {
        socket.off('teacherCreated');
        socket.off('teacherUpdated');
        socket.off('teacherDeleted');
      }
    };
  }, [hasPermission, socket]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort teachers
  const filteredAndSortedTeachers = useMemo(() => {
    const filtered = teachers.filter((teacher) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (teacher.firstName || '').toLowerCase().includes(searchLower) ||
        (teacher.lastName || '').toLowerCase().includes(searchLower) ||
        (teacher.fatherName || '').toLowerCase().includes(searchLower) ||
        (teacher.idNumber || '').includes(searchLower) ||
        teacher.teacherId.toString().includes(searchLower) ||
        (teacher.email || '').toLowerCase().includes(searchLower) ||
        (teacher.phoneNumber || '').includes(searchLower);

      const matchesGender =
        selectedGender === 'all' || teacher.gender === selectedGender;

      const matchesAge = teacher.age
        ? teacher.age >= ageRange[0] && teacher.age <= ageRange[1]
        : true;

      const matchesGroupsFilter = () => {
        const hasGroups =
          teacher.groups &&
          Array.isArray(teacher.groups) &&
          teacher.groups.length > 0;

        if (groupsFilter === 'withGroups') return hasGroups;
        if (groupsFilter === 'withoutGroups') return !hasGroups;
        return true; // 'all'
      };

      return (
        matchesSearch && matchesGender && matchesAge && matchesGroupsFilter()
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let compareResult = 0;

      if (sortField === 'teacherId') {
        compareResult = a.teacherId - b.teacherId;
      } else if (sortField === 'firstName') {
        compareResult = a.firstName.localeCompare(b.firstName, 'ar');
      } else if (sortField === 'age') {
        compareResult = (a.age || 0) - (b.age || 0);
      } else if (sortField === 'email') {
        compareResult = a.email.localeCompare(b.email);
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return filtered;
  }, [
    teachers,
    searchTerm,
    selectedGender,
    ageRange,
    groupsFilter,
    sortField,
    sortOrder,
  ]);

  // Pagination
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredAndSortedTeachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher
  );
  const totalPages = Math.ceil(
    filteredAndSortedTeachers.length / teachersPerPage
  );

  // Handle delete
  const handleDelete = async (teacherId: string) => {
    // البحث عن المعلم للحصول على اسمه
    const teacher = teachers.find((t) => t._id === teacherId);
    const teacherName = teacher
      ? `${teacher.firstName} ${teacher.lastName}`
      : 'المعلم';

    const result = await showCenteredSwal({
      title: 'تأكيد حذف المعلم \ud83d\udee1\ufe0f',
      html: `
        <div class="text-center">
          <div class="mb-4">
            <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </div>
          </div>
          <p class="text-gray-600 mb-2">هل أنت متأكد من حذف:</p>
          <p class="font-bold text-lg text-red-600">${teacherName}</p>
          <p class="text-sm text-gray-500 mt-2">هذه العملية لا يمكن التراجع عنها</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '\ud83d\uddd1\ufe0f نعم، احذف',
      cancelButtonText: '\u274c إلغاء',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'rtl-popup swal2-rtl-popup',
        title: 'rtl-title',
        htmlContainer: 'rtl-content',
        confirmButton: 'swal2-confirm-delete',
        cancelButton: 'swal2-cancel-delete',
      },
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/teachers/${teacherId}`);

        setTeachers((prevTeachers) =>
          prevTeachers.filter((t) => t._id !== teacherId)
        );

        // رسالة نجاح الحذف باستخدام Snackbar
        showSnackbar(
          `تم حذف المعلم ${teacherName} من النظام نهائياً بنجاح`,
          'تم الحذف بنجاح',
          'success',
          'delete'
        );
      } catch (deleteError: unknown) {
        console.error('❌ فشل في حذف المعلم:', deleteError);

        // التعامل مع خطأ وجود علاقات مرتبطة
        const error = deleteError as {
          response?: {
            status: number;
            data: {
              details: { groupsCount: number; studentsCount: number };
              message: string;
            };
          };
        };
        if (error.response?.status === 400 && error.response?.data?.details) {
          const { groupsCount, studentsCount } = error.response.data.details;
          
          let relationMessage = 'المعلم مرتبط بـ: ';
          const relations = [];
          if (groupsCount > 0) relations.push(`${groupsCount} حلقة`);
          if (studentsCount > 0) relations.push(`${studentsCount} طالب`);
          relationMessage += relations.join(' و ');
          relationMessage += '. يجب نقل الحلقات والطلاب أولاً أو تعيين معلم آخر لهم.';

          showSnackbar(
            relationMessage,
            'لا يمكن حذف المعلم',
            'warning'
          );
        } else {
          // خطأ عام
          showSnackbar(
            error.response?.data?.message || 'حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.',
            'فشل في الحذف',
            'error'
          );
        }
      }
    }
  };

  // Handle edit
  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditMode(true);
    setIsFormVisible(true);
  };

  // Handle add/edit success
  const handleAddSuccess = async (teacherData?: Teacher | TeacherFormData) => {
    try {
      if (teacherData) {
        if (isEditMode && selectedTeacher) {
          setTeachers((prev) =>
            prev.map((t) =>
              t._id === selectedTeacher._id
                ? ({ ...t, ...teacherData } as Teacher)
                : t
            )
          );

          // رسالة نجاح التحديث باستخدام Snackbar
          showSnackbar(
            `تم تحديث بيانات ${('firstName' in teacherData && teacherData.firstName) || 'المعلم'} في النظام بنجاح`,
            'تم التحديث بنجاح',
            'success',
            'edit'
          );
        } else {
          // للمعلمين الجدد سيتم إضافتهم بواسطة الـ API
          await fetchTeachers(); // إعادة تحميل القائمة

          // رسالة نجاح الإضافة باستخدام Snackbar
          showSnackbar(
            `أهلاً وسهلاً! تم إضافة ${('firstName' in teacherData && teacherData.firstName) || 'المعلم الجديد'} إلى فريق العمل بنجاح`,
            'مرحباً بالمعلم الجديد',
            'success',
            'add'
          );

        }
      }

      // إغلاق النموذج بنجاح
      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedTeacher(null);
    } catch (error: unknown) {
      console.error('خطأ في handleAddSuccess:', error);

      let errorMessage = 'حدث خطأ أثناء معالجة بيانات المعلم';
      let errorTitle = 'حدث خطأ! ⚠️';

      // معالجة أخطاء API المحددة
      if (error && typeof error === 'object') {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };

        if (apiError.response?.data?.message) {
          const msg = apiError.response.data.message;

          if (msg.includes('رقم الهوية')) {
            errorTitle = 'رقم هوية مكرر! 🚫';
            errorMessage =
              'رقم الهوية موجود بالفعل في النظام. يرجى استخدام رقم هوية مختلف.';
          } else if (
            msg.includes('رقم الهاتف') ||
            msg.includes('phoneNumber')
          ) {
            errorTitle = 'رقم هاتف مكرر! 📱';
            errorMessage =
              'رقم الهاتف موجود بالفعل في النظام. يرجى استخدام رقم هاتف مختلف.';
          } else if (
            msg.includes('البريد الإلكتروني') ||
            msg.includes('email')
          ) {
            errorTitle = 'بريد إلكتروني مكرر! 📧';
            errorMessage =
              'البريد الإلكتروني موجود بالفعل في النظام. يرجى استخدام بريد إلكتروني مختلف.';
          } else if (msg.includes('التحقق من البيانات')) {
            errorTitle = 'خطأ في البيانات! 📝';
            errorMessage =
              'هناك خطأ في تنسيق البيانات المدخلة. يرجى مراجعة جميع الحقول.';
          } else {
            errorMessage = msg;
          }
        }
      }

      await showErrorMessage(errorTitle, errorMessage);

      // عدم إغلاق النموذج في حالة وجود خطأ للسماح بإعادة المحاولة
    } finally {
      // سيتم إغلاق النموذج فقط عند النجاح من داخل AddTeacherForm
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'رقم المعلم',
      'الاسم الأول',
      'اسم الأب',
      'اسم العائلة',
      'البريد الإلكتروني',
      'رقم الهاتف',
      'العمر',
      'الجنس',
    ];
    const rows = filteredAndSortedTeachers.map((t) => [
      t.teacherId,
      t.firstName,
      t.fatherName || '',
      t.lastName,
      t.email,
      t.phoneNumber,
      t.age || '',
      t.gender || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `teachers_${new Date().toISOString().split('T')[0]}.csv`;
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
    if (selectedTeachers.size === 0) return;

    const result = await showCenteredSwal({
      title: `حذف ${selectedTeachers.size} معلم`,
      text: 'هل أنت متأكد من حذف المعلمين المحددين؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف الكل',
      cancelButtonText: 'إلغاء',
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          Array.from(selectedTeachers).map((id) =>
            api.delete(`/teachers/${id}`)
          )
        );

        setTeachers((prev) => prev.filter((t) => !selectedTeachers.has(t._id)));
        setSelectedTeachers(new Set());

        await showSuccessMessage(
          '🎉 تمت العملية بنجاح 🎉',
          'تم حذف المعلمين المحددين',
          `${selectedTeachers.size} معلم`
        );
      } catch (bulkDeleteError) {
        console.error('❌ فشل في حذف المعلمين:', bulkDeleteError);
        await showErrorMessage(
          '❌ فشل في العملية',
          'حدث خطأ أثناء حذف المعلمين - يرجى المحاولة مرة أخرى'
        );
      }
    }
  };

  return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 relative"
        dir="rtl"
      >
      {/* Center Design Element */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 w-0.5 h-screen bg-gradient-to-b from-green-400 via-blue-500 to-purple-600 transform -translate-x-1/2"></div>
          {/* Horizontal Line */}
          <div className="absolute top-1/2 left-0 h-0.5 w-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 transform -translate-y-1/2"></div>
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-2xl">
            <FaUserTie className="w-16 h-16 text-white opacity-70" />
          </div>
          {/* Decorative Rings */}
          <div className="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-green-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-blue-200 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 text-right">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <FaUserTie className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">
                      إدارة المعلمين
                    </h1>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    نظام متكامل لإدارة بيانات المعلمين
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <FaDownload className="w-4 h-4" />
                تصدير
              </button>

              <button
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedTeacher(null);
                  setIsFormVisible(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <FaPlus className="w-4 h-4" />
                إضافة معلم
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {/* Search Bar - Takes full width on mobile, flex-1 on desktop */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ابحث عن معلم (الاسم، البريد الإلكتروني، رقم الهاتف، رقم المعلم...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-right"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {/* Controls Section */}
              <div className="flex gap-2 flex-shrink-0">
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
              </div>
            </div>

            {/* Enhanced Filters */}
            {showFilters && (
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border-2 border-gray-100 shadow-lg animate-fadeIn">
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
                        title="عرض جميع المعلمين"
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
                        title="عرض المعلمين الذكور فقط"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedGender === 'ذكر'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ذكر
                      </button>
                      <button
                        onClick={() => setSelectedGender('انثى')}
                        title="عرض المعلمات الإناث فقط"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedGender === 'انثى'
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
                        title="عرض جميع المعلمين"
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
                        title="عرض المعلمين الذين لديهم حلقات"
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
                        title="عرض المعلمين الذين لا يدرسون أي حلقة"
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
                        className="w-full h-2 bg-gradient-to-r from-green-200 to-green-400 rounded-lg appearance-none cursor-pointer"
                        title={`العمر: ${ageRange[0]} - ${ageRange[1]} سنة`}
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
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      عدد المعلمين في الصفحة
                    </label>
                    <select
                      value={teachersPerPage}
                      onChange={(e) => {
                        setTeachersPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      title="اختيار عدد المعلمين المعروضين في الصفحة"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 font-medium"
                    >
                      <option value="10">10 معلمين</option>
                      <option value="25">25 معلم</option>
                      <option value="50">50 معلم</option>
                      <option value="100">100 معلم</option>
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
                      <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    إجمالي
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md">
                  <FaUserTie className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">ذكور</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.male}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-pink-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">إناث</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.female}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    متوسط العمر
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgAge}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-md">
                  <FaChartBar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div
              className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => {
                setGroupsFilter('withGroups');
                setShowFilters(true);
              }}
              title="انقر لعرض المعلمين الذين لديهم حلقات فقط"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    لديهم حلقات
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.withGroups}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => {
                setGroupsFilter('withoutGroups');
                setShowFilters(true);
              }}
              title="انقر لعرض المعلمين الذين لا يدرسون أي حلقة"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    بلا حلقات
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.withoutGroups}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedTeachers.size > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              تم تحديد {selectedTeachers.size} معلم
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
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 animate-fadeIn">
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
                  onClick={() => fetchTeachers(retryCount)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  المحاولة مرة أخرى
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State - Statistics Cards Skeleton */}
        {isLoading && (
          <>
            {/* Statistics Cards Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-4 mb-6">
              {/* Total Teachers Skeleton */}
              <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-gray-300 hover:shadow-xl transition-shadow animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 w-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Active Teachers Skeleton */}
              <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-gray-300 hover:shadow-xl transition-shadow animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 w-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Inactive Teachers Skeleton */}
              <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-gray-300 hover:shadow-xl transition-shadow animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-12 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 w-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Male Teachers Skeleton */}
              <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-gray-300 hover:shadow-xl transition-shadow animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 w-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Female Teachers Skeleton */}
              <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-gray-300 hover:shadow-xl transition-shadow animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 w-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Average Age Skeleton */}
              <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-gray-300 hover:shadow-xl transition-shadow animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-12 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 w-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header Skeleton */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex space-x-3 rtl:space-x-reverse">
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Search and Filter Skeleton */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Table Skeleton */}
              <div className="overflow-x-auto" dir="rtl">
                <table className="w-full" dir="rtl">
                  {/* Table Header Skeleton */}
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-center">
                        <div className="h-4 w-4 bg-gray-300 rounded mx-auto animate-pulse"></div>
                      </th>
                      <th className="px-4 py-4 text-right">
                        <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                      </th>
                      <th className="px-4 py-4 text-right">
                        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                      </th>
                      <th className="px-4 py-4 text-right">
                        <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                      </th>
                      <th className="px-4 py-4 text-right">
                        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                      </th>
                      <th className="px-4 py-4 text-right">
                        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                      </th>
                      <th className="px-4 py-4 text-right">
                        <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
                      </th>
                      <th className="px-4 py-4 text-right">
                        <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
                      </th>
                      <th className="px-4 py-4 text-right">
                        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                      </th>
                      <th className="px-4 py-4 text-right">
                        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                      </th>
                      <th className="px-4 py-4 text-center">
                        <div className="h-4 w-16 bg-gray-300 rounded mx-auto animate-pulse"></div>
                      </th>
                    </tr>
                  </thead>

                  {/* Table Rows Skeleton */}
                  <tbody>
                    {Array.from({ length: 8 }, (_, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="px-4 py-4 text-center">
                          <div className="h-4 w-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1">
                            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2 rtl:space-x-reverse justify-center">
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
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Teachers Display - Grid or Table */}
        {!isLoading && filteredAndSortedTeachers.length > 0 && (
          <>
            Grid View
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
                {currentTeachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
                    {/* Card Header with Gradient */}
                    <div className="relative bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700 p-6 text-center">
                      {/* Teacher Avatar */}
                      <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/30">
                          <FaUserTie className="w-12 h-12 text-purple-600" />
                        </div>
                        {/* Teacher ID Badge */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg">
                          <span className="text-purple-600 font-bold text-sm">
                            #{teacher.teacherId}
                          </span>
                        </div>
                      </div>

                      {/* Gender & Age Badges */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            teacher.gender === "ذكر"
                              ? "bg-cyan-100 text-cyan-800"
                              : "bg-pink-100 text-pink-800"
                          }`}>
                          {teacher.gender}
                        </span>
                        {teacher.age && (
                          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                            {teacher.age} سنة
                          </span>
                        )}
                      </div>

                      {/* Active Status */}
                      {teacher.isActive && (
                        <div className="absolute top-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
                      )}

                      {/* Teacher Name */}
                      <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      {teacher.specialCircle && (
                        <p className="text-purple-100 text-sm drop-shadow">
                          {teacher.specialCircle}
                        </p>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      {/* Contact Information */}
                      {teacher.phoneNumber && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaPhone className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">الهاتف</p>
                            <p className="text-sm font-semibold text-green-700 truncate" dir="ltr">
                              {teacher.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}

                      {teacher.email && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaEnvelope className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                            <p className="text-sm font-semibold text-blue-700 truncate">
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Residence/Address */}
                      {(teacher.residence || teacher.address) && (
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaMapMarkerAlt className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">السكن</p>
                            <p className="text-sm font-semibold text-purple-700">
                              {teacher.residence || teacher.address}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Groups Information */}
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">الحلقات</p>
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                            {teacher.groups && Array.isArray(teacher.groups) ? teacher.groups.length : 0} حلقة
                          </span>
                        </div>
                        {teacher.groups && Array.isArray(teacher.groups) && teacher.groups.length > 0 ? (
                          <div className="space-y-1">
                            {teacher.groups.slice(0, 3).map((group, index) => {
                              const groupName = getGroupDisplayName(group);
                              return (
                                <div
                                  key={index}
                                  className="text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded truncate"
                                  title={groupName}
                                >
                                  {groupName}
                                </div>
                              );
                            })}
                            {teacher.groups.length > 3 && (
                              <div className="text-xs text-orange-600 text-center">
                                +{teacher.groups.length - 3} حلقة أخرى
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 text-center">لا توجد حلقات</p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer - Actions */}
                    <div className="px-6 pb-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                          <FaEdit className="w-4 h-4" />
                          <span className="font-medium">تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id)}
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
                            checked={selectedTeachers.has(teacher._id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedTeachers);
                              if (e.target.checked) {
                                newSet.add(teacher._id);
                              } else {
                                newSet.delete(teacher._id);
                              }
                              setSelectedTeachers(newSet);
                            }}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-600">تحديد للحذف الجماعي</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto" dir="rtl">
                  <table className="w-full" dir="rtl">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            title="تحديد جميع المعلمين"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTeachers(
                                  new Set(currentTeachers.map((t) => t._id))
                                );
                              } else {
                                setSelectedTeachers(new Set());
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th
                          className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('teacherId')}
                        >
                          <div className="flex items-center gap-2">
                            رقم المعلم
                            {sortField === 'teacherId' &&
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
                        <th
                          className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center gap-2">
                            البريد الإلكتروني
                            {sortField === 'email' &&
                              (sortOrder === 'asc' ? (
                                <FaSortAmountUp className="w-3 h-3" />
                              ) : (
                                <FaSortAmountDown className="w-3 h-3" />
                              ))}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                          رقم الهاتف
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
                          الحلقات المدرسة
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                          مكان السكن
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentTeachers.map((teacher) => (
                        <tr
                          key={teacher._id}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              title={`تحديد المعلم ${teacher.firstName}`}
                              checked={selectedTeachers.has(teacher._id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedTeachers);
                                if (e.target.checked) {
                                  newSet.add(teacher._id);
                                } else {
                                  newSet.delete(teacher._id);
                                }
                                setSelectedTeachers(newSet);
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {teacher.teacherId}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {teacher.firstName} {teacher.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {teacher.fatherName && `${teacher.fatherName}`}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {teacher.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {teacher.phoneNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {teacher.idNumber || (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {teacher.gender ? (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  teacher.gender === 'ذكر'
                                    ? 'bg-cyan-100 text-cyan-800'
                                    : 'bg-pink-100 text-pink-800'
                                }`}
                              >
                                {teacher.gender}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {teacher.age ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {teacher.age}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {teacher.groups &&
                            Array.isArray(teacher.groups) &&
                            teacher.groups.length > 0 ? (
                              <div className="max-w-md">
                                {/* عرض أول حلقتين دائماً */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {teacher.groups.slice(0, 2).map((group, index) => {
                                    if (!group) return null;

                                    const groupName = getGroupDisplayName(group);

                                    return (
                                      <div
                                        key={index}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg text-sm font-medium border border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 hover:from-blue-200 hover:to-blue-300 group/card"
                                        title={`حلقة: ${groupName}`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse group-hover/card:animate-none"></div>
                                          <span className="font-bold text-blue-900 group-hover/card:text-blue-800 transition-colors">
                                            {groupName && groupName.length > 15
                                              ? `${groupName.substring(0, 15)}...`
                                              : groupName}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* عرض الحلقات الإضافية في منطقة قابلة للتوسع */}
                                {teacher.groups.length > 2 && (
                                  <details className="group/details">
                                    <summary className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-lg text-sm font-medium border border-indigo-300 cursor-pointer hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 list-none shadow-sm hover:shadow-md group-open/details:bg-gradient-to-r group-open/details:from-emerald-100 group-open/details:to-green-100 group-open/details:text-emerald-800 group-open/details:border-emerald-300">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm group-open/details:bg-emerald-50">
                                          <span className="text-xs font-bold text-indigo-700 group-open/details:text-emerald-700">
                                            +{teacher.groups.length - 2}
                                          </span>
                                        </div>
                                        <span className="font-bold">حلقة أخرى</span>
                                        <svg
                                          className="w-4 h-4 transform group-open/details:rotate-180 transition-transform duration-300"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                          />
                                        </svg>
                                      </div>
                                    </summary>
                                    
                                    {/* الحلقات الإضافية */}
                                    <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                      <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        الحلقات الإضافية ({teacher.groups.length - 2})
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {teacher.groups.slice(2).map((group, index) => {
                                          if (!group) return null;

                                          const groupName = getGroupDisplayName(group);

                                          return (
                                            <div
                                              key={index + 2}
                                              className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-md text-xs font-medium border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200 hover:from-emerald-200 hover:to-green-200 group/extra"
                                              title={`حلقة: ${groupName}`}
                                            >
                                              <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full group-hover/extra:animate-pulse"></div>
                                                <span className="font-bold text-emerald-900 group-hover/extra:text-emerald-800 transition-colors">
                                                  {groupName && groupName.length > 12
                                                    ? `${groupName.substring(0, 12)}...`
                                                    : groupName}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </details>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                <svg
                                  className="w-5 h-5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"
                                  />
                                </svg>
                                <span className="text-gray-500 text-sm font-medium">
                                  لا توجد حلقات مخصصة
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {teacher.residence || teacher.address || (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(teacher)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="تعديل"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(teacher._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="حذف"
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
          </>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedTeachers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <FaUserTie className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا يوجد معلمين
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'لم يتم العثور على نتائج مطابقة للبحث'
                : 'ابدأ بإضافة معلم جديد للنظام'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsFormVisible(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
              >
                <FaPlus className="w-4 h-4" />
                إضافة معلم جديد
              </button>
            )}
          </div>
        )}

        {/* Enhanced Responsive Pagination */}
        {!isLoading &&
          filteredAndSortedTeachers.length > 0 &&
          totalPages > 1 && (
            <ResponsivePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedTeachers.length}
              itemsPerPage={teachersPerPage}
              onPageChange={setCurrentPage}
              itemName="معلم"
              showQuickJump={true}
            />
          )}
      </div>

      {/* Teacher Form Modal */}
      {isFormVisible && (
        <EnhancedTeacherForm
          onClose={() => {
            setIsFormVisible(false);
            setIsEditMode(false);
            setSelectedTeacher(null);
          }}
          onSuccess={handleAddSuccess}
          teacher={isEditMode && selectedTeacher ? selectedTeacher : undefined}
        />
      )}

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

      {/* Custom Snackbar */}
      <CustomSnackbar
        open={snackbar.open}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        title={snackbar.title}
        severity={snackbar.severity}
        actionType={snackbar.actionType}
        animation="grow"
        showProgress={true}
      />
    </div>
  );
};

export default TeachersManagement;
