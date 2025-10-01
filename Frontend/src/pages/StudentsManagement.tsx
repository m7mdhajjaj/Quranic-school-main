
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaEdit, FaTrash, FaPlus, FaSearch, FaChevronLeft, FaChevronRight,
  FaDownload, FaUpload, FaFilter, FaSortAmountDown, FaSortAmountUp,
  FaEye, FaUserGraduate, FaBook, FaChartBar
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import AddStudentFormWithYup from '../components/AddStudentForm';
import Swal from 'sweetalert2';
import '../styles/sweetalert.css';

interface StudentFormData {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  motherName: string;
  lastName: string;
  idNumber: string;
  birthDate: string;
  gender: string;
  residence: string;
  teacher: string;
  group: string;
  email?: string;
  phoneNumber: string;
}

interface Student {
  _id?: string;
  id?: number;
  studentId: number;
  idNumber: string;
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  motherName: string;
  lastName: string;
  birthDate: string;
  age: number;
  gender: 'ذكر' | 'انثى';
  residence: string;
  teacher: string;
  group: string;
  phoneNumber?: string;
  email?: string;
}

type SortField = 'studentId' | 'firstName' | 'age' | 'group';
type SortOrder = 'asc' | 'desc';

const StudentsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
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
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  // Sorting States
  const [sortField, setSortField] = useState<SortField>('studentId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  // View Mode State
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Selected Students for Bulk Actions
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Extract unique groups and teachers
  const groups = useMemo(() => {
    return [...new Set(students.map(s => s.group).filter(Boolean))].sort();
  }, [students]);

  const teachers = useMemo(() => {
    return [...new Set(students.map(s => s.teacher).filter(Boolean))].sort();
  }, [students]);

  // Statistics
  const stats = useMemo(() => {
    const maleCount = students.filter(s => s.gender === 'ذكر').length;
    const femaleCount = students.filter(s => s.gender === 'انثى').length;
    const avgAge = students.length > 0 
      ? (students.reduce((sum, s) => sum + (s.age || 0), 0) / students.length).toFixed(1)
      : 0;
    
    return {
      total: students.length,
      male: maleCount,
      female: femaleCount,
      avgAge,
      groups: groups.length,
      teachers: teachers.length
    };
  }, [students, groups.length, teachers.length]);

  // Fetch students
  const fetchStudents = useCallback(async (retryAttempt = 0) => {
    setIsLoading(true);
    setError(null);
    setRetryCount(retryAttempt);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await api.get('/students', {
        signal: controller.signal,
        timeout: 15000
      });
      
      clearTimeout(timeoutId);
      
      if (response.data && Array.isArray(response.data)) {
        // Validate and clean student data
        const cleanedStudents = response.data.map(student => ({
          ...student,
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          fatherName: student.fatherName || '',
          idNumber: student.idNumber || '',
          teacher: student.teacher || 'غير محدد',
          group: student.group || 'غير محدد',
          gender: student.gender || 'غير محدد',
          age: student.age || 0
        }));
        
        console.log(`✅ تم تحميل ${cleanedStudents.length} طالب بنجاح`);
        setStudents(cleanedStudents);
        setError(null);
        setRetryCount(0);
      } else {
        throw new Error('البيانات المستلمة غير صحيحة');
      }
      
    } catch (error: unknown) {
      console.error('خطأ في تحميل الطلاب:', error);
      
      let errorMessage = 'حدث خطأ في تحميل البيانات';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message === 'canceled') {
          console.log('🔄 تم إلغاء الطلب السابق');
          return; // Don't update state for cancelled requests
        } else {
          errorMessage = error.message || 'خطأ غير محدد';
        }
      }
      
      setError(errorMessage);
      setStudents([]);
      console.log('❌ فشل في تحميل بيانات الطلاب:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    
    fetchStudents();
  }, [hasPermission, fetchStudents]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (student.firstName || '').toLowerCase().includes(searchLower) ||
        (student.lastName || '').toLowerCase().includes(searchLower) ||
        (student.fatherName || '').toLowerCase().includes(searchLower) ||
        (student.idNumber || '').includes(searchLower) ||
        student.studentId.toString().includes(searchLower) ||
        (student.teacher || '').toLowerCase().includes(searchLower) ||
        (student.group || '').toLowerCase().includes(searchLower);

      const matchesGroup = selectedGroup === 'all' || student.group === selectedGroup;
      const matchesGender = selectedGender === 'all' || student.gender === selectedGender;
      const matchesTeacher = selectedTeacher === 'all' || student.teacher === selectedTeacher;
      const matchesAge = student.age >= ageRange[0] && student.age <= ageRange[1];

      return matchesSearch && matchesGroup && matchesGender && matchesTeacher && matchesAge;
    });

    // Sort
    filtered.sort((a, b) => {
      let compareResult = 0;
      
      if (sortField === 'studentId') {
        compareResult = a.studentId - b.studentId;
      } else if (sortField === 'firstName') {
        compareResult = a.firstName.localeCompare(b.firstName, 'ar');
      } else if (sortField === 'age') {
        compareResult = a.age - b.age;
      } else if (sortField === 'group') {
        compareResult = a.group.localeCompare(b.group, 'ar');
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return filtered;
  }, [students, searchTerm, selectedGroup, selectedGender, selectedTeacher, ageRange, sortField, sortOrder]);

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredAndSortedStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredAndSortedStudents.length / studentsPerPage);

  // Handle delete
  const handleDelete = async (studentId: string | number) => {
    const result = await Swal.fire({
      title: 'تأكيد حذف الطالب',
      text: 'هل أنت متأكد من حذف هذا الطالب؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      customClass: {
        popup: 'rtl-popup',
        title: 'rtl-title'
      }
    });

    if (result.isConfirmed) {
      try {
        if (typeof studentId === 'string' && studentId.length > 10) {
          await api.delete(`/students/${studentId}`);
        }

        setStudents(prevStudents =>
          prevStudents.filter(s => !(s._id === studentId || s.id === studentId))
        );

        await Swal.fire({
          title: 'تم الحذف!',
          text: 'تم حذف الطالب بنجاح',
          icon: 'success',
          confirmButtonText: 'موافق',
          customClass: { popup: 'rtl-popup', title: 'rtl-title' }
        });
      } catch (deleteError) {
        console.error('❌ فشل في حذف الطالب:', deleteError);
        await Swal.fire({
          title: 'خطأ!',
          text: 'حدث خطأ أثناء حذف الطالب',
          icon: 'error',
          confirmButtonText: 'موافق',
          customClass: { popup: 'rtl-popup', title: 'rtl-title' }
        });
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
  const handleAddSuccess = async (studentData: StudentFormData) => {
    try {
      if (isEditMode && selectedStudent) {
        const response = await api.put(`/students/${selectedStudent._id}`, studentData);
        setStudents(prev => prev.map(s => 
          s._id === selectedStudent._id ? response.data : s
        ));
      } else {
        const response = await api.post('/students', studentData);
        setStudents(prev => [...prev, response.data]);
      }

      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('خطأ في حفظ الطالب:', error);
      setError('حدث خطأ أثناء حفظ الطالب');
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['رقم الطالب', 'الاسم الأول', 'اسم الأب', 'اسم العائلة', 'رقم الهوية', 'العمر', 'الجنس', 'المعلم', 'الحلقة'];
    const rows = filteredAndSortedStudents.map(s => [
      s.studentId, s.firstName, s.fatherName, s.lastName, 
      s.idNumber, s.age, s.gender, s.teacher, s.group
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGroup('all');
    setSelectedGender('all');
    setSelectedTeacher('all');
    setAgeRange([0, 100]);
    setCurrentPage(1);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) return;

    const result = await Swal.fire({
      title: `حذف ${selectedStudents.size} طالب`,
      text: 'هل أنت متأكد من حذف الطلاب المحددين؟',
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
          Array.from(selectedStudents).map(id => api.delete(`/students/${id}`))
        );
        
        setStudents(prev => prev.filter(s => !selectedStudents.has(s._id || '')));
        setSelectedStudents(new Set());
        
        await Swal.fire('تم الحذف!', 'تم حذف الطلاب بنجاح', 'success');
      } catch (bulkDeleteError) {
        console.error('❌ فشل في حذف الطلاب:', bulkDeleteError);
        await Swal.fire('خطأ!', 'حدث خطأ أثناء حذف الطلاب', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 text-right">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <FaUserGraduate className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
                  <p className="text-gray-600 text-sm mt-1">نظام متكامل لإدارة بيانات الطلاب</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fetchStudents()}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${
                  isLoading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                }`}
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoading ? 'جاري التحديث...' : 'تحديث'}
              </button>
              
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-6">
                <input
                  type="text"
                  placeholder="ابحث عن طالب (الاسم، رقم الهوية، رقم الطالب، المعلم، الحلقة...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-right"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="md:col-span-3 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">جميع الحلقات ({groups.length})</option>
                {groups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`md:col-span-2 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl transition-all ${
                  showFilters 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <FaFilter className="w-4 h-4" />
                فلاتر
              </button>
              
              <button
                onClick={resetFilters}
                className="md:col-span-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                title="إعادة تعيين الفلاتر"
              >
                <svg className="w-5 h-5 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الجنس</label>
                    <select
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">الكل</option>
                      <option value="ذكر">ذكر</option>
                      <option value="انثى">أنثى</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المعلم</label>
                    <select
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">جميع المعلمين ({teachers.length})</option>
                      {teachers.map(teacher => (
                        <option key={teacher} value={teacher}>{teacher}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العمر: {ageRange[0]} - {ageRange[1]} سنة
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ageRange[1]}
                      onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عرض</label>
                    <select
                      value={studentsPerPage}
                      onChange={(e) => {
                        setStudentsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="10">10 طلاب</option>
                      <option value="25">25 طالب</option>
                      <option value="50">50 طالب</option>
                      <option value="100">100 طالب</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUserGraduate className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">إجمالي</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-cyan-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">ذكور</p>
                <p className="text-xl font-bold text-gray-900">{stats.male}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-pink-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">إناث</p>
                <p className="text-xl font-bold text-gray-900">{stats.female}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaBook className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">الحلقات</p>
                <p className="text-xl font-bold text-gray-900">{stats.groups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">معلمين</p>
                <p className="text-xl font-bold text-gray-900">{stats.teachers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-lg border-r-4 border-amber-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FaChartBar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">متوسط العمر</p>
                <p className="text-xl font-bold text-gray-900">{stats.avgAge}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedTeacher !== 'all' || selectedGroup !== 'all' || selectedGender !== 'all' || ageRange[0] !== 0 || ageRange[1] !== 100 || searchTerm) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="text-blue-700 font-medium">الفلاتر المطبقة:</span>
                {selectedTeacher !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    👨‍🏫 {selectedTeacher}
                    <button
                      onClick={() => setSelectedTeacher('all')}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedGroup !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    📚 {selectedGroup}
                    <button
                      onClick={() => setSelectedGroup('all')}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedGender !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {selectedGender === 'ذكر' ? '👦' : '👧'} {selectedGender}
                    <button
                      onClick={() => setSelectedGender('all')}
                      className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {(ageRange[0] !== 0 || ageRange[1] !== 100) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                    🎂 {ageRange[0]}-{ageRange[1]} سنة
                    <button
                      onClick={() => setAgeRange([0, 100])}
                      className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    🔍 "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
              <span className="text-blue-600 text-sm font-medium">
                {filteredAndSortedStudents.length} من {students.length} طالب
              </span>
            </div>
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
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 animate-fadeIn">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-600 ml-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">مشكلة في تحميل البيانات</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => fetchStudents(retryCount)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  المحاولة مرة أخرى
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">جاري تحميل بيانات الطلاب</h3>
              <p className="text-gray-600">الرجاء الانتظار...</p>
            </div>
          </div>
        )}

        {/* Students Table */}
        {!isLoading && filteredAndSortedStudents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto" dir="rtl">
              <table className="w-full" dir="rtl">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(new Set(currentStudents.map(s => s._id || '')));
                          } else {
                            setSelectedStudents(new Set());
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('studentId')}
                    >
                      <div className="flex items-center gap-2">
                        رقم الطالب
                        {sortField === 'studentId' && (
                          sortOrder === 'asc' ? <FaSortAmountUp className="w-3 h-3" /> : <FaSortAmountDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('firstName')}
                    >
                      <div className="flex items-center gap-2">
                        الاسم الكامل
                        {sortField === 'firstName' && (
                          sortOrder === 'asc' ? <FaSortAmountUp className="w-3 h-3" /> : <FaSortAmountDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">رقم الهوية</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الجنس</th>
                    <th 
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('age')}
                    >
                      <div className="flex items-center gap-2">
                        العمر
                        {sortField === 'age' && (
                          sortOrder === 'asc' ? <FaSortAmountUp className="w-3 h-3" /> : <FaSortAmountDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المعلم</th>
                    <th 
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('group')}
                    >
                      <div className="flex items-center gap-2">
                        الحلقة
                        {sortField === 'group' && (
                          sortOrder === 'asc' ? <FaSortAmountUp className="w-3 h-3" /> : <FaSortAmountDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentStudents.map((student) => (
                    <tr
                      key={student._id || student.id}
                      className="hover:bg-blue-50 transition-colors"
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.gender === 'ذكر' 
                            ? 'bg-cyan-100 text-cyan-800' 
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {student.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.age} سنة
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.teacher}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {student.group}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id || student.id!)}
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

        {/* Empty State */}
        {!isLoading && filteredAndSortedStudents.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <FaUserGraduate className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا يوجد طلاب</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedGroup !== 'all'
                ? 'لم يتم العثور على نتائج مطابقة للبحث'
                : 'ابدأ بإضافة طالب جديد للنظام'}
            </p>
            {!searchTerm && selectedGroup === 'all' && (
              <button
                onClick={() => setIsFormVisible(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
              >
                <FaPlus className="w-4 h-4" />
                إضافة طالب جديد
              </button>
            )}
          </div>
        )}

        {/* Enhanced Pagination */}
        {!isLoading && filteredAndSortedStudents.length > studentsPerPage && (
          <div className="bg-white rounded-2xl shadow-xl px-6 py-4 mt-6" dir="rtl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                عرض <span className="font-semibold">{indexOfFirstStudent + 1}</span> إلى{' '}
                <span className="font-semibold">
                  {Math.min(indexOfLastStudent, filteredAndSortedStudents.length)}
                </span>{' '}
                من <span className="font-semibold">{filteredAndSortedStudents.length}</span> طالب
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  الأولى
                </button>
                
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <FaChevronRight className="w-3 h-3" />
                  السابق
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  التالي
                  <FaChevronLeft className="w-3 h-3" />
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  الأخيرة
                </button>
              </div>
            </div>
          </div>
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StudentsManagement;