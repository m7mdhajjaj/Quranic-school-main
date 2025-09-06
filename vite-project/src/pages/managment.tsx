import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// API base URL
const API_URL = "http://localhost:5005/api";

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
  gender: "ذكر" | "انثى";
  residence: string;
  teacher: string;
  group: string;
}

// Define User interface for authentication
interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  role: string;
  groups?: string[];
}

const Managment: React.FC = () => {
  // Navigation hook for redirects
  const navigate = useNavigate();

  // User authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState<boolean>(false);

  // States
  const [students, setStudents] = useState<Student[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all"); // New state for selected group
  const [currentPage, setCurrentPage] = useState(1);
  const [groups, setGroups] = useState<string[]>(['ازهار الحمد"المهاجرين ب']);
  const [isLoading, setIsLoading] = useState(false);
  const studentsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState<Omit<Student, "id">>({
    studentId: 0, // Will be set automatically when adding a new student
    idNumber: "", // رقم الهوية (سيستخدم ككلمة مرور)
    firstName: "",
    fatherName: "",
    grandFatherName: "",
    motherName: "",
    lastName: "",
    birthDate: "",
    age: 0,
    gender: "ذكر",
    residence: "نابلس",
    teacher: "محمد حجاج",
    group: 'ازهار الحمد"المهاجرين ب',
  });

  const [currentStudentId, setCurrentStudentId] = useState<
    string | number | null
  >(null);

  // Check user authentication and role
  useEffect(() => {
    // Check if the user is logged in
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson) as User;
        setCurrentUser(userData);

        // Check if the user is a teacher or admin
        if (userData.role === "teacher" || userData.role === "admin") {
          setIsTeacherOrAdmin(true);
        } else {
          // Redirect students to the 404 page
          navigate("/404");
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
        // Redirect to 404 if there's an error
        navigate("/404");
      }
    } else {
      // Redirect unauthenticated users to the 404 page
      navigate("/404");
    }
  }, [navigate]);

  // Load students from the API
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/students`);
        setStudents(response.data);

        // Extract unique groups from students
        const uniqueGroups = [
          ...new Set(response.data.map((student: Student) => student.group)),
        ] as string[];
        setGroups(uniqueGroups);
      } catch (error) {
        console.error("Error fetching students:", error);
        // Fallback to example data if API fails
        const exampleStudents: Student[] = [
          {
            id: 1,
            studentId: 100001,
            idNumber: "123456789",
            firstName: "أحمد",
            fatherName: "محمد",
            grandFatherName: "علي",
            motherName: "سمر",
            lastName: "عثمان",
            birthDate: "2015-05-12",
            age: 10,
            gender: "ذكر",
            residence: "نابلس",
            teacher: "محمد حجاج",
            group: 'ازهار الحمد"المهاجرين ب',
          },
          {
            id: 2,
            studentId: 100002,
            idNumber: "987654321",
            firstName: "سارة",
            fatherName: "خالد",
            grandFatherName: "محمود",
            motherName: "ريم",
            lastName: "السعدي",
            birthDate: "2016-08-23",
            age: 9,
            gender: "انثى",
            residence: "نابلس",
            teacher: "محمد حجاج",
            group: 'ازهار الحمد"المهاجرين ب',
          },
          {
            id: 3,
            studentId: 100003,
            idNumber: "456123789",
            firstName: "عمر",
            fatherName: "أحمد",
            grandFatherName: "فؤاد",
            motherName: "هدى",
            lastName: "شاهين",
            birthDate: "2014-03-15",
            age: 11,
            gender: "ذكر",
            residence: "نابلس",
            teacher: "محمد حجاج",
            group: 'ازهار الحمد"المهاجرين ب',
          },
        ];
        setStudents(exampleStudents);

        // Extract unique groups from example students
        const uniqueGroups = [
          ...new Set(exampleStudents.map((student) => student.group)),
        ];
        setGroups(uniqueGroups);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;

    const today = new Date();
    const birthDateObj = new Date(birthDate);

    // Check if the date is valid
    if (isNaN(birthDateObj.getTime())) return 0;

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "birthDate") {
      const age = calculateAge(value);
      setFormData({
        ...formData,
        [name]: value,
        age: isNaN(age) ? 0 : age, // Ensure age is a number
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const requiredFields: Array<{
      field: keyof typeof formData;
      label: string;
    }> = [
      { field: "firstName", label: "الاسم" },
      { field: "fatherName", label: "اسم الأب" },
      { field: "grandFatherName", label: "اسم الجد" },
      { field: "lastName", label: "اسم العائلة" },
      { field: "motherName", label: "اسم الأم" },
      { field: "birthDate", label: "تاريخ الميلاد" },
      { field: "group", label: "اسم الحلقة" },
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field]) {
        alert(`الرجاء إدخال ${label}`);
        return;
      }
    }

    try {
      // Validate age is a number
      if (isNaN(formData.age) || formData.age <= 0) {
        alert("العمر يجب أن يكون رقماً موجباً");
        return;
      }

      const studentData = {
        ...formData,
        age: isNaN(formData.age) ? 0 : formData.age,
      };

      console.log("Sending student data:", studentData);

      if (isEditMode && currentStudentId !== null) {
        // Find the student with the current ID
        const studentToUpdate = students.find(
          (student) =>
            (typeof currentStudentId === "string" &&
              student._id === currentStudentId) ||
            (typeof currentStudentId === "number" &&
              student.id === currentStudentId)
        );

        if (studentToUpdate?._id) {
          // Update student in the database
          const response = await axios.put(
            `${API_URL}/students/${studentToUpdate._id}`,
            studentData
          );

          // Update the students list
          setStudents(
            students.map((student) =>
              student._id === studentToUpdate._id ? response.data : student
            )
          );
        } else {
          // Fallback to local update if no MongoDB ID is available
          setStudents(
            students.map((student) =>
              student.id === currentStudentId
                ? {
                    ...studentData,
                    id: currentStudentId,
                  }
                : student
            )
          );
        }
      } else {
        // Add new student to the database
        console.log(
          `Posting to ${API_URL}/students with data:`,
          JSON.stringify(studentData, null, 2)
        );

        try {
          const response = await axios.post(
            `${API_URL}/students`,
            studentData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Server response:", response.data);

          // Add the new student to the local state
          setStudents([...students, response.data]);
        } catch (apiError: any) {
          console.error("API Error details:", apiError);

          if (apiError.response) {
            console.error("Response data:", apiError.response.data);
            console.error("Response status:", apiError.response.status);
            throw apiError;
          } else if (apiError.request) {
            console.error("No response received:", apiError.request);
            throw new Error(
              "لم يتم تلقي استجابة من الخادم. تحقق من اتصالك بالإنترنت."
            );
          } else {
            console.error("Error setting up request:", apiError.message);
            throw apiError;
          }
        }
      }

      // Reset form
      resetForm();
    } catch (error: any) {
      console.error("Error saving student:", error);

      // Show more detailed error
      if (error.response && error.response.data) {
        console.error("Server error details:", error.response.data);

        // Handle different types of error messages
        let errorMessage;
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else {
          errorMessage =
            "حدث خطأ أثناء حفظ بيانات الطالب. يرجى المحاولة مرة أخرى.";
        }

        alert(`خطأ: ${errorMessage}`);
      } else {
        alert("حدث خطأ أثناء حفظ بيانات الطالب. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  // Handle edit button click
  const handleEdit = (student: Student) => {
    setIsFormVisible(true);
    setIsEditMode(true);
    setCurrentStudentId(student._id || student.id || null);
    setFormData({
      studentId: student.studentId,
      idNumber: student.idNumber,
      firstName: student.firstName,
      fatherName: student.fatherName,
      grandFatherName: student.grandFatherName,
      motherName: student.motherName,
      lastName: student.lastName,
      birthDate: student.birthDate,
      age: student.age,
      gender: student.gender,
      residence: student.residence,
      teacher: student.teacher,
      group: student.group,
    });
  };

  // Handle delete button click
  const handleDelete = async (studentId: string | number | undefined) => {
    if (!studentId) return;

    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا الطالب؟")) {
      try {
        // Find the student with the given ID
        const studentToDelete = students.find(
          (student) => student._id === studentId || student.id === studentId
        );

        if (studentToDelete?._id) {
          // Delete from database if MongoDB ID exists
          await axios.delete(`${API_URL}/students/${studentToDelete._id}`);
        }

        // Remove from local state
        setStudents(
          students.filter(
            (student) =>
              !(student._id === studentId || student.id === studentId)
          )
        );
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("حدث خطأ أثناء حذف الطالب. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      studentId: 0,
      idNumber: "",
      firstName: "",
      fatherName: "",
      grandFatherName: "",
      motherName: "",
      lastName: "",
      birthDate: "",
      age: 0,
      gender: "ذكر",
      residence: "نابلس",
      teacher: "محمد حجاج",
      group: 'ازهار الحمد"المهاجرين ب',
    });
    setIsFormVisible(false);
    setIsEditMode(false);
    setCurrentStudentId(null);
  };

  // Toggle form visibility
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
    if (isEditMode) {
      resetForm();
    }
  };

  // Filter students based on search and selected group
  const filteredStudents = students.filter((student) => {
    // First check if the student belongs to the selected group
    const groupMatches =
      selectedGroup === "all" || student.group === selectedGroup;

    // Then check if the student matches the search term
    const searchMatches =
      student.firstName.includes(searchTerm) ||
      student.lastName.includes(searchTerm) ||
      `${student.firstName} ${student.fatherName} ${student.lastName}`.includes(
        searchTerm
      ) ||
      student.studentId.toString().includes(searchTerm);

    // Both conditions must be true
    return groupMatches && searchMatches;
  });

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mx-auto p-4 my-4" dir="rtl">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-emerald-700 mb-8 text-center border-b pb-2 border-emerald-200">
            إدارة الطلاب
          </h1>

          {/* Search, Filter by Group, and Add Student - Symmetrical layout */}
          <div className="flex flex-wrap items-center mb-8 gap-6 justify-between mt-8">
            {/* Left side - Add student button */}
            <div className="flex-grow-0">
              <button
                onClick={toggleFormVisibility}
                className={`flex items-center px-5 py-3 rounded-lg text-white font-medium transition-colors shadow-md ${
                  isFormVisible
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}>
                {isFormVisible ? (
                  <>
                    <FaTimes className="ml-2" /> إلغاء
                  </>
                ) : (
                  <>
                    <FaPlus className="ml-2" /> إضافة طالب جديد
                  </>
                )}
              </button>
            </div>

            {/* Center - Group filter dropdown */}
            <div className="flex-grow max-w-md mx-4">
              <div className="flex items-center">
                <span className="text-gray-700 font-medium ml-2">
                  تصفية حسب الحلقة
                </span>
                <div className="relative flex-grow">
                  <select
                    className="appearance-none w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm pr-10"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}>
                    <option value="all">جميع الطلاب</option>
                    {groups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Search bar */}
            <div className="relative flex-grow max-w-md">
              <div className="flex items-center">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="البحث عن طالب..."
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student Form */}
          {isFormVisible && (
            <div className="bg-white p-6 mb-8 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-emerald-700 mb-4">
                {isEditMode ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      الاسم
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Father Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      اسم الأب
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Grandfather Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      اسم الجد
                    </label>
                    <input
                      type="text"
                      name="grandFatherName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.grandFatherName}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Mother Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      اسم الأم
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.motherName}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* ID Number (used for login) */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      رقم الهوية (كلمة المرور)
                    </label>
                    <input
                      type="text"
                      name="idNumber"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      سيتم استخدام رقم الهوية ككلمة مرور لتسجيل الدخول
                    </p>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      اسم العائلة
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      تاريخ الميلاد
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Age - Calculated automatically */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      العمر
                    </label>
                    <input
                      type="number"
                      name="age"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md"
                      value={formData.age}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      يتم حسابه تلقائيًا من تاريخ الميلاد
                    </p>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      الجنس
                    </label>
                    <select
                      name="gender"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.gender}
                      onChange={handleInputChange}>
                      <option value="ذكر">ذكر</option>
                      <option value="انثى">انثى</option>
                    </select>
                  </div>

                  {/* Residence */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      مكان السكن
                    </label>
                    <input
                      type="text"
                      name="residence"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.residence}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Teacher */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      اسم المعلم
                    </label>
                    <select
                      name="teacher"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.teacher}
                      onChange={handleInputChange}>
                      <option value="محمد حجاج">محمد حجاج</option>
                    </select>
                  </div>

                  {/* Group */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      اسم الحلقة
                    </label>
                    <select
                      name="group"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.group}
                      onChange={handleInputChange}>
                      <option value='ازهار الحمد"المهاجرين ب'>
                        ازهار الحمد"المهاجرين ب
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors">
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
                    {isEditMode ? "تحديث البيانات" : "إضافة الطالب"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Students Table */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
                <p className="mr-3 text-lg text-gray-600">
                  جاري تحميل البيانات...
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الطالب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الاسم الكامل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العمر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الجنس
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مكان السكن
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المعلم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحلقة
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents.length > 0 ? (
                      currentStudents.map((student, index) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {indexOfFirstStudent + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {`${student.firstName} ${student.fatherName} ${student.grandFatherName} ${student.lastName}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              الأم: {student.motherName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.age}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                student.gender === "ذكر"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-pink-100 text-pink-800"
                              }`}>
                              {student.gender}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.residence}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.teacher}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.group}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <div className="flex justify-center space-x-3 space-x-reverse">
                              <button
                                onClick={() => handleEdit(student)}
                                className="text-emerald-600 hover:text-emerald-800"
                                title="تعديل">
                                <FaEdit size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(student._id || student.id)
                                }
                                className="text-red-600 hover:text-red-800"
                                title="حذف">
                                <FaTrash size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  navigate("/تواصل-مع-المعلم", {
                                    state: {
                                      studentId: student._id || student.id,
                                      studentName: `${student.firstName} ${student.lastName}`,
                                      studentGroup: student.group,
                                    },
                                  })
                                }
                                className="text-blue-600 hover:text-blue-800"
                                title="محادثة الطالب">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-4 text-center text-gray-500">
                          {searchTerm
                            ? "لا توجد نتائج مطابقة للبحث"
                            : "لا يوجد طلاب حاليًا"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        عرض{" "}
                        <span className="font-medium">
                          {indexOfFirstStudent + 1}
                        </span>{" "}
                        إلى{" "}
                        <span className="font-medium">
                          {Math.min(
                            indexOfLastStudent,
                            filteredStudents.length
                          )}
                        </span>{" "}
                        من أصل{" "}
                        <span className="font-medium">
                          {filteredStudents.length}
                        </span>{" "}
                        طالب
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}>
                          التالي
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === index + 1
                                ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}>
                            {index + 1}
                          </button>
                        ))}

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-300"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}>
                          السابق
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Total Count */}
          <div className="mt-4 text-gray-700">
            <p>
              {selectedGroup === "all" ? (
                <>
                  إجمالي عدد الطلاب:{" "}
                  <span className="font-bold">{students.length}</span>
                </>
              ) : (
                <>
                  عدد الطلاب في الحلقة:{" "}
                  <span className="font-bold">{filteredStudents.length}</span>{" "}
                  من أصل <span className="font-bold">{students.length}</span>
                </>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Managment;
