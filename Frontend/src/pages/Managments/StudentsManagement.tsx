// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   FaEdit,
//   FaTrash,
//   FaPlus,
//   FaSearch,
//   FaDownload,
//   FaFilter,
//   FaSortAmountDown,
//   FaSortAmountUp,
//   FaUserGraduate,
//   FaChartBar,
// } from "react-icons/fa";
// import { useAuth } from "../../hooks/useAuth";
// import { useSocket } from "../../hooks/useSocket";
// import api from "../../Api/api";
// import AddStudentFormWithYup from "../../components/Forms/AddStudentForm";
// import ResponsivePagination from "../../components/Pagination/ResponsivePagination";
// import Swal from "sweetalert2";
// import "../../styles/sweetalert.css";

// interface StudentFormData {
//   firstName: string;
//   fatherName: string;
//   grandFatherName: string;
//   motherName: string;
//   lastName: string;
//   idNumber: string;
//   birthDate: string;
//   gender: string;
//   residence: string;
//   teacher: string;
//   group: string;
//   email?: string;
//   phoneNumber: string;
// }

// interface Student {
//   _id?: string;
//   id?: number;
//   studentId: number;
//   idNumber: string;
//   firstName: string;
//   fatherName: string;
//   grandFatherName: string;
//   motherName: string;
//   lastName: string;
//   birthDate: string;
//   age: number;
//   gender: "ذكر" | "انثى";
//   residence: string;
//   teacher: string;
//   group: string;
//   phoneNumber?: string;
//   email?: string;
// }

// type SortField = "studentId" | "firstName" | "age" | "group";
// type SortOrder = "asc" | "desc";

// const StudentsManagement: React.FC = () => {
//   const { user: currentUser } = useAuth();
//   const { onStudentUpdate, offStudentUpdate } = useSocket();
//   const userRole = currentUser?.role || "";
//   const hasPermission = userRole === "teacher" || userRole === "admin";

//   // Core States
//   const [students, setStudents] = useState<Student[]>([]);
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [retryCount, setRetryCount] = useState(0);

//   // Filter & Search States
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedGender, setSelectedGender] = useState("all");
//   const [selectedGroup, setSelectedGroup] = useState("all");
//   const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
//   const [showFilters, setShowFilters] = useState(false);

//   // Sorting States
//   const [sortField, setSortField] = useState<SortField>("studentId");
//   const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

//   // Pagination States
//   const [currentPage, setCurrentPage] = useState(1);
//   const [studentsPerPage, setStudentsPerPage] = useState(10);

//   // View Mode State (for future use)
//   // const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

//   // Selected Students for Bulk Actions
//   const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
//     new Set()
//   );

//   // جميع الحلقات من قاعدة البيانات
//   const [allGroups, setAllGroups] = useState<{ _id: string; name: string }[]>(
//     []
//   );
//   useEffect(() => {
//     // جلب جميع الحلقات من قاعدة البيانات
//     import("../../Api/groupApi").then(({ getAllGroups }) => {
//       getAllGroups().then((result) => {
//         if (result.success && result.data) {
//           setAllGroups(
//             result.data.map((g: any) => ({ _id: g._id, name: g.name }))
//           );
//         }
//       });
//     });
//   }, []);

//   // Statistics
//   const stats = useMemo(() => {
//     const maleCount = students.filter((s) => s.gender === "ذكر").length;
//     const femaleCount = students.filter((s) => s.gender === "انثى").length;
//     const activeCount = students.length; // Assume all students are active for now
//     const inactiveCount = 0;
//     const avgAge =
//       students.length > 0
//         ? (
//             students.reduce((sum, s) => sum + (s.age || 0), 0) / students.length
//           ).toFixed(1)
//         : 0;

//     return {
//       total: students.length,
//       male: maleCount,
//       female: femaleCount,
//       active: activeCount,
//       inactive: inactiveCount,
//       avgAge,
//     };
//   }, [students]);

//   // Fetch students with optimized loading and duplicate prevention
//   const fetchStudents = useCallback(async (retryAttempt = 0) => {
//     if (isLoading) {
//       console.log("⚠️ تحميل البيانات قيد التنفيذ، تم تجاهل الطلب المضاعف");
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setRetryCount(retryAttempt);

//     try {
//       console.log("🚀 بدء تحميل بيانات الطلاب بشكل محسن...");
//       const startTime = performance.now();

//       // Load students data with optimized settings
//       const studentsResponse = await api.get("/students", {
//         timeout: 8000, // معقول للبيانات الكاملة
//         headers: {
//           Accept: "application/json",
//           "Cache-Control": "no-cache",
//         },
//       });

//       const endTime = performance.now();
//       const duration = (endTime - startTime).toFixed(2);

//       if (studentsResponse?.data && Array.isArray(studentsResponse.data)) {
//         // Validate and clean student data
//         const cleanedStudents = studentsResponse.data.map((student) => ({
//           ...student,
//           firstName: student.firstName || "",
//           lastName: student.lastName || "",
//           fatherName: student.fatherName || "",
//           idNumber: student.idNumber || "",
//           teacher: student.teacher || "غير محدد",
//           group: student.group || "غير محدد",
//           gender: student.gender || "غير محدد",
//           age: student.age || 0,
//         }));

//         console.log(
//           `✅ تم تحميل ${cleanedStudents.length} طالب بنجاح في ${duration}ms`
//         );
//         setStudents(cleanedStudents);
//         setError(null);
//         setRetryCount(0);
//       } else {
//         throw new Error("البيانات المستلمة غير صحيحة");
//       }
//     } catch (error: unknown) {
//       console.error(`❌ خطأ في تحميل الطلاب:`, error);

//       let errorMessage = "حدث خطأ في تحميل البيانات";

//       if (error instanceof Error) {
//         if (error.name === "AbortError" || error.message === "canceled") {
//           console.log("🔄 تم إلغاء الطلب السابق");
//           return; // Don't update state for cancelled requests
//         } else {
//           errorMessage = error.message || "خطأ غير محدد";
//         }
//       }

//       setError(errorMessage);
//       setStudents([]);
//       console.log("❌ فشل في تحميل بيانات الطلاب:", errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!hasPermission) return;

//     fetchStudents();
//   }, [hasPermission, fetchStudents]);

//   // Socket event handlers for real-time updates with debouncing
//   const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

//   useEffect(() => {
//     if (!hasPermission) return;

//     const handleStudentUpdate = (event: {
//       type: "created" | "updated" | "deleted";
//       student: Student;
//       studentId?: string;
//     }) => {
//       const now = Date.now();

//       // Debounce updates - prevent rapid successive updates
//       if (now - lastUpdateTime < 300) {
//         console.log("⚠️ Update debounced - too frequent");
//         return;
//       }
//       setLastUpdateTime(now);

//       console.log("📡 Received student update via socket:", event);

//       switch (event.type) {
//         case "created":
//           setStudents((prevStudents) => {
//             // Check if student already exists to prevent duplicates
//             const existingStudent = prevStudents.find(
//               (s) => s._id === event.student._id
//             );
//             if (existingStudent) {
//               console.log("Student already exists, skipping add");
//               return prevStudents;
//             }

//             console.log("➕ Adding new student to local state");
//             return [
//               ...prevStudents,
//               {
//                 ...event.student,
//                 gender: event.student.gender || "غير محدد",
//                 age: event.student.age || 0,
//               },
//             ];
//           });

//           // Log notification instead of showing toast
//           console.log(
//             "✅ طالب جديد تم إضافته:",
//             event.student.firstName,
//             event.student.lastName
//           );
//           break;

//         case "updated":
//           setStudents((prevStudents) =>
//             prevStudents.map((s) =>
//               s._id === event.student._id
//                 ? {
//                     ...event.student,
//                     gender: event.student.gender || "غير محدد",
//                     age: event.student.age || 0,
//                   }
//                 : s
//             )
//           );

//           // Log notification instead of showing toast
//           console.log(
//             "🔄 تم تحديث بيانات الطالب:",
//             event.student.firstName,
//             event.student.lastName
//           );
//           break;

//         case "deleted":
//           setStudents((prevStudents) =>
//             prevStudents.filter((s) => s._id !== event.studentId)
//           );

//           // Log notification instead of showing toast
//           console.log("🗑️ تم حذف طالب من قبل مستخدم آخر");
//           break;
//       }
//     };

//     // Subscribe to socket events
//     onStudentUpdate(handleStudentUpdate);

//     // Cleanup: unsubscribe from socket events
//     return () => {
//       offStudentUpdate(handleStudentUpdate);
//     };
//   }, [hasPermission, onStudentUpdate, offStudentUpdate, lastUpdateTime]);

//   // Handle sorting
//   const handleSort = (field: SortField) => {
//     if (sortField === field) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortField(field);
//       setSortOrder("asc");
//     }
//   };

//   // Filter and sort students
//   const filteredAndSortedStudents = useMemo(() => {
//     const filtered = students.filter((student) => {
//       // إذا تم اختيار حلقة معينة، اعرض فقط طلاب هذه الحلقة
//       if (selectedGroup !== "all") {
//         // تطبيع أسماء الحلقات للمقارنة (إزالة المسافات الزائدة وتوحيد الحروف)
//         const normalizeGroupName = (name: string) =>
//           (name || "").trim().replace(/\s+/g, " ").toLowerCase();

//         const studentGroupNormalized = normalizeGroupName(student.group);
//         const selectedGroupNormalized = normalizeGroupName(selectedGroup);

//         // تسجيل للتشخيص
//         console.log(`🔍 مقارنة الحلقات:`, {
//           studentGroup: student.group,
//           selectedGroup: selectedGroup,
//           studentGroupNormalized,
//           selectedGroupNormalized,
//           matches: studentGroupNormalized === selectedGroupNormalized,
//         });

//         if (studentGroupNormalized !== selectedGroupNormalized) {
//           return false;
//         }
//       }
//       const searchLower = searchTerm.toLowerCase();
//       const matchesSearch =
//         (student.firstName || "").toLowerCase().includes(searchLower) ||
//         (student.lastName || "").toLowerCase().includes(searchLower) ||
//         (student.fatherName || "").toLowerCase().includes(searchLower) ||
//         (student.idNumber || "").includes(searchLower) ||
//         student.studentId.toString().includes(searchLower) ||
//         (student.teacher || "").toLowerCase().includes(searchLower) ||
//         (student.group || "").toLowerCase().includes(searchLower);

//       const matchesGender =
//         selectedGender === "all" || student.gender === selectedGender;
//       const matchesAge =
//         student.age >= ageRange[0] && student.age <= ageRange[1];

//       return matchesSearch && matchesGender && matchesAge;
//     });

//     // Sort
//     filtered.sort((a, b) => {
//       let compareResult = 0;

//       if (sortField === "studentId") {
//         compareResult = a.studentId - b.studentId;
//       } else if (sortField === "firstName") {
//         compareResult = a.firstName.localeCompare(b.firstName, "ar");
//       } else if (sortField === "age") {
//         compareResult = a.age - b.age;
//       } else if (sortField === "group") {
//         compareResult = a.group.localeCompare(b.group, "ar");
//       }

//       return sortOrder === "asc" ? compareResult : -compareResult;
//     });

//     return filtered;
//   }, [
//     students,
//     searchTerm,
//     selectedGender,
//     selectedGroup,
//     ageRange,
//     sortField,
//     sortOrder,
//   ]);

//   // Pagination
//   const indexOfLastStudent = currentPage * studentsPerPage;
//   const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
//   const currentStudents = filteredAndSortedStudents.slice(
//     indexOfFirstStudent,
//     indexOfLastStudent
//   );
//   const totalPages = Math.ceil(
//     filteredAndSortedStudents.length / studentsPerPage
//   );

//   // Handle delete - Socket events will handle state updates automatically
//   const handleDelete = async (studentId: string | number) => {
//     // البحث عن الطالب للحصول على اسمه
//     const student = students.find(
//       (s) => s._id === studentId || s.id === studentId
//     );
//     const studentName = student
//       ? `${student.firstName} ${student.lastName}`
//       : "الطالب";

//     const result = await Swal.fire({
//       title: "تأكيد حذف الطالب \ud83d\udee1\ufe0f",
//       html: `
//         <div class="text-center">
//           <div class="mb-4">
//             <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
//               <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
//               </svg>
//             </div>
//           </div>
//           <p class="text-gray-600 mb-2">هل أنت متأكد من حذف:</p>
//           <p class="font-bold text-lg text-red-600">${studentName}</p>
//           <p class="text-sm text-gray-500 mt-2">هذه العملية لا يمكن التراجع عنها</p>
//         </div>
//       `,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc2626",
//       cancelButtonColor: "#6b7280",
//       confirmButtonText: "\ud83d\uddd1\ufe0f نعم، احذف",
//       cancelButtonText: "\u274c إلغاء",
//       reverseButtons: true,
//       focusCancel: true,
//       customClass: {
//         popup: "rtl-popup swal2-rtl-popup",
//         title: "rtl-title",
//         htmlContainer: "rtl-content",
//         confirmButton: "swal2-confirm-delete",
//         cancelButton: "swal2-cancel-delete",
//       },
//     });

//     if (result.isConfirmed) {
//       try {
//         if (typeof studentId === "string" && studentId.length > 10) {
//           // Delete via API - socket event will update UI automatically
//           await api.delete(`/students/${studentId}`);

//           // Show success message
//           await Swal.fire({
//             title: "تم الحذف!",
//             text: "تم حذف الطالب بنجاح",
//             icon: "success",
//             confirmButtonText: "موافق",
//             customClass: { popup: "rtl-popup", title: "rtl-title" },
//           });
//         }
//       } catch (deleteError) {
//         console.error("❌ فشل في حذف الطالب:", deleteError);
//         await Swal.fire({
//           title: "خطأ!",
//           text: "حدث خطأ أثناء حذف الطالب",
//           icon: "error",
//           confirmButtonText: "موافق",
//           customClass: { popup: "rtl-popup", title: "rtl-title" },
//         });
//       }
//     }
//   };

//   // Handle edit
//   const handleEdit = (student: Student) => {
//     setSelectedStudent(student);
//     setIsEditMode(true);
//     setIsFormVisible(true);
//   };

//   // Handle add/edit success - Socket events will handle state updates automatically
//   const handleAddSuccess = async (
//     studentData: StudentFormData | Student | any
//   ) => {
//     try {
//       if (isEditMode && selectedStudent) {
//         // Update student via API - socket event will update UI automatically
//         await api.put(`/students/${selectedStudent._id}`, studentData);
//       } else {
//         // Create new student via API - socket event will update UI automatically
//         await api.post("/students", studentData);
//       }

//       // Close form regardless of success
//       setIsFormVisible(false);
//       setIsEditMode(false);
//       setSelectedStudent(null);

//       // Show enhanced center messages
//       if (isEditMode) {
//         await Swal.fire({
//           title: "\u2728 تم التحديث بنجاح \u2728",
//           html: `
//             <div class="text-center py-4">
//               <div class="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
//                 <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
//                 </svg>
//               </div>
//               <p class="text-lg font-semibold text-gray-800 mb-2">تم تحديث بيانات</p>
//               <p class="text-2xl font-bold text-blue-600 mb-2">${
//                 studentData.firstName || "الطالب"
//               }</p>
//               <p class="text-sm text-gray-500">بنجاح في النظام \ud83d\ude80</p>
//             </div>
//           `,
//           icon: "success",
//           timer: 3500,
//           timerProgressBar: true,
//           showConfirmButton: false,
//           customClass: {
//             popup: "rtl-popup swal2-rtl-popup swal2-center-popup",
//             title: "rtl-title",
//             htmlContainer: "rtl-content",
//           },
//           didOpen: () => {
//             const popup = Swal.getPopup();
//             if (popup) {
//               popup.style.position = "fixed";
//               popup.style.top = "50%";
//               popup.style.left = "50%";
//               popup.style.transform = "translate(-50%, -50%)";
//               popup.style.zIndex = "9999";
//             }
//           },
//         });
//       } else {
//         await Swal.fire({
//           title: "\ud83c\udf89 مرحباً بالطالب الجديد \ud83c\udf89",
//           html: `
//             <div class="text-center py-4">
//               <div class="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
//                 <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
//                 </svg>
//               </div>
//               <p class="text-lg font-semibold text-gray-800 mb-2">تم إضافة الطالب</p>
//               <p class="text-2xl font-bold text-green-600 mb-2">${
//                 studentData.firstName || "الجديد"
//               }</p>
//               <p class="text-sm text-gray-500">إلى النظام بنجاح \ud83d\ude80</p>
//               <p class="text-xs text-green-600 mt-2">أهلاً وسهلاً \u2728</p>
//             </div>
//           `,
//           icon: "success",
//           timer: 4500,
//           timerProgressBar: true,
//           showConfirmButton: false,
//           customClass: {
//             popup: "rtl-popup swal2-rtl-popup swal2-center-popup",
//             title: "rtl-title",
//             htmlContainer: "rtl-content",
//           },
//           didOpen: () => {
//             const popup = Swal.getPopup();
//             if (popup) {
//               popup.style.position = "fixed";
//               popup.style.top = "50%";
//               popup.style.left = "50%";
//               popup.style.transform = "translate(-50%, -50%)";
//               popup.style.zIndex = "9999";
//             }
//           },
//         });
//       }
//     } catch (error: unknown) {
//       console.error("خطأ في حفظ الطالب:", error);
      
//       let errorMessage = "حدث خطأ أثناء معالجة بيانات الطالب";
//       let errorTitle = "حدث خطأ! ⚠️";
      
//       // معالجة أخطاء API المحددة
//       if (error && typeof error === 'object') {
//         const apiError = error as { response?: { data?: { message?: string } } };
        
//         if (apiError.response?.data?.message) {
//           const msg = apiError.response.data.message;
          
//           if (msg.includes('رقم الهوية')) {
//             errorTitle = "رقم هوية مكرر! 🚫";
//             errorMessage = "رقم الهوية موجود بالفعل في النظام. يرجى استخدام رقم هوية مختلف.";
//           } else if (msg.includes('رقم الهاتف') || msg.includes('phoneNumber')) {
//             errorTitle = "رقم هاتف مكرر! 📱";
//             errorMessage = "رقم الهاتف موجود بالفعل في النظام. يرجى استخدام رقم هاتف مختلف.";
//           } else if (msg.includes('لا يطابق معلم الحلقة')) {
//             errorTitle = "تعارض في الحلقة والمعلم! 👨‍🏫";
//             errorMessage = "المعلم المختار لا يطابق معلم الحلقة المحددة. يرجى التأكد من المطابقة.";
//           } else if (msg.includes('التحقق من البيانات')) {
//             errorTitle = "خطأ في البيانات! 📝";
//             errorMessage = "هناك خطأ في تنسيق البيانات المدخلة. يرجى مراجعة جميع الحقول.";
//           } else {
//             errorMessage = msg;
//           }
//         }
//       }

//       await Swal.fire({
//         title: errorTitle,
//         text: errorMessage,
//         icon: "error",
//         timer: 5000,
//         timerProgressBar: true,
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//         customClass: {
//           popup: "rtl-popup swal2-toast-rtl swal2-error-toast",
//           title: "rtl-title",
//           htmlContainer: "rtl-content",
//         },
//       });

//       // إعادة فتح النموذج في حالة الخطأ
//       setIsFormVisible(true);
//     }
//   };

//   // Export to CSV
//   const handleExport = () => {
//     const headers = [
//       "رقم الطالب",
//       "الاسم الأول",
//       "اسم الأب",
//       "اسم العائلة",
//       "رقم الهوية",
//       "العمر",
//       "الجنس",
//       "المعلم",
//       "الحلقة",
//     ];
//     const rows = filteredAndSortedStudents.map((s) => [
//       s.studentId,
//       s.firstName,
//       s.fatherName,
//       s.lastName,
//       s.idNumber,
//       s.age,
//       s.gender,
//       s.teacher,
//       s.group,
//     ]);

//     const csvContent = [headers, ...rows]
//       .map((row) => row.join(","))
//       .join("\n");

//     const blob = new Blob(["\ufeff" + csvContent], {
//       type: "text/csv;charset=utf-8;",
//     });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
//     link.click();
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setSearchTerm("");
//     setSelectedGender("all");
//     setSelectedGroup("all");
//     setAgeRange([0, 100]);
//     setCurrentPage(1);
//   };

//   // Bulk delete
//   const handleBulkDelete = async () => {
//     if (selectedStudents.size === 0) return;

//     const result = await Swal.fire({
//       title: `حذف ${selectedStudents.size} طالب`,
//       text: "هل أنت متأكد من حذف الطلاب المحددين؟",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "نعم، احذف الكل",
//       cancelButtonText: "إلغاء",
//     });

//     if (result.isConfirmed) {
//       try {
//         await Promise.all(
//           Array.from(selectedStudents).map((id) =>
//             api.delete(`/students/${id}`)
//           )
//         );

//         setStudents((prev) =>
//           prev.filter((s) => !selectedStudents.has(s._id || ""))
//         );
//         setSelectedStudents(new Set());

//         await Swal.fire({
//           title: "تم حذف الطلاب! \ud83d\uddd1\ufe0f",
//           text: `تم حذف ${selectedStudents.size} طالب بنجاح`,
//           icon: "success",
//           timer: 3000,
//           toast: true,
//           position: "top-end",
//           showConfirmButton: false,
//           customClass: {
//             popup: "rtl-popup swal2-toast-rtl swal2-success-toast",
//           },
//         });
//       } catch (bulkDeleteError) {
//         console.error("❌ فشل في حذف الطلاب:", bulkDeleteError);
//         await Swal.fire({
//           title: "فشل في الحذف! \u26a0\ufe0f",
//           text: "حدث خطأ أثناء حذف الطلاب",
//           icon: "error",
//           timer: 3000,
//           toast: true,
//           position: "top-end",
//           showConfirmButton: false,
//           customClass: {
//             popup: "rtl-popup swal2-toast-rtl swal2-error-toast",
//           },
//         });
//       }
//     }
//   };

//   return (
//     <div
//       className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 relative"
//       dir="rtl">
//       {/* Center Design Element */}
//       <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
//         <div className="relative">
//           {/* Vertical Line */}
//           <div className="absolute left-1/2 top-0 w-0.5 h-screen bg-gradient-to-b from-blue-400 via-indigo-500 to-purple-600 transform -translate-x-1/2"></div>
//           {/* Horizontal Line */}
//           <div className="absolute top-1/2 left-0 h-0.5 w-screen bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 transform -translate-y-1/2"></div>
//           {/* Center Circle */}
//           <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-2xl">
//             <FaUserGraduate className="w-16 h-16 text-white opacity-70" />
//           </div>
//           {/* Decorative Rings */}
//           <div className="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-blue-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
//           <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-indigo-200 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto relative z-10">
//         {/* Header Section */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 text-right">
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
//                   <FaUserGraduate className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold text-gray-900">
//                     إدارة الطلاب
//                   </h1>
//                   <p className="text-gray-600 text-sm mt-1">
//                     نظام متكامل لإدارة بيانات الطلاب
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-wrap items-center gap-3">

//               <button
//                 onClick={handleExport}
//                 className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg">
//                 <FaDownload className="w-4 h-4" />
//                 تصدير
//               </button>

//               <button
//                 onClick={() => {
//                   setIsEditMode(false);
//                   setSelectedStudent(null);
//                   setIsFormVisible(true);
//                 }}
//                 className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
//                 <FaPlus className="w-4 h-4" />
//                 إضافة طالب
//               </button>
//             </div>
//           </div>

//           {/* Search and Filters */}
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
//               <div className="relative md:col-span-7">
//                 <input
//                   type="text"
//                   placeholder="ابحث عن طالب (الاسم، رقم الهوية، رقم الطالب، المعلم، الحلقة...)"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-right"
//                 />
//                 <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//               </div>

//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className={`md:col-span-2 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl transition-all ${
//                   showFilters
//                     ? "border-blue-500 bg-blue-50 text-blue-600"
//                     : "border-gray-300 hover:border-blue-400"
//                 }`}>
//                 <FaFilter className="w-4 h-4" />
//                 فلاتر
//               </button>

//               <button
//                 onClick={() => setShowFilters(false)}
//                 className="md:col-span-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
//                 title="إغلاق الفلاتر">
//                 <svg
//                   className="w-5 h-5 text-gray-600 mx-auto"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>

//             {/* Extended Filters - Modern Design */}
//             {showFilters && (
//               <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border-2 border-gray-100 shadow-lg animate-fadeIn">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                   {/* Gender Filter */}
//                   <div className="space-y-3">
//                     <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
//                       <div className="w-2 h-2 rounded-full bg-pink-500"></div>
//                       تصفية حسب الجنس
//                     </label>
//                     <div className="grid grid-cols-3 gap-2">
//                       <button
//                         onClick={() => setSelectedGender("all")}
//                         title="عرض جميع الطلاب"
//                         className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
//                           selectedGender === "all"
//                             ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         }`}>
//                         الكل
//                       </button>
//                       <button
//                         onClick={() => setSelectedGender("ذكر")}
//                         title="عرض الطلاب الذكور فقط"
//                         className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
//                           selectedGender === "ذكر"
//                             ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         }`}>
//                         ذكر
//                       </button>
//                       <button
//                         onClick={() => setSelectedGender("انثى")}
//                         title="عرض الطالبات الإناث فقط"
//                         className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
//                           selectedGender === "انثى"
//                             ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         }`}>
//                         أنثى
//                       </button>
//                     </div>
//                   </div>

//                   {/* Group Filter */}
//                   <div className="space-y-3">
//                     <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
//                       <div className="w-2 h-2 rounded-full bg-purple-500"></div>
//                       تصفية حسب الحلقة
//                     </label>
//                     <select
//                       value={selectedGroup}
//                       onChange={(e) => setSelectedGroup(e.target.value)}
//                       className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 font-medium"
//                       title="اختيار الحلقة للفلترة">
//                       <option value="all">جميع الحلقات</option>
//                       {allGroups.map((group) => (
//                         <option key={group._id} value={group.name}>
//                           {group.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Age Range Filter */}
//                   <div className="space-y-3">
//                     <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
//                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                       العمر: {ageRange[0]} - {ageRange[1]} سنة
//                     </label>
//                     <div className="space-y-2">
//                       <input
//                         type="range"
//                         min="0"
//                         max="100"
//                         value={ageRange[1]}
//                         onChange={(e) =>
//                           setAgeRange([ageRange[0], parseInt(e.target.value)])
//                         }
//                         className="w-full h-2 bg-gradient-to-r from-green-200 to-green-400 rounded-lg appearance-none cursor-pointer"
//                         title={`العمر: ${ageRange[0]} - ${ageRange[1]} سنة`}
//                       />
//                       <div className="flex justify-between text-xs text-gray-500">
//                         <span>0</span>
//                         <span>50</span>
//                         <span>100</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Items per page */}
//                   <div className="space-y-3">
//                     <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
//                       <div className="w-2 h-2 rounded-full bg-purple-500"></div>
//                       عدد الطلاب في الصفحة
//                     </label>
//                     <select
//                       value={studentsPerPage}
//                       onChange={(e) => {
//                         setStudentsPerPage(parseInt(e.target.value));
//                         setCurrentPage(1);
//                       }}
//                       title="اختيار عدد الطلاب المعروضين في الصفحة"
//                       className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 font-medium">
//                       <option value="10">10 طلاب</option>
//                       <option value="25">25 طالب</option>
//                       <option value="50">50 طالب</option>
//                       <option value="100">100 طالب</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Filter Summary */}
//                 <div className="mt-6 pt-4 border-t border-gray-200">
//                   <div className="flex flex-wrap items-center gap-2">
//                     <span className="text-sm text-gray-600 font-medium">
//                       الفلاتر النشطة:
//                     </span>
//                     {selectedGender !== "all" && (
//                       <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">
//                         الجنس: {selectedGender}
//                       </span>
//                     )}
//                     {selectedGroup !== "all" && (
//                       <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
//                         الحلقة: {selectedGroup}
//                       </span>
//                     )}
//                     {(ageRange[0] !== 0 || ageRange[1] !== 100) && (
//                       <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
//                         العمر: {ageRange[0]}-{ageRange[1]}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         {isLoading ? (
//           /* Skeleton Loading for Cards */
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-4 mb-6">
//             {Array.from({ length: 6 }, (_, index) => (
//               <div
//                 key={index}
//                 className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-gray-300 animate-pulse">
//                 <div className="flex items-center gap-2">
//                   <div className="p-2 bg-gray-200 rounded-lg">
//                     <div className="w-5 h-5 bg-gray-300 rounded"></div>
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <div className="h-3 w-12 bg-gray-200 rounded mb-2"></div>
//                     <div className="h-5 w-8 bg-gray-300 rounded"></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-4 mb-6">
//             <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
//               <div className="flex items-center gap-2">
//                 <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md">
//                   <FaUserGraduate className="w-5 h-5 text-white" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs text-gray-600 font-medium truncate">
//                     إجمالي
//                   </p>
//                   <p className="text-lg font-bold text-gray-900">
//                     {stats.total}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
//               <div className="flex items-center gap-2">
//                 <div className="p-2 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg shadow-md">
//                   <svg
//                     className="w-5 h-5 text-white"
//                     fill="currentColor"
//                     viewBox="0 0 20 20">
//                     <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
//                   </svg>
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs text-gray-600 font-medium truncate">
//                     ذكور
//                   </p>
//                   <p className="text-lg font-bold text-gray-900">
//                     {stats.male}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-pink-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
//               <div className="flex items-center gap-2">
//                 <div className="p-2 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg shadow-md">
//                   <svg
//                     className="w-5 h-5 text-white"
//                     fill="currentColor"
//                     viewBox="0 0 20 20">
//                     <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
//                   </svg>
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs text-gray-600 font-medium truncate">
//                     إناث
//                   </p>
//                   <p className="text-lg font-bold text-gray-900">
//                     {stats.female}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-emerald-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
//               <div className="flex items-center gap-2">
//                 <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-md">
//                   <svg
//                     className="w-5 h-5 text-white"
//                     fill="currentColor"
//                     viewBox="0 0 20 20">
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs text-gray-600 font-medium truncate">
//                     نشطين
//                   </p>
//                   <p className="text-lg font-bold text-gray-900">
//                     {stats.active}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
//               <div className="flex items-center gap-2">
//                 <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-md">
//                   <svg
//                     className="w-5 h-5 text-white"
//                     fill="currentColor"
//                     viewBox="0 0 20 20">
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs text-gray-600 font-medium truncate">
//                     غير نشطين
//                   </p>
//                   <p className="text-lg font-bold text-gray-900">
//                     {stats.inactive}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
//               <div className="flex items-center gap-2">
//                 <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-md">
//                   <FaChartBar className="w-5 h-5 text-white" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs text-gray-600 font-medium truncate">
//                     متوسط العمر
//                   </p>
//                   <p className="text-lg font-bold text-gray-900">
//                     {stats.avgAge}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Active Filters Display */}
//         {(selectedGender !== "all" ||
//           selectedGroup !== "all" ||
//           ageRange[0] !== 0 ||
//           ageRange[1] !== 100 ||
//           searchTerm) && (
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
//             <div className="flex items-center justify-between">
//               <div className="flex flex-wrap gap-2">
//                 <span className="text-blue-700 font-medium">
//                   الفلاتر المطبقة:
//                 </span>

//                 {selectedGender !== "all" && (
//                   <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
//                     {selectedGender === "ذكر" ? "👦" : "👧"} {selectedGender}
//                     <button
//                       onClick={() => setSelectedGender("all")}
//                       title="إزالة فلتر الجنس"
//                       className="ml-1 hover:bg-purple-200 rounded-full p-0.5">
//                       <svg
//                         className="w-3 h-3"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                     </button>
//                   </span>
//                 )}
//                 {selectedGroup !== "all" && (
//                   <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-800 text-sm rounded-full">
//                     🏫 {selectedGroup}
//                     <button
//                       onClick={() => setSelectedGroup("all")}
//                       title="إزالة فلتر الحلقة"
//                       className="ml-1 hover:bg-violet-200 rounded-full p-0.5">
//                       <svg
//                         className="w-3 h-3"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                     </button>
//                   </span>
//                 )}
//                 {(ageRange[0] !== 0 || ageRange[1] !== 100) && (
//                   <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
//                     🎂 {ageRange[0]}-{ageRange[1]} سنة
//                     <button
//                       onClick={() => setAgeRange([0, 100])}
//                       title="إزالة فلتر العمر"
//                       aria-label="إزالة فلتر العمر"
//                       className="ml-1 hover:bg-amber-200 rounded-full p-0.5">
//                       <svg
//                         className="w-3 h-3"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                     </button>
//                   </span>
//                 )}
//                 {searchTerm && (
//                   <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
//                     🔍 "{searchTerm}"
//                     <button
//                       onClick={() => setSearchTerm("")}
//                       title="مسح البحث"
//                       aria-label="مسح البحث"
//                       className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
//                       <svg
//                         className="w-3 h-3"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                     </button>
//                   </span>
//                 )}
//               </div>
//               <span className="text-blue-600 text-sm font-medium">
//                 {filteredAndSortedStudents.length} من {students.length} طالب
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Bulk Actions */}
//         {selectedStudents.size > 0 && (
//           <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
//             <span className="text-blue-900 font-medium">
//               تم تحديد {selectedStudents.size} طالب
//             </span>
//             <button
//               onClick={handleBulkDelete}
//               className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
//               <FaTrash className="w-4 h-4" />
//               حذف المحدد
//             </button>
//           </div>
//         )}

//         {/* Error Display */}
//         {error && !isLoading && (
//           <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 animate-fadeIn">
//             <div className="flex items-start">
//               <svg
//                 className="w-6 h-6 text-red-600 ml-3 mt-0.5 flex-shrink-0"
//                 fill="currentColor"
//                 viewBox="0 0 20 20">
//                 <path
//                   fillRule="evenodd"
//                   d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               <div className="flex-1">
//                 <h3 className="font-semibold text-red-900 mb-2">
//                   مشكلة في تحميل البيانات
//                 </h3>
//                 <p className="text-red-700 mb-4">{error}</p>
//                 <button
//                   onClick={() => fetchStudents(retryCount)}
//                   className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium">
//                   <svg
//                     className="w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24">
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                     />
//                   </svg>
//                   المحاولة مرة أخرى
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Skeleton Loading for Table */}
//         {isLoading && (
//           <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//             <div className="overflow-x-auto" dir="rtl">
//               <table className="w-full" dir="rtl">
//                 {/* Table Header Skeleton */}
//                 <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-4 py-4 text-center">
//                       <div className="h-4 w-4 bg-gray-300 rounded mx-auto animate-pulse"></div>
//                     </th>
//                     <th className="px-4 py-4 text-right">
//                       <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
//                     </th>
//                     <th className="px-4 py-4 text-right">
//                       <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
//                     </th>
//                     <th className="px-4 py-4 text-right">
//                       <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
//                     </th>
//                     <th className="px-4 py-4 text-right">
//                       <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
//                     </th>
//                     <th className="px-4 py-4 text-right">
//                       <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
//                     </th>
//                     <th className="px-4 py-4 text-right">
//                       <div className="h-4 w-14 bg-gray-300 rounded animate-pulse"></div>
//                     </th>
//                     <th className="px-4 py-4 text-right">
//                       <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
//                     </th>
//                     <th className="px-4 py-4 text-right">
//                       <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
//                     </th>
//                     <th className="px-4 py-4 text-right">
//                       <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
//                     </th>
//                     <th className="px-4 py-4 text-center">
//                       <div className="h-4 w-16 bg-gray-300 rounded mx-auto animate-pulse"></div>
//                     </th>
//                   </tr>
//                 </thead>

//                 {/* Table Rows Skeleton */}
//                 <tbody>
//                   {Array.from({ length: 6 }, (_, index) => (
//                     <tr key={index} className="border-b border-gray-100">
//                       <td className="px-4 py-4 text-center">
//                         <div className="h-4 w-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="space-y-2">
//                           <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
//                           <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse"></div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse"></div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="flex space-x-2 rtl:space-x-reverse justify-center">
//                           <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
//                           <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination Skeleton */}
//             <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
//                 <div className="flex space-x-2 rtl:space-x-reverse">
//                   <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
//                   <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
//                   <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Students Table */}
//         {!isLoading && filteredAndSortedStudents.length > 0 && (
//           <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//             <div className="overflow-x-auto" dir="rtl">
//               <table className="w-full" dir="rtl">
//                 <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-4 py-4 text-center">
//                       <input
//                         type="checkbox"
//                         onChange={(e) => {
//                           if (e.target.checked) {
//                             setSelectedStudents(
//                               new Set(currentStudents.map((s) => s._id || ""))
//                             );
//                           } else {
//                             setSelectedStudents(new Set());
//                           }
//                         }}
//                         className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
//                       />
//                     </th>
//                     <th
//                       className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                       onClick={() => handleSort("studentId")}>
//                       <div className="flex items-center gap-2">
//                         رقم الطالب
//                         {sortField === "studentId" &&
//                           (sortOrder === "asc" ? (
//                             <FaSortAmountUp className="w-3 h-3" />
//                           ) : (
//                             <FaSortAmountDown className="w-3 h-3" />
//                           ))}
//                       </div>
//                     </th>
//                     <th
//                       className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                       onClick={() => handleSort("firstName")}>
//                       <div className="flex items-center gap-2">
//                         الاسم الكامل
//                         {sortField === "firstName" &&
//                           (sortOrder === "asc" ? (
//                             <FaSortAmountUp className="w-3 h-3" />
//                           ) : (
//                             <FaSortAmountDown className="w-3 h-3" />
//                           ))}
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
//                       رقم الهوية
//                     </th>
//                     <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
//                       الجنس
//                     </th>
//                     <th
//                       className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                       onClick={() => handleSort("age")}>
//                       <div className="flex items-center gap-2">
//                         العمر
//                         {sortField === "age" &&
//                           (sortOrder === "asc" ? (
//                             <FaSortAmountUp className="w-3 h-3" />
//                           ) : (
//                             <FaSortAmountDown className="w-3 h-3" />
//                           ))}
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
//                       المعلم
//                     </th>
//                     <th
//                       className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                       onClick={() => handleSort("group")}>
//                       <div className="flex items-center gap-2">
//                         الحلقة
//                         {sortField === "group" &&
//                           (sortOrder === "asc" ? (
//                             <FaSortAmountUp className="w-3 h-3" />
//                           ) : (
//                             <FaSortAmountDown className="w-3 h-3" />
//                           ))}
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
//                       الإجراءات
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {currentStudents.map((student) => (
//                     <tr
//                       key={student._id || student.id}
//                       className="hover:bg-blue-50 transition-colors">
//                       <td className="px-4 py-4 text-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedStudents.has(student._id || "")}
//                           onChange={(e) => {
//                             const newSet = new Set(selectedStudents);
//                             if (e.target.checked) {
//                               newSet.add(student._id || "");
//                             } else {
//                               newSet.delete(student._id || "");
//                             }
//                             setSelectedStudents(newSet);
//                           }}
//                           className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
//                         />
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                           {student.studentId}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div>
//                           <div className="text-sm font-semibold text-gray-900">
//                             {student.firstName} {student.lastName}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {student.fatherName} {student.grandFatherName}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
//                         {student.idNumber}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span
//                           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                             student.gender === "ذكر"
//                               ? "bg-cyan-100 text-cyan-800"
//                               : "bg-pink-100 text-pink-800"
//                           }`}>
//                           {student.gender}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {student.age ? (
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
//                             {student.age}
//                           </span>
//                         ) : (
//                           <span className="text-gray-400">-</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {student.teacher}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                           {student.group}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-center">
//                         <div className="flex items-center justify-center gap-2">
//                           <button
//                             onClick={() => handleEdit(student)}
//                             className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
//                             title="تعديل">
//                             <FaEdit className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() =>
//                               handleDelete(student._id || student.id!)
//                             }
//                             className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
//                             title="حذف">
//                             <FaTrash className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {!isLoading && filteredAndSortedStudents.length === 0 && (
//           <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
//             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
//               <FaUserGraduate className="w-10 h-10 text-gray-400" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">
//               لا يوجد طلاب
//             </h3>
//             <p className="text-gray-600 mb-6">
//               {searchTerm
//                 ? "لم يتم العثور على نتائج مطابقة للبحث"
//                 : "ابدأ بإضافة طالب جديد للنظام"}
//             </p>
//             {!searchTerm && (
//               <button
//                 onClick={() => setIsFormVisible(true)}
//                 className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg">
//                 <FaPlus className="w-4 h-4" />
//                 إضافة طالب جديد
//               </button>
//             )}
//           </div>
//         )}

//         {/* Enhanced Responsive Pagination */}
//         <ResponsivePagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           totalItems={filteredAndSortedStudents.length}
//           itemsPerPage={studentsPerPage}
//           onPageChange={setCurrentPage}
//           itemName="طالب"
//           showQuickJump={true}
//         />
//       </div>

//       {/* Student Form Modal */}
//       {isFormVisible && (
//         <AddStudentFormWithYup
//           onClose={() => {
//             setIsFormVisible(false);
//             setIsEditMode(false);
//             setSelectedStudent(null);
//           }}
//           onSuccess={handleAddSuccess}
//           student={
//             isEditMode && selectedStudent ? (selectedStudent as any) : undefined
//           }
//         />
//       )}

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default StudentsManagement;
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
  FaUserGraduate,
  FaChartBar,
  FaTh,
  FaList,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTimes,
  FaSync,
  FaEye,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import api from "../../Api/api";
import AddStudentFormWithYup from "../../components/Forms/AddStudentForm";
import ResponsivePagination from "../../components/Pagination/ResponsivePagination";
import Swal from "sweetalert2";

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
  gender: "ذكر" | "انثى";
  residence: string;
  teacher: string;
  group: string;
  phoneNumber?: string;
  email?: string;
}

type SortField = "studentId" | "firstName" | "age" | "group";
type SortOrder = "asc" | "desc";
type ViewMode = "table" | "grid";

const StudentsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { onStudentUpdate, offStudentUpdate } = useSocket();
  const userRole = currentUser?.role || "";
  const hasPermission = userRole === "teacher" || userRole === "admin";

  // Core States
  const [students, setStudents] = useState<Student[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  // Sorting States
  const [sortField, setSortField] = useState<SortField>("studentId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  // View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Selected Students for Bulk Actions
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );

  // Groups
  const [allGroups, setAllGroups] = useState<{ _id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    import("../../Api/groupApi").then(({ getAllGroups }) => {
      getAllGroups().then((result) => {
        if (result.success && result.data) {
          setAllGroups(
            result.data.map((g: any) => ({ _id: g._id, name: g.name }))
          );
        }
      });
    });
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const maleCount = students.filter((s) => s.gender === "ذكر").length;
    const femaleCount = students.filter((s) => s.gender === "انثى").length;
    const avgAge =
      students.length > 0
        ? (
            students.reduce((sum, s) => sum + (s.age || 0), 0) / students.length
          ).toFixed(1)
        : 0;

    return {
      total: students.length,
      male: maleCount,
      female: femaleCount,
      active: students.length,
      inactive: 0,
      avgAge,
    };
  }, [students]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGender !== "all") count++;
    if (selectedGroup !== "all") count++;
    if (ageRange[0] !== 0 || ageRange[1] !== 100) count++;
    if (searchTerm) count++;
    return count;
  }, [selectedGender, selectedGroup, ageRange, searchTerm]);

  // Fetch students
  const fetchStudents = useCallback(async (retryAttempt = 0) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setRetryCount(retryAttempt);

    try {
      const startTime = performance.now();
      const studentsResponse = await api.get("/students", {
        timeout: 8000,
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      });

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      if (studentsResponse?.data && Array.isArray(studentsResponse.data)) {
        const cleanedStudents = studentsResponse.data.map((student) => ({
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

        console.log(
          `✅ تم تحميل ${cleanedStudents.length} طالب بنجاح في ${duration}ms`
        );
        setStudents(cleanedStudents);
        setError(null);
        setRetryCount(0);
      } else {
        throw new Error("البيانات المستلمة غير صحيحة");
      }
    } catch (error: unknown) {
      console.error("❌ خطأ في تحميل الطلاب:", error);
      let errorMessage = "حدث خطأ في تحميل البيانات";

      if (error instanceof Error) {
        if (error.name === "AbortError" || error.message === "canceled") {
          return;
        } else {
          errorMessage = error.message || "خطأ غير محدد";
        }
      }

      setError(errorMessage);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    fetchStudents();
  }, [hasPermission, fetchStudents]);

  // Socket handlers
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  useEffect(() => {
    if (!hasPermission) return;

    const handleStudentUpdate = (event: {
      type: "created" | "updated" | "deleted";
      student: Student;
      studentId?: string;
    }) => {
      const now = Date.now();
      if (now - lastUpdateTime < 300) return;
      setLastUpdateTime(now);

      switch (event.type) {
        case "created":
          setStudents((prevStudents) => {
            const existingStudent = prevStudents.find(
              (s) => s._id === event.student._id
            );
            if (existingStudent) return prevStudents;
            return [...prevStudents, event.student];
          });
          break;

        case "updated":
          setStudents((prevStudents) =>
            prevStudents.map((s) =>
              s._id === event.student._id ? event.student : s
            )
          );
          break;

        case "deleted":
          setStudents((prevStudents) =>
            prevStudents.filter((s) => s._id !== event.studentId)
          );
          break;
      }
    };

    onStudentUpdate(handleStudentUpdate);
    return () => offStudentUpdate(handleStudentUpdate);
  }, [hasPermission, onStudentUpdate, offStudentUpdate, lastUpdateTime]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      if (selectedGroup !== "all") {
        const normalizeGroupName = (name: string) =>
          (name || "").trim().replace(/\s+/g, " ").toLowerCase();
        if (
          normalizeGroupName(student.group) !==
          normalizeGroupName(selectedGroup)
        ) {
          return false;
        }
      }

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (student.firstName || "").toLowerCase().includes(searchLower) ||
        (student.lastName || "").toLowerCase().includes(searchLower) ||
        (student.fatherName || "").toLowerCase().includes(searchLower) ||
        (student.idNumber || "").includes(searchLower) ||
        student.studentId.toString().includes(searchLower) ||
        (student.teacher || "").toLowerCase().includes(searchLower) ||
        (student.group || "").toLowerCase().includes(searchLower);

      const matchesGender =
        selectedGender === "all" || student.gender === selectedGender;
      const matchesAge =
        student.age >= ageRange[0] && student.age <= ageRange[1];

      return matchesSearch && matchesGender && matchesAge;
    });

    filtered.sort((a, b) => {
      let compareResult = 0;

      if (sortField === "studentId") {
        compareResult = a.studentId - b.studentId;
      } else if (sortField === "firstName") {
        compareResult = a.firstName.localeCompare(b.firstName, "ar");
      } else if (sortField === "age") {
        compareResult = a.age - b.age;
      } else if (sortField === "group") {
        compareResult = a.group.localeCompare(b.group, "ar");
      }

      return sortOrder === "asc" ? compareResult : -compareResult;
    });

    return filtered;
  }, [
    students,
    searchTerm,
    selectedGender,
    selectedGroup,
    ageRange,
    sortField,
    sortOrder,
  ]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGender, selectedGroup, ageRange, sortField, sortOrder]);

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
    const student = students.find(
      (s) => s._id === studentId || s.id === studentId
    );
    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : "الطالب";

    const result = await Swal.fire({
      title: "تأكيد حذف الطالب 🛡️",
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
          <p class="font-bold text-lg text-red-600">${studentName}</p>
          <p class="text-sm text-gray-500 mt-2">هذه العملية لا يمكن التراجع عنها</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "🗑️ نعم، احذف",
      cancelButtonText: "❌ إلغاء",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: "rtl-popup swal2-rtl-popup",
        title: "rtl-title",
        htmlContainer: "rtl-content",
        confirmButton: "swal2-confirm-delete",
        cancelButton: "swal2-cancel-delete",
      },
    });

    if (result.isConfirmed) {
      try {
        if (typeof studentId === "string" && studentId.length > 10) {
          await api.delete(`/students/${studentId}`);
          await Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف الطالب بنجاح",
            icon: "success",
            confirmButtonText: "موافق",
            customClass: { popup: "rtl-popup", title: "rtl-title" },
          });
        }
      } catch (deleteError) {
        console.error("❌ فشل في حذف الطالب:", deleteError);
        await Swal.fire({
          title: "خطأ!",
          text: "حدث خطأ أثناء حذف الطالب",
          icon: "error",
          confirmButtonText: "موافق",
          customClass: { popup: "rtl-popup", title: "rtl-title" },
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
  const handleAddSuccess = async (studentData?: any) => {
    try {
      // إغلاق النموذج أولاً
      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedStudent(null);

      // إعادة تحميل البيانات لضمان الحصول على أحدث البيانات
      await fetchStudents();

      // إعادة تعيين البحث والفلاتر لإظهار الطالب الجديد
      setSearchTerm("");
      setSelectedGender("all");
      setSelectedGroup("all");
      setAgeRange([0, 100]);
      setCurrentPage(1);

      // عرض رسالة النجاح
      await Swal.fire({
        title: isEditMode ? "✨ تم التحديث بنجاح" : "🎉 مرحباً بالطالب الجديد",
        html: `
          <div class="text-center py-4 success-animation">
            <div class="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">${isEditMode ? 'تم تحديث بيانات الطالب' : 'تم إضافة الطالب'}</h3>
            <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold text-lg shadow-md">
              <span class="mr-2">✨</span>
              <span>${studentData?.firstName || 'الطالب'} ${studentData?.lastName || ''}</span>
              <span class="mr-2">✨</span>
            </div>
            <p class="text-gray-600 mt-4 font-medium">تم تحديث قائمة الطلاب بنجاح</p>
          </div>
        `,
        icon: "success",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: {
          popup: "swal2-success-modal rtl-popup",
          title: "rtl-title",
          htmlContainer: "rtl-content",
        },
        didOpen: () => {
          const popup = Swal.getPopup();
          if (popup) {
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.zIndex = '10000';
          }
        },
      });
    } catch (error: unknown) {
      console.error("❌ خطأ في معالجة نجاح إضافة الطالب:", error);
      
      const errorMessage = "حدث خطأ أثناء إعادة تحميل البيانات";
      const errorTitle = "تحذير ⚠️";
      
      await Swal.fire({
        title: errorTitle,
        html: `
          <div class="text-center py-4">
            <div class="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <svg class="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <p class="text-lg font-semibold text-gray-800 mb-2">تم حفظ البيانات بنجاح</p>
            <p class="text-sm text-orange-600">${errorMessage}</p>
            <p class="text-xs text-gray-500 mt-2">يرجى تحديث الصفحة يدوياً</p>
          </div>
        `,
        icon: "warning",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: "حسناً",
        customClass: {
          popup: "rtl-popup",
          title: "rtl-title",
          confirmButton: "rtl-button",
        },
      });
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "رقم الطالب",
      "الاسم الأول",
      "اسم الأب",
      "اسم العائلة",
      "رقم الهوية",
      "العمر",
      "الجنس",
      "المعلم",
      "الحلقة",
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
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedGender("all");
    setSelectedGroup("all");
    setAgeRange([0, 100]);
    setCurrentPage(1);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) return;

    const result = await Swal.fire({
      title: `حذف ${selectedStudents.size} طالب`,
      text: "هل أنت متأكد من حذف الطلاب المحددين؟",
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
          Array.from(selectedStudents).map((id) =>
            api.delete(`/students/${id}`)
          )
        );

        setStudents((prev) =>
          prev.filter((s) => !selectedStudents.has(s._id || ""))
        );
        setSelectedStudents(new Set());

        await Swal.fire({
          title: "تم حذف الطلاب!",
          text: `تم حذف ${selectedStudents.size} طالب بنجاح`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (bulkDeleteError) {
        console.error("❌ فشل في حذف الطلاب:", bulkDeleteError);
        await Swal.fire({
          title: "فشل في الحذف!",
          text: "حدث خطأ أثناء حذف الطلاب",
          icon: "error",
        });
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 relative"
      dir="rtl">
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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FaUserGraduate className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
                <p className="text-gray-600 text-sm mt-1">
                  نظام متكامل لإدارة بيانات الطلاب
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExport}
                disabled={filteredAndSortedStudents.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                <FaDownload className="w-4 h-4" />
                <span className="hidden sm:inline">تصدير</span>
              </button>

              <button
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedStudent(null);
                  setIsFormVisible(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
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
                    onClick={() => setSearchTerm("")}
                    className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
                    <span className="text-xs font-medium hidden sm:inline">جدول</span>
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
                    <span className="text-xs font-medium hidden sm:inline">شبكة</span>
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
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border-2 border-gray-100 shadow-lg animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Gender Filter */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      الجنس
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["all", "ذكر", "انثى"].map((gender) => (
                        <button
                          key={gender}
                          onClick={() => setSelectedGender(gender)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            selectedGender === gender
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}>
                          {gender === "all" ? "الكل" : gender}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group Filter */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      الحلقة
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all">
                      <option value="all">جميع الحلقات</option>
                      {allGroups.map((group) => (
                        <option key={group._id} value={group.name}>
                          {group.name}
                        </option>
                      ))}
                    </select>
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
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
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
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-gray-300 animate-pulse">
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
              { label: "إجمالي", value: stats.total, icon: FaUserGraduate, color: "blue" },
              { label: "ذكور", value: stats.male, icon: FaUserGraduate, color: "cyan" },
              { label: "إناث", value: stats.female, icon: FaUserGraduate, color: "pink" },
              { label: "نشطين", value: stats.active, icon: FaUserGraduate, color: "emerald" },
              { label: "غير نشطين", value: stats.inactive, icon: FaUserGraduate, color: "red" },
              { label: "متوسط العمر", value: stats.avgAge, icon: FaChartBar, color: "amber" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`bg-white p-4 rounded-xl shadow-lg border-l-4 border-${stat.color}-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600 rounded-lg shadow-md`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium truncate">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-blue-700 font-medium">الفلاتر المطبقة:</span>
                {selectedGender !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {selectedGender}
                    <button
                      onClick={() => setSelectedGender("all")}
                      className="hover:bg-purple-200 rounded-full p-0.5">
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedGroup !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-800 text-sm rounded-full">
                    {selectedGroup}
                    <button
                      onClick={() => setSelectedGroup("all")}
                      className="hover:bg-violet-200 rounded-full p-0.5">
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(ageRange[0] !== 0 || ageRange[1] !== 100) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                    {ageRange[0]}-{ageRange[1]} سنة
                    <button
                      onClick={() => setAgeRange([0, 100])}
                      className="hover:bg-amber-200 rounded-full p-0.5">
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="hover:bg-gray-200 rounded-full p-0.5">
                      <FaTimes className="w-3 h-3" />
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
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
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
                viewBox="0 0 20 20">
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium">
                  <FaSync className="w-4 h-4" />
                  المحاولة مرة أخرى
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && !isLoading && currentStudents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
            {currentStudents.map((student) => (
              <div
                key={student._id || student.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
                {/* Card Header with Gradient */}
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6 text-center">
                  {/* Student Avatar */}
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/30">
                      <FaUserGraduate className="w-12 h-12 text-blue-600" />
                    </div>
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
                        student.gender === "ذكر"
                          ? "bg-cyan-100 text-cyan-800"
                          : "bg-pink-100 text-pink-800"
                      }`}>
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
                        viewBox="0 0 20 20">
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
                        <p className="text-xs text-gray-500">البريد الإلكتروني</p>
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
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">المعلم</p>
                      <p className="text-sm font-bold text-indigo-700 truncate">
                        {student.teacher}
                      </p>
                    </div>
                    <div className="p-3 bg-violet-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">الحلقة</p>
                      <p className="text-sm font-bold text-violet-700 truncate">
                        {student.group}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="px-6 pb-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                      <FaEdit className="w-4 h-4" />
                      <span className="font-medium">تعديل</span>
                    </button>
                    <button
                      onClick={() => handleDelete(student._id || student.id!)}
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
                        checked={selectedStudents.has(student._id || "")}
                        onChange={(e) => {
                          const newSet = new Set(selectedStudents);
                          if (e.target.checked) {
                            newSet.add(student._id || "");
                          } else {
                            newSet.delete(student._id || "");
                          }
                          setSelectedStudents(newSet);
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

        {/* Table View - Keeping existing table code */}
        {viewMode === "table" && !isLoading && currentStudents.length > 0 && (
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
                              new Set(currentStudents.map((s) => s._id || ""))
                            );
                          } else {
                            setSelectedStudents(new Set());
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("studentId")}>
                      <div className="flex items-center gap-2">
                        رقم الطالب
                        {sortField === "studentId" &&
                          (sortOrder === "asc" ? (
                            <FaSortAmountUp className="w-3 h-3" />
                          ) : (
                            <FaSortAmountDown className="w-3 h-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("firstName")}>
                      <div className="flex items-center gap-2">
                        الاسم الكامل
                        {sortField === "firstName" &&
                          (sortOrder === "asc" ? (
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
                      onClick={() => handleSort("age")}>
                      <div className="flex items-center gap-2">
                        العمر
                        {sortField === "age" &&
                          (sortOrder === "asc" ? (
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
                      onClick={() => handleSort("group")}>
                      <div className="flex items-center gap-2">
                        الحلقة
                        {sortField === "group" &&
                          (sortOrder === "asc" ? (
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
                      key={student._id || student.id}
                      className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student._id || "")}
                          onChange={(e) => {
                            const newSet = new Set(selectedStudents);
                            if (e.target.checked) {
                              newSet.add(student._id || "");
                            } else {
                              newSet.delete(student._id || "");
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
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.gender === "ذكر"
                              ? "bg-cyan-100 text-cyan-800"
                              : "bg-pink-100 text-pink-800"
                          }`}>
                          {student.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {student.age}
                        </span>
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
                            title="تعديل">
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id || student.id!)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="حذف">
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
                    className="bg-gray-100 rounded-xl p-6 animate-pulse">
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
                ? "لا توجد نتائج"
                : "لا يوجد طلاب"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {activeFiltersCount > 0 || searchTerm
                ? "لم يتم العثور على طلاب يطابقون معايير البحث والفلترة الحالية. جرب تعديل الفلاتر أو البحث عن كلمات مختلفة."
                : "ابدأ رحلتك بإضافة أول طالب إلى النظام. انقر على الزر أدناه للبدء."}
            </p>
            {(!searchTerm && activeFiltersCount === 0) ? (
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedStudent(null);
                  setIsFormVisible(true);
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                <FaPlus className="w-5 h-5" />
                <span className="font-semibold">إضافة طالب جديد</span>
              </button>
            ) : (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                <FaSync className="w-5 h-5" />
                <span className="font-semibold">إعادة تعيين الفلاتر</span>
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && currentStudents.length > 0 && (
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
          student={
            isEditMode && selectedStudent ? (selectedStudent as any) : undefined
          }
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