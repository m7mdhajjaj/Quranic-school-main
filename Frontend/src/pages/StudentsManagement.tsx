import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
// import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import AddStudentFormWithYup from '../components/AddStudentForm';
import Swal from 'sweetalert2';
import '../styles/sweetalert.css';

// Form data interface for student creation
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

// Define Student Type
interface Student {
  _id?: string; // MongoDB ID
  id?: number; // Legacy ID for local storage
  studentId: number; // 6-digit unique student ID starting from 100000
  idNumber: string; // رقم الهوية (سيستخدم ككلمة مرور)
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
}

const StudentsManagement: React.FC = () => {
  // Navigation hook for redirects (unused for now)
  // const navigate = useNavigate();

  // Authentication
  const { user: currentUser } = useAuth();

  // التحقق من الصلاحيات
  const userRole = currentUser?.role || '';
  const hasPermission = userRole === 'teacher' || userRole === 'admin';

  // States
  const [students, setStudents] = useState<Student[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [groups, setGroups] = useState<string[]>(['ازهار الحمد"المهاجرين ب']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const studentsPerPage = 10;

  // Form state - handled by AddStudentFormWithYup component
  // const [formData, setFormData] = useState<Omit<Student, "id">>({...});
  // const [currentStudentId, setCurrentStudentId] = useState<string | number | null>(null);

  // Load students from the API
  useEffect(() => {
    if (!hasPermission) return; // لا نحمّل البيانات إذا لم تكن هناك صلاحية

    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/students');
        setStudents(response.data);

        // Extract unique groups from students
        const uniqueGroups = [
          ...new Set(response.data.map((student: Student) => student.group)),
        ] as string[];
        setGroups(uniqueGroups);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('حدث خطأ في تحميل البيانات');
        // Fallback to example data if API fails
        const exampleStudents: Student[] = [
          {
            id: 1,
            studentId: 100001,
            idNumber: '123456789',
            firstName: 'أحمد',
            fatherName: 'محمد',
            grandFatherName: 'علي',
            motherName: 'سمر',
            lastName: 'عثمان',
            birthDate: '2015-05-12',
            age: 10,
            gender: 'ذكر',
            residence: 'نابلس',
            teacher: 'محمد حجاج',
            group: 'ازهار الحمد"المهاجرين ب',
          },
        ];
        setStudents(exampleStudents);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [hasPermission]);

  // Handle delete student
  const handleDelete = async (studentId: string | number) => {
    const result = await Swal.fire({
      title: 'تأكيد حذف الطالب',
      text: 'هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء!',
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
        // Delete from database if it has _id (from API)
        if (typeof studentId === 'string' && studentId.length > 10) {
          await api.delete(`/students/${studentId}`);
        }

        // Remove from local state
        setStudents((prevStudents) =>
          prevStudents.filter(
            (student) =>
              !(student._id === studentId || student.id === studentId)
          )
        );

        // Success message
        await Swal.fire({
          title: 'تم الحذف!',
          text: 'تم حذف الطالب بنجاح',
          icon: 'success',
          confirmButtonText: 'موافق',
          customClass: {
            popup: 'rtl-popup',
            title: 'rtl-title'
          }
        });
      } catch (error) {
        console.error('Error deleting student:', error);
        
        // Error message
        await Swal.fire({
          title: 'خطأ!',
          text: 'حدث خطأ أثناء حذف الطالب. يرجى المحاولة مرة أخرى.',
          icon: 'error',
          confirmButtonText: 'موافق',
          customClass: {
            popup: 'rtl-popup',
            title: 'rtl-title'
          }
        });
      }
    }
  };

  // TODO: Enable editing functionality
  const handleEdit = (student: Student) => {
    console.log('تعديل الطالب:', student);
    // Will be implemented later with edit support in AddStudentFormWithYup
    // setFormData({...});
    // setCurrentStudentId(student._id || student.id || null);
    setIsEditMode(true);
    setIsFormVisible(true);
  };

  const handleAddSuccess = async (studentData: StudentFormData) => {
    try {
      // إرسال البيانات لـ Backend
      const response = await api.post('/students', studentData);

      // إضافة الطالب الجديد للـ state
      setStudents((prevStudents) => [...prevStudents, response.data]);

      // إغلاق الفورم
      setIsFormVisible(false);
      setError('');

      // رسالة نجاح (يمكن إضافة toast notification هنا)
      console.log('تم إضافة الطالب بنجاح:', response.data);
    } catch (error) {
      console.error('خطأ في إضافة الطالب:', error);
      setError('حدث خطأ أثناء إضافة الطالب');
    }
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setIsEditMode(false);
    // setCurrentStudentId(null);
  };

  // Filter students based on search and group selection
  const filteredStudents = students.filter((student: Student) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.fatherName.toLowerCase().includes(searchLower) ||
      student.idNumber.includes(searchLower) ||
      student.studentId.toString().includes(searchLower);

    const matchesGroup =
      selectedGroup === 'all' || student.group === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
              <p className="text-gray-600 mt-1">إضافة وتعديل وحذف الطلاب</p>
            </div>
            <button
              onClick={() => {
                setIsEditMode(false);
                // setCurrentStudentId(null);
                setIsFormVisible(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaPlus className="w-4 h-4" />
              إضافة طالب جديد
            </button>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <input
                type="text"
                placeholder="ابحث عن طالب (الاسم، رقم الهوية، رقم الطالب...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              title="فلتر الحلقات"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الحلقات</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border-r-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الطلاب</p>
                <p className="text-3xl font-bold text-gray-900">
                  {students.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-r-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">الطلاب النشطين</p>
                <p className="text-3xl font-bold text-gray-900">
                  {students.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-r-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">نتائج البحث</p>
                <p className="text-3xl font-bold text-gray-900">
                  {filteredStudents.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 ml-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        )}

        {/* Students Table */}
        {!isLoading && filteredStudents.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto" dir="rtl">
              <table className="w-full" dir="rtl">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      رقم الطالب
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      الاسم الكامل
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      رقم الهوية
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      المعلم
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      العمر
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      الحلقة
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentStudents.map((student: Student) => (
                    <tr
                      key={student._id || student.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.fatherName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.idNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.teacher}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.age} سنة
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.group}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleEdit(student)}
                          title="تعديل"
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(student._id || student.id!)
                          }
                          title="حذف"
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredStudents.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              لا يوجد طلاب
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm
                ? 'لم يتم العثور على نتائج للبحث'
                : 'ابدأ بإضافة طالب جديد'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsFormVisible(true)}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إضافة طالب جديد
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredStudents.length > studentsPerPage && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                السابق
              </button>
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      currentPage + 1,
                      Math.ceil(filteredStudents.length / studentsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredStudents.length / studentsPerPage)
                }
                className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                التالي
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  عرض{' '}
                  <span className="font-medium">{indexOfFirstStudent + 1}</span>{' '}
                  إلى{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastStudent, filteredStudents.length)}
                  </span>{' '}
                  من{' '}
                  <span className="font-medium">{filteredStudents.length}</span>{' '}
                  طالب
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Form Modal */}
      {isFormVisible && (
        <AddStudentFormWithYup
          onClose={handleCloseForm}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
};

export default StudentsManagement;
