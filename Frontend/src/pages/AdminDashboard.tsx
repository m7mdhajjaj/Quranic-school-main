// import React, { useState, useEffect } from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
// } from "chart.js";
// import { Bar, Pie } from "react-chartjs-2";

// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// const AdminDashboard: React.FC = () => {
//   const [stats, setStats] = useState({
//     totalStudents: 0,
//     totalTeachers: 0,
//     totalExams: 0,
//     totalGroups: 0,
//     averageMarks: 0,
//     activeStudents: 0,
//     attendanceRate: 0,
//     upcomingExams: 0,
//     totalActivities: 0,
//   });

//   // Additional chart data
//   const [groupDistribution, setGroupDistribution] = useState({
//     labels: [
//       "حلقة الأطفال",
//       "حلقة المبتدئين",
//       "حلقة المتوسطين",
//       "حلقة المتقدمين",
//     ],
//     data: [25, 30, 20, 15],
//   });

//   const [marksByGroup, setMarksByGroup] = useState({
//     labels: [
//       "حلقة الأطفال",
//       "حلقة المبتدئين",
//       "حلقة المتوسطين",
//       "حلقة المتقدمين",
//     ],
//     data: [85, 78, 82, 88],
//   });

//   const [genderDistribution, setGenderDistribution] = useState({
//     male: 65,
//     female: 35,
//   });

//   // Load statistics on component mount
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         // Fetch students count
//         const studentsResponse = await fetch("/api/students", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const studentsData = await studentsResponse.json();
//         const studentsCount = Array.isArray(studentsData)
//           ? studentsData.length
//           : 0;

//         // Fetch teachers count
//         const teachersResponse = await fetch("/api/teachers", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const teachersData = await teachersResponse.json();
//         const teachersCount =
//           teachersData.success && Array.isArray(teachersData.data)
//             ? teachersData.data.length
//             : 0;

//         // Fetch exams count
//         const examsResponse = await fetch("/api/exams", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const examsData = await examsResponse.json();
//         const examsCount = Array.isArray(examsData) ? examsData.length : 0;

//         // Fetch groups count
//         const groupsResponse = await fetch("/api/groups", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const groupsData = await groupsResponse.json();
//         const groupsCount =
//           groupsData.success && Array.isArray(groupsData.data)
//             ? groupsData.data.length
//             : 0;

//         // Calculate average marks (placeholder - would need marks API)
//         const averageMarks = 85; // Placeholder value

//         setStats({
//           totalStudents: studentsCount,
//           totalTeachers: teachersCount,
//           totalExams: examsCount,
//           totalGroups: groupsCount,
//           averageMarks: averageMarks,
//           activeStudents: 42, // Dummy data
//           attendanceRate: 87, // Dummy data
//           upcomingExams: 5, // Dummy data
//           totalActivities: 23, // Dummy data
//         });
//       } catch (error) {
//         console.error("Error fetching statistics:", error);
//       }
//     };

//     fetchStats();
//   }, []);
//   return (
//     <div className="admin-dashboard">
//       <div className="bg-gray-50 min-h-screen">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">
//               لوحة الإحصائيات
//             </h2>

//             {/* Statistics Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
//               <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-blue-500 rounded-lg">
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
//                       />
//                     </svg>
//                   </div>
//                   <div className="mr-4">
//                     <p className="text-sm font-medium text-gray-600">
//                       إجمالي الطلاب
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {stats.totalStudents}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-green-50 p-6 rounded-lg border border-green-200">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-green-500 rounded-lg">
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//                       />
//                     </svg>
//                   </div>
//                   <div className="mr-4">
//                     <p className="text-sm font-medium text-gray-600">
//                       إجمالي المعلمين
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {stats.totalTeachers}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-yellow-500 rounded-lg">
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                       />
//                     </svg>
//                   </div>
//                   <div className="mr-4">
//                     <p className="text-sm font-medium text-gray-600">
//                       إجمالي الاختبارات
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {stats.totalExams}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-red-50 p-6 rounded-lg border border-red-200">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-red-500 rounded-lg">
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
//                       />
//                     </svg>
//                   </div>
//                   <div className="mr-4">
//                     <p className="text-sm font-medium text-gray-600">
//                       إجمالي الحلقات
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {stats.totalGroups}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-purple-500 rounded-lg">
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </div>
//                   <div className="mr-4">
//                     <p className="text-sm font-medium text-gray-600">
//                       الطلاب النشطين اليوم
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {stats.activeStudents}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-indigo-500 rounded-lg">
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                       />
//                     </svg>
//                   </div>
//                   <div className="mr-4">
//                     <p className="text-sm font-medium text-gray-600">
//                       معدل الحضور
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {stats.attendanceRate}%
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-orange-500 rounded-lg">
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                       />
//                     </svg>
//                   </div>
//                   <div className="mr-4">
//                     <p className="text-sm font-medium text-gray-600">
//                       الامتحانات القادمة
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {stats.upcomingExams}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-teal-500 rounded-lg">
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
//                       />
//                     </svg>
//                   </div>

//                 </div>
//               </div>

//               <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-pink-500 rounded-lg">
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v3M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4h10M9 9h6m-6 4h6m2 5H7m6 0h4"
//                       />
//                     </svg>
//                   </div>
//                   <div className="mr-4">
//                     <p className="text-sm font-medium text-gray-600">
//                       إجمالي الأنشطة
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {stats.totalActivities}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Charts Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="bg-white p-6 rounded-lg border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   إحصائيات المستخدمين
//                 </h3>
//                 <div className="h-64">
//                   <Bar
//                     data={{
//                       labels: ["الطلاب", "المعلمين", "الحلقات"],
//                       datasets: [
//                         {
//                           label: "العدد",
//                           data: [
//                             stats.totalStudents,
//                             stats.totalTeachers,
//                             stats.totalGroups,
//                           ],
//                           backgroundColor: [
//                             "rgba(59, 130, 246, 0.8)", // blue
//                             "rgba(34, 197, 94, 0.8)", // green
//                             "rgba(239, 68, 68, 0.8)", // red
//                           ],
//                           borderColor: [
//                             "rgb(59, 130, 246)",
//                             "rgb(34, 197, 94)",
//                             "rgb(239, 68, 68)",
//                           ],
//                           borderWidth: 1,
//                         },
//                       ],
//                     }}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           position: "top" as const,
//                         },
//                         title: {
//                           display: true,
//                           text: "إحصائيات النظام",
//                         },
//                       },
//                       scales: {
//                         y: {
//                           beginAtZero: true,
//                           ticks: {
//                             stepSize: 1,
//                           },
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="bg-white p-6 rounded-lg border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   توزيع الطلاب حسب الحلقات
//                 </h3>
//                 <div className="h-64">
//                   <Pie
//                     data={{
//                       labels: groupDistribution.labels,
//                       datasets: [
//                         {
//                           data: groupDistribution.data,
//                           backgroundColor: [
//                             "rgba(59, 130, 246, 0.8)", // blue
//                             "rgba(34, 197, 94, 0.8)", // green
//                             "rgba(239, 68, 68, 0.8)", // red
//                             "rgba(168, 85, 247, 0.8)", // purple
//                           ],
//                           borderColor: [
//                             "rgb(59, 130, 246)",
//                             "rgb(34, 197, 94)",
//                             "rgb(239, 68, 68)",
//                             "rgb(168, 85, 247)",
//                           ],
//                           borderWidth: 1,
//                         },
//                       ],
//                     }}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           position: "bottom" as const,
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="bg-white p-6 rounded-lg border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   متوسط العلامات لكل حلقة
//                 </h3>
//                 <div className="h-64">
//                   <Bar
//                     data={{
//                       labels: marksByGroup.labels,
//                       datasets: [
//                         {
//                           label: "متوسط العلامات",
//                           data: marksByGroup.data,
//                           backgroundColor: "rgba(34, 197, 94, 0.8)",
//                           borderColor: "rgb(34, 197, 94)",
//                           borderWidth: 1,
//                         },
//                       ],
//                     }}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           position: "top" as const,
//                         },
//                       },
//                       scales: {
//                         y: {
//                           beginAtZero: true,
//                           max: 100,
//                           ticks: {
//                             stepSize: 10,
//                           },
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Additional Charts Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
//               <div className="bg-white p-6 rounded-lg border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   توزيع الطلاب حسب الجنس
//                 </h3>
//                 <div className="h-64">
//                   <Pie
//                     data={{
//                       labels: ["ذكور", "إناث"],
//                       datasets: [
//                         {
//                           data: [
//                             genderDistribution.male,
//                             genderDistribution.female,
//                           ],
//                           backgroundColor: [
//                             "rgba(59, 130, 246, 0.8)", // blue for male
//                             "rgba(236, 72, 153, 0.8)", // pink for female
//                           ],
//                           borderColor: [
//                             "rgb(59, 130, 246)",
//                             "rgb(236, 72, 153)",
//                           ],
//                           borderWidth: 1,
//                         },
//                       ],
//                     }}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           position: "bottom" as const,
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="bg-white p-6 rounded-lg border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   إحصائيات الحضور والأداء
//                 </h3>
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">
//                       معدل الحضور العام
//                     </span>
//                     <span className="text-lg font-bold text-green-600">
//                       {stats.attendanceRate}%
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-green-600 h-2 rounded-full"
//                       style={{ width: `${stats.attendanceRate}%` }}></div>
//                   </div>

//                   <div className="flex justify-between items-center mt-4">
//                     <span className="text-sm text-gray-600">
//                       متوسط العلامات
//                     </span>
//                     <span className="text-lg font-bold text-blue-600">
//                       {stats.averageMarks}%
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-blue-600 h-2 rounded-full"
//                       style={{ width: `${stats.averageMarks}%` }}></div>
//                   </div>

//                   <div className="flex justify-between items-center mt-4">
//                     <span className="text-sm text-gray-600">
//                       الطلاب النشطين اليوم
//                     </span>
//                     <span className="text-lg font-bold text-purple-600">
//                       {stats.activeStudents}
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-purple-600 h-2 rounded-full"
//                       style={{
//                         width: `${
//                           (stats.activeStudents /
//                             Math.max(stats.totalStudents, 1)) *
//                           100
//                         }%`,
//                       }}></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import { useState, useEffect } from "react";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalExams: number;
  totalGroups: number;
  averageMarks: number;
  activeStudents: number;
  attendanceRate: number;
  upcomingExams: number;
  totalActivities: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
  trend?: string;
}

interface ChartData {
  labels: string[];
  data: number[];
}

interface BarChartProps {
  data: number[];
  labels: string[];
  color?: string;
  maxValue?: number;
}

interface PieChartProps {
  data: number[];
  labels: string[];
  colors: string[];
}



const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalExams: 0,
    totalGroups: 0,
    averageMarks: 0,
    activeStudents: 0,
    attendanceRate: 0,
    upcomingExams: 0,
    totalActivities: 0,
  });

  const [groupDistribution] = useState<ChartData>({
    labels: ["حلقة الأطفال", "حلقة المبتدئين", "حلقة المتوسطين", "حلقة المتقدمين"],
    data: [25, 30, 20, 15],
  });

  const [marksByGroup] = useState<ChartData>({
    labels: ["حلقة الأطفال", "حلقة المبتدئين", "حلقة المتوسطين", "حلقة المتقدمين"],
    data: [85, 78, 82, 88],
  });

  const [genderDistribution] = useState({
    male: 65,
    female: 35,
  });



  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const studentsResponse = await fetch("/api/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const studentsData = await studentsResponse.json();
        const studentsCount = Array.isArray(studentsData) ? studentsData.length : 0;

        const teachersResponse = await fetch("/api/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const teachersData = await teachersResponse.json();
        const teachersCount = teachersData.success && Array.isArray(teachersData.data) ? teachersData.data.length : 0;

        const examsResponse = await fetch("/api/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const examsData = await examsResponse.json();
        const examsCount = Array.isArray(examsData) ? examsData.length : 0;

        const groupsResponse = await fetch("/api/groups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groupsData = await groupsResponse.json();
        const groupsCount = groupsData.success && Array.isArray(groupsData.data) ? groupsData.data.length : 0;

        const averageMarks = 85;

        setStats({
          totalStudents: studentsCount,
          totalTeachers: teachersCount,
          totalExams: examsCount,
          totalGroups: groupsCount,
          averageMarks: averageMarks,
          activeStudents: 42,
          attendanceRate: 87,
          upcomingExams: 5,
          totalActivities: 23,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, []);

  const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, bgColor, borderColor, trend }) => (
    <div className={`${bgColor} p-6 rounded-xl border-2 ${borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={`p-3 ${color} rounded-xl shadow-md`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {trend}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const BarChart: React.FC<BarChartProps> = ({ data, labels, color = "bg-blue-500", maxValue = 100 }) => {
    const max = Math.max(...data, maxValue);
    return (
      <div className="h-full flex items-end justify-around gap-4 px-4">
        {data.map((value, i) => {
          const heightPercent = (value / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-100 rounded-t-lg relative h-60 overflow-hidden">
                <div
                  className={`${color} rounded-t-lg absolute bottom-0 w-full transition-all duration-500 hover:opacity-80 flex items-end justify-center pb-2 bar-chart-item`}
                  data-height={heightPercent}
                >
                  <span className="text-white font-bold text-sm">{value}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">{labels[i]}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const PieChart: React.FC<PieChartProps> = ({ data, labels, colors }) => {
    const total = data.reduce((sum: number, val: number) => sum + val, 0);
    let currentAngle = 0;

    return (
      <div className="flex flex-col items-center h-full justify-center">
        <div className="relative w-56 h-56">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.map((value, i) => {
              const percentage = (value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;

              const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 45 * Math.cos((currentAngle * Math.PI) / 180);
              const y2 = 50 + 45 * Math.sin((currentAngle * Math.PI) / 180);
              const largeArc = angle > 180 ? 1 : 0;

              return (
                <path
                  key={i}
                  d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[i]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  stroke="white"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {labels.map((label: string, i: number) => {
            const colorClasses = [
              'bg-emerald-500',
              'bg-blue-500',
              'bg-purple-500',
              'bg-amber-500',
            ];
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${colorClasses[i] || 'bg-gray-500'}`}></div>
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">لوحة الإحصائيات</h1>
          <p className="text-gray-600">نظرة شاملة على أداء المنصة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
            title="إجمالي الطلاب"
            value={stats.totalStudents}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            trend="+12% هذا الشهر"
          />

          <StatCard
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            title="إجمالي المعلمين"
            value={stats.totalTeachers}
            color="bg-gradient-to-br from-green-500 to-green-600"
            bgColor="bg-green-50"
            borderColor="border-green-200"
            trend="+3 هذا الربع"
          />

          <StatCard
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            title="إجمالي الاختبارات"
            value={stats.totalExams}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            bgColor="bg-yellow-50"
            borderColor="border-yellow-200"
          />

          <StatCard
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            title="إجمالي الحلقات"
            value={stats.totalGroups}
            color="bg-gradient-to-br from-red-500 to-red-600"
            bgColor="bg-red-50"
            borderColor="border-red-200"
          />

          <StatCard
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="الطلاب النشطين"
            value={stats.activeStudents}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            trend="نشط اليوم"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border-2 border-indigo-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700 mb-1">معدل الحضور</p>
                <p className="text-3xl font-bold text-indigo-900">{stats.attendanceRate}%</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">الامتحانات القادمة</p>
                <p className="text-3xl font-bold text-orange-900">{stats.upcomingExams}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>



          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border-2 border-pink-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700 mb-1">إجمالي الأنشطة</p>
                <p className="text-3xl font-bold text-pink-900">{stats.totalActivities}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full ml-3"></span>
              إحصائيات المستخدمين
            </h3>
            <div className="h-72">
              <BarChart
                data={[stats.totalStudents, stats.totalTeachers, stats.totalGroups]}
                labels={["الطلاب", "المعلمين", "الحلقات"]}
                color="bg-gradient-to-t from-blue-500 to-blue-600"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full ml-3"></span>
              توزيع الطلاب حسب الحلقات
            </h3>
            <div className="h-72">
              <PieChart
                data={groupDistribution.data}
                labels={groupDistribution.labels}
                colors={["#3b82f6", "#22c55e", "#ef4444", "#a855f7"]}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full ml-3"></span>
              متوسط العلامات
            </h3>
            <div className="h-72">
              <BarChart
                data={marksByGroup.data}
                labels={marksByGroup.labels}
                color="bg-gradient-to-t from-green-500 to-green-600"
                maxValue={100}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-pink-500 to-pink-600 rounded-full ml-3"></span>
              توزيع الطلاب حسب الجنس
            </h3>
            <div className="h-80">
              <PieChart
                data={[genderDistribution.male, genderDistribution.female]}
                labels={["ذكور", "إناث"]}
                colors={["#3b82f6", "#ec4899"]}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full ml-3"></span>
              متوسط العلامات
            </h3>
            <div className="h-80">
              <BarChart
                data={marksByGroup.data}
                labels={marksByGroup.labels}
                color="bg-gradient-to-t from-amber-500 to-amber-600"
                maxValue={100}
              />
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default AdminDashboard;