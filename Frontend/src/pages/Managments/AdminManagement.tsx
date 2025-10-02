// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import EnhancedStudentForm from "../../components/Forms/AddStudentForm";
// import AddTeacherForm from "../../components/Forms/AddTeacherForm";
// import { getAllTeachers, deleteTeacher, type Teacher } from "../../Api/teacherApi";
// import { getAllStudents, deleteStudent, type Student } from "../../Api/studentApi";

// const AdminManagement: React.FC = () => {
//   const [activeSection, setActiveSection] = useState<
//     "teachers" | "students" | "sections"
//   >("teachers");

//   const [showAddStudentForm, setShowAddStudentForm] = useState(false);
//   const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);

//   // Editing states
//   const [editingStudent, setEditingStudent] = useState<Student | null>(null);
//   const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

//   // Search states
//   const [teacherSearch, setTeacherSearch] = useState("");
//   const [studentSearch, setStudentSearch] = useState("");
//   const [studentGroupFilter, setStudentGroupFilter] = useState(""); // ✅ فلتر الحلقة

//   // Loading and error states
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // Navigation
//   const navigate = useNavigate();

//   // Data states
//   const [teachers, setTeachers] = useState<Teacher[]>([]);

//   // Load teachers data on component mount
//   useEffect(() => {
//     const loadTeachers = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const result = await getAllTeachers();
//         if (result.success && result.data) {
//           setTeachers(result.data);
//         } else {
//           setError(result.message || 'حدث خطأ في جلب المعلمين');
//         }
//       } catch (err) {
//         setError('حدث خطأ غير متوقع');
//         console.error('Error loading teachers:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadTeachers();
//   }, []);

//   const [students, setStudents] = useState<Student[]>([]);

//   // Load students data on component mount
//   useEffect(() => {
//     const loadStudents = async () => {
//       if (activeSection === 'students') {
//         try {
//           const result = await getAllStudents();
//           if (result.success && result.data) {
//             setStudents(result.data);
//           } else {
//             console.error('Error loading students:', result.message);
//           }
//         } catch (err) {
//           console.error('Error loading students:', err);
//         }
//       }
//     };

//     loadStudents();
//   }, [activeSection]);

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const handleAddSuccess = async (data?: any) => {
//     console.log('تمت العملية بنجاح ✅', data);
//     // إعادة تحميل القوائم حسب القسم النشط
//     if (activeSection === 'teachers') {
//       const result = await getAllTeachers();
//       if (result.success && result.data) {
//         setTeachers(result.data);
//       }
//     } else if (activeSection === 'students') {
//       const result = await getAllStudents();
//       if (result.success && result.data) {
//         setStudents(result.data);
//       }
//     }
//   };

//   // Edit handlers
//   const handleEditTeacher = (teacher: Teacher) => {
//     setEditingTeacher(teacher);
//     setShowAddTeacherForm(true);
//   };

//   const handleEditStudent = (student: Student) => {
//     setEditingStudent(student);
//     setShowAddStudentForm(true);
//   };

//   // Delete handlers
//   const handleDeleteTeacher = async (teacherId: string) => {
//     if (window.confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
//       try {
//         const result = await deleteTeacher(teacherId);
//         if (result.success) {
//           setTeachers(teachers.filter((t) => t._id !== teacherId));
//           console.log('تم حذف المعلم بنجاح');
//         } else {
//           alert(result.message || 'حدث خطأ أثناء حذف المعلم');
//         }
//       } catch (error) {
//         console.error('Error deleting teacher:', error);
//         alert('حدث خطأ غير متوقع');
//       }
//     }
//   };

//   const handleDeleteStudent = async (studentId: string) => {
//     if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
//       try {
//         const result = await deleteStudent(studentId);
//         if (result.success) {
//           setStudents(students.filter((s) => s._id !== studentId));
//           console.log('تم حذف الطالب بنجاح');
//         } else {
//           alert(result.message || 'حدث خطأ أثناء حذف الطالب');
//         }
//       } catch (error) {
//         console.error('Error deleting student:', error);
//         alert('حدث خطأ غير متوقع');
//       }
//     }
//   };

//   // Filters
//   const filteredTeachers = teachers.filter((t) =>
//     `${t.firstName} ${t.lastName}`
//       .toLowerCase()
//       .includes(teacherSearch.toLowerCase())
//   );

//   const filteredStudents = students.filter((s) => {
//     const matchesName = `${s.firstName} ${s.lastName}`
//       .toLowerCase()
//       .includes(studentSearch.toLowerCase());
//     const matchesGroup =
//       studentGroupFilter === "" || s.group === studentGroupFilter;
//     return matchesName && matchesGroup;
//   });

//   return (
//     <div className="admin-management">
//       <div className="bg-[#F5F8FA] min-h-screen">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-2xl font-bold text-[#009C5C] mb-6 text-center">
//               إدارة النظام
//             </h2>

//             {/* Tabs */}
//             <div className="border-b border-gray-200 mb-6">
//               <nav className="flex space-x-8 justify-center">
//                 <TabButton
//                   active={activeSection === "teachers"}
//                   onClick={() => setActiveSection("teachers")}
//                   label="إدارة المعلمين"
//                 />
//                 <TabButton
//                   active={activeSection === "students"}
//                   onClick={() => setActiveSection("students")}
//                   label="إدارة الطلاب"
//                 />
//                 <TabButton
//                   active={false}
//                   onClick={() => navigate("/admin/groups")}
//                   label="إدارة الحلقات"
//                 />
//               </nav>
//             </div>

//             {/* المعلمين */}
//             {activeSection === "teachers" && (
//               <Section
//                 title="قائمة المعلمين"
//                 buttonLabel="إضافة معلم جديد"
//                 onAdd={() => setShowAddTeacherForm(true)}
//                 searchValue={teacherSearch}
//                 onSearchChange={setTeacherSearch}>
//                 <Table
//                   headers={[
//                     "الاسم",
//                     "رقم الهوية",
//                     "الجنس",
//                     "مكان السكن",
//                     "رقم الهاتف",
//                     "البريد الإلكتروني",
//                     "الإجراءات",
//                   ]}
//                   rows={filteredTeachers.map((t) => [
//                     `${t.firstName} ${t.lastName}`,
//                     t.idNumber,
//                     t.gender,
//                     t.residence,
//                     t.phoneNumber,
//                     t.email || "-",
//                     <Actions
//                       onEdit={() => handleEditTeacher(t)}
//                       onDelete={() => handleDeleteTeacher(t._id)}
//                     />,
//                   ])}
//                 />
//               </Section>
//             )}

//             {/* الطلاب */}
//             {activeSection === "students" && (
//               <Section
//                 title="قائمة الطلاب"
//                 buttonLabel="إضافة طالب جديد"
//                 onAdd={() => setShowAddStudentForm(true)}
//                 searchValue={studentSearch}
//                 onSearchChange={setStudentSearch}>
//                 {/* ✅ فلتر الحلقة */}
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     فلترة حسب الحلقة:
//                   </label>
//                   <select
//                     title="فلترة حسب الحلقة"
//                     value={studentGroupFilter}
//                     onChange={(e) => setStudentGroupFilter(e.target.value)}
//                     className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009C5C] focus:border-transparent">
//                     <option value="">كل الحلقات</option>
//                     {Array.from(new Set(students.map(s => s.group).filter(Boolean))).map((groupName) => (
//                       <option key={groupName} value={groupName}>
//                         {groupName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <Table
//                   headers={[
//                     "رقم الطالب",
//                     "الاسم",
//                     "رقم الهوية",
//                     "الجنس",
//                     "المعلم",
//                     "الحلقة",
//                     "رقم الهاتف",
//                     "الإجراءات",
//                   ]}
//                   rows={filteredStudents.map((s) => [
//                     s.studentId,
//                     `${s.firstName} ${s.lastName}`,
//                     s.idNumber,
//                     s.gender,
//                     s.teacher,
//                     s.group,
//                     s.phoneNumber,
//                     <Actions
//                       onEdit={() => handleEditStudent(s)}
//                       onDelete={() => handleDeleteStudent(s._id)}
//                     />,
//                   ])}
//                 />
//               </Section>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Forms */}
//       {showAddTeacherForm && (
//         <AddTeacherForm
//           onClose={() => {
//             setShowAddTeacherForm(false);
//             setEditingTeacher(null);
//           }}
//           onSuccess={handleAddSuccess}
//           teacher={editingTeacher || undefined}
//         />
//       )}

//       {showAddStudentForm && (
//         <EnhancedStudentForm
//           onClose={() => {
//             setShowAddStudentForm(false);
//             setEditingStudent(null);
//           }}
//           onSuccess={handleAddSuccess}
//           student={editingStudent}
//         />
//       )}

//     </div>
//   );
// };

// /* 🔹 مكونات فرعية */

// const TabButton = ({
//   active,
//   onClick,
//   label,
// }: {
//   active: boolean;
//   onClick: () => void;
//   label: string;
// }) => (
//   <button
//     onClick={onClick}
//     className={`py-2 px-4 border-b-2 font-medium text-sm ${
//       active
//         ? "border-[#009C5C] text-[#009C5C]"
//         : "border-transparent text-gray-500 hover:text-[#009C5C] hover:border-[#00B26F]"
//     }`}>
//     {label}
//   </button>
// );

// const Section = ({
//   title,
//   buttonLabel,
//   onAdd,
//   searchValue,
//   onSearchChange,
//   children,
// }: any) => (
//   <div>
//     <div className="flex justify-between items-center mb-6">
//       <h3 className="text-lg font-semibold text-[#009C5C]">{title}</h3>
//       <button
//         className="bg-[#009C5C] text-white px-4 py-2 rounded-lg hover:bg-[#00B26F] transition-colors"
//         onClick={onAdd}>
//         {buttonLabel}
//       </button>
//     </div>
//     <div className="mb-4">
//       <input
//         type="text"
//         placeholder="ابحث هنا..."
//         value={searchValue}
//         onChange={(e) => onSearchChange(e.target.value)}
//         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009C5C] focus:border-transparent"
//       />
//     </div>
//     {children}
//   </div>
// );

// const Table = ({ headers, rows }: any) => (
//   <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
//     <table className="min-w-full text-right">
//       <thead className="bg-[#E6F4EF]">
//         <tr>
//           {headers.map((h: string, i: number) => (
//             <th
//               key={i}
//               className="px-6 py-3 text-xs font-semibold text-[#009C5C] uppercase tracking-wider border-b border-gray-200">
//               {h}
//             </th>
//           ))}
//         </tr>
//       </thead>
//       <tbody>
//         {rows.map((row: any[], i: number) => (
//           <tr
//             key={i}
//             className={`transition-colors ${
//               i % 2 === 0 ? "bg-white" : "bg-[#F9FBFA]"
//             } hover:bg-[#F3F9F6]`}>
//             {row.map((cell: any, j: number) => (
//               <td
//                 key={j}
//                 className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-b border-gray-100">
//                 {cell}
//               </td>
//             ))}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

// const Actions = ({ onEdit, onDelete }: any) => (
//   <div>
//     <button
//       onClick={onEdit}
//       className="text-[#009C5C] hover:text-[#00B26F] mr-3">
//       تعديل
//     </button>
//     <button onClick={onDelete} className="text-red-600 hover:text-red-900">
//       حذف
//     </button>
//   </div>
// );

// export default AdminManagement;
