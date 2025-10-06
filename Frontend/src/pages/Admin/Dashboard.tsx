// import { useNavigate } from "react-router-dom";
// import LoadingSkeleton from "../../components/Loading/LoadingSkeleton";
// import { useDashboardStats } from "../../hooks/useDashboardStats";
// import "../../styles/dashboard.css";

// interface StatCardProps {
//   icon: React.ReactNode;
//   title: string;
//   value: number;
//   color: string;
//   bgColor: string;
//   borderColor: string;
//   trend?: string;
//   onClick?: () => void;
// }

// interface ChartData {
//   labels: string[];
//   data: number[];
// }

// interface BarChartProps {
//   data: number[];
//   labels: string[];
//   color?: string;
//   maxValue?: number;
// }

// interface PieChartProps {
//   data: number[];
//   labels: string[];
//   colors: string[];
// }

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const {
//     stats,
//     isLoading,
//     error,
//     lastUpdated,
//     refreshing,
//     fetchStats,
//     groupsDistribution,
//   } = useDashboardStats();

//   // Navigation handlers for statistics cards
//   const handleTeachersClick = () => {
//     navigate("/admin/teachers");
//   };

//   // تحويل بيانات الحلقات للرسم البياني - فقط الحلقات التي بها طلاب
//   const groupsWithStudents = groupsDistribution.filter(
//     (g) => g.studentCount > 0
//   );
//   const groupDistribution: ChartData = {
//     labels: groupsWithStudents.map((g) => g.groupName),
//     data: groupsWithStudents.map((g) => g.studentCount),
//   };

//   // عرض Loading state
//   if (isLoading) {
//     return (
//       <LoadingSkeleton
//         title="جاري تحميل الإحصائيات..."
//         description="يتم الآن جلب البيانات من قاعدة البيانات"
//       />
//     );
//   }

//   // عرض رسالة الخطأ إذا وجدت
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
//         <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//           <div className="mb-8">
//             <h1 className="text-4xl font-bold text-gray-900 mb-2">
//               لوحة الإحصائيات
//             </h1>
//             <p className="text-gray-600">نظرة شاملة على أداء المنصة</p>
//           </div>
//           <div className="flex items-center justify-center py-32">
//             <div className="text-center">
//               <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
//                 <svg
//                   className="w-12 h-12 mx-auto mb-4 text-red-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
//                   />
//                 </svg>
//                 <p className="text-lg font-medium">{error}</p>
//                 <button
//                   onClick={() => fetchStats(true)}
//                   className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
//                   إعادة المحاولة
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const StatCard: React.FC<StatCardProps> = ({
//     icon,
//     title,
//     value,
//     color,
//     bgColor,
//     borderColor,
//     trend,
//     onClick,
//   }) => (
//     <div
//       className={`${bgColor} p-6 rounded-xl border-2 ${borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
//         onClick ? "cursor-pointer hover:scale-105" : ""
//       }`}
//       onClick={onClick}>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4 space-x-reverse">
//           <div className={`p-3 ${color} rounded-xl shadow-md`}>{icon}</div>
//           <div>
//             <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
//             <p className="text-3xl font-bold text-gray-900">{value}</p>
//             {trend && (
//               <p className="text-xs text-green-600 mt-1 flex items-center">
//                 <svg
//                   className="w-4 h-4 ml-1"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
//                   />
//                 </svg>
//                 {trend}
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const BarChart: React.FC<BarChartProps> = ({
//     data,
//     labels,
//     color = "bg-blue-500",
//     maxValue = 100,
//   }) => {
//     const max = Math.max(...data, maxValue);
//     return (
//       <div className="h-full flex items-end justify-around gap-4 px-4">
//         {data.map((value, i) => {
//           const heightPercent = (value / max) * 100;
//           return (
//             <div key={i} className="flex-1 flex flex-col items-center">
//               <div className="w-full bg-gray-100 rounded-t-lg relative h-60 overflow-hidden">
//                 <div
//                   className={`${color} rounded-t-lg absolute bottom-0 w-full transition-all duration-500 hover:opacity-80 flex items-end justify-center pb-2`}
//                   style={{ height: `${heightPercent}%` }}>
//                   <span className="text-white font-bold text-sm">{value}</span>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-600 mt-2 text-center">
//                 {labels[i]}
//               </p>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   const PieChart: React.FC<PieChartProps> = ({ data, labels, colors }) => {
//     const total = data.reduce((sum: number, val: number) => sum + val, 0);

//     if (total === 0) {
//       return (
//         <div className="flex items-center justify-center h-full text-gray-500">
//           <div className="text-center">
//             <svg
//               className="w-16 h-16 mx-auto mb-2 text-gray-300"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//               />
//             </svg>
//             <p>لا توجد بيانات للعرض</p>
//           </div>
//         </div>
//       );
//     }

//     let currentAngle = 0;

//     return (
//       <div className="flex flex-col items-center h-full justify-center">
//         <div className="relative w-64 h-64 mb-4">
//           <svg
//             viewBox="0 0 120 120"
//             className="transform -rotate-90 drop-shadow-lg">
//             {/* الخلفية */}
//             <circle
//               cx="60"
//               cy="60"
//               r="50"
//               fill="#f3f4f6"
//               stroke="#e5e7eb"
//               strokeWidth="2"
//             />

//             {data.map((value, i) => {
//               if (value === 0) return null;

//               const percentage = (value / total) * 100;
//               const angle = (percentage / 100) * 360;
//               const startAngle = currentAngle;
//               currentAngle += angle;

//               const x1 = 60 + 48 * Math.cos((startAngle * Math.PI) / 180);
//               const y1 = 60 + 48 * Math.sin((startAngle * Math.PI) / 180);
//               const x2 = 60 + 48 * Math.cos((currentAngle * Math.PI) / 180);
//               const y2 = 60 + 48 * Math.sin((currentAngle * Math.PI) / 180);
//               const largeArc = angle > 180 ? 1 : 0;

//               return (
//                 <g key={i}>
//                   <path
//                     d={`M 60 60 L ${x1} ${y1} A 48 48 0 ${largeArc} 1 ${x2} ${y2} Z`}
//                     fill={colors[i] || "#94a3b8"}
//                     className="hover:opacity-90 transition-all duration-200 cursor-pointer hover:scale-105"
//                     stroke="white"
//                     strokeWidth="3"
//                     style={{ transformOrigin: "60px 60px" }}
//                   />

//                   {/* النص داخل القطعة */}
//                   {percentage >= 8 && (
//                     <text
//                       x={
//                         60 +
//                         30 *
//                           Math.cos(
//                             (((startAngle + currentAngle) / 2) * Math.PI) / 180
//                           )
//                       }
//                       y={
//                         60 +
//                         30 *
//                           Math.sin(
//                             (((startAngle + currentAngle) / 2) * Math.PI) / 180
//                           )
//                       }
//                       fill="white"
//                       fontSize="12"
//                       fontWeight="bold"
//                       textAnchor="middle"
//                       dominantBaseline="middle"
//                       className="transform rotate-90"
//                       style={{
//                         transform: `rotate(90deg) translate(${
//                           60 +
//                           30 *
//                             Math.cos(
//                               (((startAngle + currentAngle) / 2) * Math.PI) /
//                                 180
//                             )
//                         }px, ${
//                           60 +
//                           30 *
//                             Math.sin(
//                               (((startAngle + currentAngle) / 2) * Math.PI) /
//                                 180
//                             )
//                         }px)`,
//                         textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
//                       }}>
//                       {value}
//                     </text>
//                   )}
//                 </g>
//               );
//             })}

//             {/* الدائرة الداخلية */}
//             <circle
//               cx="60"
//               cy="60"
//               r="20"
//               fill="white"
//               stroke="#e5e7eb"
//               strokeWidth="2"
//             />

//             {/* النص المركزي */}
//             <text
//               x="60"
//               y="55"
//               textAnchor="middle"
//               fill="#374151"
//               fontSize="10"
//               fontWeight="bold"
//               className="transform rotate-90">
//               المجموع
//             </text>
//             <text
//               x="60"
//               y="68"
//               textAnchor="middle"
//               fill="#1f2937"
//               fontSize="14"
//               fontWeight="bold"
//               className="transform rotate-90">
//               {total}
//             </text>
//           </svg>
//         </div>

//         {/* الأسطورة المحسنة */}
//         <div className="w-full space-y-2">
//           {labels.map((label: string, i: number) => {
//             const percentage =
//               total > 0 ? Math.round((data[i] / total) * 100) : 0;
//             if (data[i] === 0) return null;

//             return (
//               <div
//                 key={i}
//                 className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                 <div className="flex items-center gap-3">
//                   <div
//                     className="w-4 h-4 rounded-full shadow-sm"
//                     style={{ backgroundColor: colors[i] || "#94a3b8" }}></div>
//                   <span className="text-sm font-medium text-gray-700">
//                     {label}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm font-bold text-gray-900">
//                     {data[i]}
//                   </span>
//                   <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
//                     {percentage}%
//                   </span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div
//       className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50"
//       dir="rtl">
//       <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//         <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
//           <div className="text-right">
//             <h1 className="text-4xl font-bold text-gray-900 mb-2">
//               لوحة الإحصائيات
//             </h1>
//             <p className="text-gray-600">نظرة شاملة على أداء المنصة</p>
//           </div>
//           <div className="mt-4 sm:mt-0">
//             <div className="flex flex-col items-end gap-2">
//               {refreshing && (
//                 <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
//                   <svg
//                     className="w-4 h-4 animate-spin"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24">
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                     />
//                   </svg>
//                   <span className="text-sm">تحديث تلقائي...</span>
//                 </div>
//               )}
              
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <svg
//                   className="w-4 h-4 text-green-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M13 10V3L4 14h7v7l9-11h-7z"
//                   />
//                 </svg>
//                 <span>تحديث مباشر</span>
//               </div>
              
//               {lastUpdated && (
//                 <p className="text-xs text-gray-500 text-right">
//                   آخر تحديث: {lastUpdated.toLocaleTimeString("ar-SA")}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
//           <StatCard
//             icon={
//               <svg
//                 className="w-7 h-7 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
//                 />
//               </svg>
//             }
//             title="إجمالي الطلاب"
//             value={stats.totalStudents}
//             color="bg-gradient-to-br from-blue-500 to-blue-600"
//             bgColor="bg-blue-50"
//             borderColor="border-blue-200"
//             trend="+12% هذا الشهر"
//           />

//           <StatCard
//             icon={
//               <svg
//                 className="w-7 h-7 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//                 />
//               </svg>
//             }
//             title="إجمالي المعلمين"
//             value={stats.totalTeachers}
//             color="bg-gradient-to-br from-green-500 to-green-600"
//             bgColor="bg-green-50"
//             borderColor="border-green-200"
//             trend="+8% هذا الشهر"
//             onClick={handleTeachersClick}
//           />

//           <StatCard
//             icon={
//               <svg
//                 className="w-7 h-7 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
//                 />
//               </svg>
//             }
//             title="معدل الدرجات"
//             value={stats.averageExamMarks}
//             color="bg-gradient-to-br from-purple-500 to-purple-600"
//             bgColor="bg-purple-50"
//             borderColor="border-purple-200"
//             trend="+5% تحسن"
//           />

//           <StatCard
//             icon={
//               <svg
//                 className="w-7 h-7 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                 />
//               </svg>
//             }
//             title="عدد الامتحانات"
//             value={stats.totalExams}
//             color="bg-gradient-to-br from-orange-500 to-orange-600"
//             bgColor="bg-orange-50"
//             borderColor="border-orange-200"
//           />

//           <StatCard
//             icon={
//               <svg
//                 className="w-7 h-7 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
//                 />
//               </svg>
//             }
//             title="إجمالي الأنشطة"
//             value={stats.totalActivities}
//             color="bg-gradient-to-br from-pink-500 to-pink-600"
//             bgColor="bg-pink-50"
//             borderColor="border-pink-200"
//           />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
//             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center text-right">
//               <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></span>
//               إحصائيات المستخدمين
//             </h3>
//             <div className="h-72">
//               <BarChart
//                 data={[
//                   stats.totalStudents,
//                   stats.totalTeachers,
//                   stats.totalGroups,
//                 ]}
//                 labels={["الطلاب", "المعلمين", "الحلقات"]}
//                 color="bg-gradient-to-t from-blue-500 to-blue-600"
//               />
//             </div>
//           </div>

//           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
//             <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center text-right">
//               <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></span>
//               توزيع الطلاب حسب الحلقات
//             </h3>
//             <div className="text-sm text-gray-600 mb-4 text-right flex flex-wrap gap-4 justify-between">
//               <span>
//                 إجمالي{" "}
//                 {groupsDistribution.reduce((sum, g) => sum + g.studentCount, 0)}{" "}
//                 طالب
//               </span>
//               <span>{groupsDistribution.length} حلقة إجمالي</span>
//               <span>{groupsWithStudents.length} حلقة نشطة</span>
//             </div>
//             <div className="h-80">
//               {groupsDistribution.length > 0 ? (
//                 <PieChart
//                   data={groupDistribution.data}
//                   labels={groupDistribution.labels}
//                   colors={[
//                     "#3b82f6", // أزرق
//                     "#22c55e", // أخضر
//                     "#f59e0b", // برتقالي
//                     "#a855f7", // بنفسجي
//                     "#ef4444", // أحمر
//                     "#ec4899", // وردي
//                     "#06b6d4", // سماوي
//                     "#84cc16", // أخضر فاتح
//                     "#f97316", // برتقالي غامق
//                     "#8b5cf6", // بنفسجي فاتح
//                   ]}
//                 />
//               ) : (
//                 <div className="flex items-center justify-center h-full text-gray-500">
//                   <div className="text-center">
//                     <svg
//                       className="w-12 h-12 mx-auto mb-2 text-gray-300"
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
//                     <p className="text-sm">لا توجد حلقات</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
//             <h3 className="text-xl font-bold text-gray-900 mb-6 text-right">
//               الطلاب النشطون
//             </h3>
//             <div className="flex items-center justify-center h-32">
//               <div className="text-center">
//                 <div className="text-4xl font-bold text-blue-600 mb-2">
//                   {stats.activeStudents}
//                 </div>
//                 <p className="text-gray-600">طالب نشط هذا الشهر</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../../components/Loading/LoadingSkeleton";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import "../../styles/dashboard.css";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
  trend?: string;
  onClick?: () => void;
  percentage?: number;
}

interface ChartData {
  labels: string[];
  data: number[];
}

interface BarChartProps {
  data: number[];
  labels: string[];
  colors?: string[];
  maxValue?: number;
}

interface PieChartProps {
  data: number[];
  labels: string[];
  colors: string[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    stats,
    isLoading,
    error,
    lastUpdated,
    refreshing,
    fetchStats,
    groupsDistribution,
  } = useDashboardStats();

  // Navigation handlers for statistics cards
  const handleTeachersClick = () => {
    navigate("/admin/teachers");
  };

  const handleStudentsClick = () => {
    navigate("/admin/students");
  };

  const handleGroupsClick = () => {
    navigate("/admin/groups");
  };

  const handleExamsClick = () => {
    navigate("/admin/exams");
  };

  // تحويل بيانات الحلقات للرسم البياني - فقط الحلقات التي بها طلاب
  const groupsWithStudents = groupsDistribution.filter(
    (g) => g.studentCount > 0
  );
  const groupDistribution: ChartData = {
    labels: groupsWithStudents.map((g) => g.groupName),
    data: groupsWithStudents.map((g) => g.studentCount),
  };

  // عرض Loading state
  if (isLoading) {
    return (
      <LoadingSkeleton
        title="جاري تحميل الإحصائيات..."
        description="يتم الآن جلب البيانات من قاعدة البيانات"
      />
    );
  }

  // عرض رسالة الخطأ إذا وجدت
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              لوحة الإحصائيات
            </h1>
            <p className="text-gray-600">نظرة شاملة على أداء المنصة</p>
          </div>
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-red-500 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-lg font-medium">{error}</p>
                <button
                  onClick={() => fetchStats(true)}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  إعادة المحاولة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StatCard: React.FC<StatCardProps> = ({
    icon,
    title,
    value,
    color,
    bgColor,
    borderColor,
    trend,
    onClick,
    percentage = 0,
  }) => (
    <div
      className={`${bgColor} p-6 rounded-2xl border-2 ${borderColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
        onClick ? "cursor-pointer hover:scale-105 group" : ""
      } relative overflow-hidden`}
      onClick={onClick}>
      
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-4 ${color} rounded-2xl shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            {icon}
          </div>
          
          {/* مؤشر النسبة المئوية */}
          {percentage > 0 && (
            <div className="text-right">
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-gray-200"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${percentage * 1.76} 176`}
                    className="text-blue-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">{percentage}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-2 animate-pulse">{value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full w-fit">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-xs font-semibold">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const BarChart: React.FC<BarChartProps> = ({
    data,
    labels,
    colors = ["bg-gradient-to-t from-blue-500 to-blue-600"],
    maxValue = 100,
  }) => {
    const max = Math.max(...data, maxValue);
    
    const defaultColors = [
      "bg-gradient-to-t from-blue-500 to-blue-600",
      "bg-gradient-to-t from-green-500 to-green-600", 
      "bg-gradient-to-t from-purple-500 to-purple-600",
      "bg-gradient-to-t from-orange-500 to-orange-600",
      "bg-gradient-to-t from-pink-500 to-pink-600"
    ];

    return (
      <div className="h-full flex items-end justify-around gap-4 px-4">
        {data.map((value, i) => {
          const heightPercent = (value / max) * 100;
          const color = colors[i] || defaultColors[i % defaultColors.length];
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center group">
              <div className="w-full bg-gray-100 rounded-t-2xl relative h-64 overflow-hidden shadow-inner">
                <div
                  className={`${color} rounded-t-2xl absolute bottom-0 w-full transition-all duration-1000 hover:opacity-90 flex items-end justify-center pb-3 group-hover:shadow-lg transform group-hover:scale-105`}
                  style={{ 
                    height: `${heightPercent}%`,
                    animationDelay: `${i * 200}ms`
                  }}>
                  <span className="text-white font-bold text-sm bg-black/20 px-2 py-1 rounded backdrop-blur-sm">
                    {value.toLocaleString()}
                  </span>
                </div>
                
                {/* تأثير الإضاءة */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 pointer-events-none"></div>
              </div>
              <p className="text-sm text-gray-600 mt-3 text-center font-medium group-hover:text-gray-900 transition-colors">
                {labels[i]}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const PieChart: React.FC<PieChartProps> = ({ data, labels, colors }) => {
    const total = data.reduce((sum: number, val: number) => sum + val, 0);

    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-gray-300 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium">لا توجد بيانات للعرض</p>
            <p className="text-sm text-gray-400">قم بإضافة حلقات وطلاب لرؤية الإحصائيات</p>
          </div>
        </div>
      );
    }

    let currentAngle = 0;

    return (
      <div className="flex flex-col items-center h-full justify-center">
        <div className="relative w-72 h-72 mb-6">
          <svg
            viewBox="0 0 120 120"
            className="transform -rotate-90 drop-shadow-2xl hover:scale-105 transition-transform duration-300">
            
            {/* الخلفية */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="2"
            />

            {data.map((value, i) => {
              if (value === 0) return null;

              const percentage = (value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;

              const x1 = 60 + 48 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 60 + 48 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 60 + 48 * Math.cos((currentAngle * Math.PI) / 180);
              const y2 = 60 + 48 * Math.sin((currentAngle * Math.PI) / 180);
              const largeArc = angle > 180 ? 1 : 0;

              return (
                <g key={i}>
                  <path
                    d={`M 60 60 L ${x1} ${y1} A 48 48 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={colors[i] || "#94a3b8"}
                    className="hover:opacity-80 transition-all duration-300 cursor-pointer hover:scale-105 filter hover:brightness-110"
                    stroke="white"
                    strokeWidth="3"
                    style={{ 
                      transformOrigin: "60px 60px",
                      filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                    }}
                  />

                  {/* النص داخل القطعة */}
                  {percentage >= 8 && (
                    <text
                      x={
                        60 +
                        32 *
                          Math.cos(
                            (((startAngle + currentAngle) / 2) * Math.PI) / 180
                          )
                      }
                      y={
                        60 +
                        32 *
                          Math.sin(
                            (((startAngle + currentAngle) / 2) * Math.PI) / 180
                          )
                      }
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="transform rotate-90"
                      style={{
                        textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                      }}>
                      {value}
                    </text>
                  )}
                </g>
              );
            })}

            {/* الدائرة الداخلية */}
            <circle
              cx="60"
              cy="60"
              r="22"
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="2"
              filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
            />

            {/* النص المركزي */}
            <text
              x="60"
              y="52"
              textAnchor="middle"
              fill="#64748b"
              fontSize="9"
              fontWeight="600"
              className="transform rotate-90">
              المجموع
            </text>
            <text
              x="60"
              y="68"
              textAnchor="middle"
              fill="#1e293b"
              fontSize="16"
              fontWeight="bold"
              className="transform rotate-90">
              {total.toLocaleString()}
            </text>
          </svg>
        </div>

        {/* الأسطورة المحسنة */}
        <div className="w-full space-y-3 max-h-32 overflow-y-auto custom-scrollbar">
          {labels.map((label: string, i: number) => {
            const percentage =
              total > 0 ? Math.round((data[i] / total) * 100) : 0;
            if (data[i] === 0) return null;

            return (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-md hover:scale-102 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full shadow-lg border-2 border-white"
                    style={{ backgroundColor: colors[i] || "#94a3b8" }}></div>
                  <span className="text-sm font-semibold text-gray-700">
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-900">
                    {data[i].toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 rounded-full shadow">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      dir="rtl">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* رأس الصفحة المحسن */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="text-right">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
              لوحة الإحصائيات
            </h1>
            <p className="text-xl text-gray-600 font-medium">نظرة شاملة ومتطورة على أداء المنصة</p>
          </div>
          
          <div className="mt-6 lg:mt-0">
            <div className="flex flex-col items-end gap-4">
              {refreshing && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl shadow-lg border border-green-200 animate-pulse">
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="font-semibold">تحديث تلقائي...</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md border border-gray-200">
                <svg
                  className="w-5 h-5 text-green-500 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="font-semibold text-gray-700">تحديث مباشر</span>
              </div>
              
              {lastUpdated && (
                <p className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg shadow-sm">
                  آخر تحديث: {lastUpdated.toLocaleTimeString("ar-SA")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات المحسنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-12">
          <StatCard
            icon={
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            }
            title="إجمالي الطلاب"
            value={stats.totalStudents}
            color="bg-gradient-to-br from-blue-500 to-blue-700"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            trend="+12% هذا الشهر"
            percentage={85}
            onClick={handleStudentsClick}
          />

          <StatCard
            icon={
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            title="إجمالي المعلمين"
            value={stats.totalTeachers}
            color="bg-gradient-to-br from-green-500 to-green-700"
            bgColor="bg-green-50"
            borderColor="border-green-200"
            trend="+8% هذا الشهر"
            percentage={92}
            onClick={handleTeachersClick}
          />

          <StatCard
            icon={
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            }
            title="معدل الدرجات"
            value={stats.averageExamMarks}
            color="bg-gradient-to-br from-purple-500 to-purple-700"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            trend="+5% تحسن"
            percentage={stats.averageExamMarks}
          />

          <StatCard
            icon={
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            title="عدد الامتحانات"
            value={stats.totalExams}
            color="bg-gradient-to-br from-orange-500 to-orange-700"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
            percentage={68}
            onClick={handleExamsClick}
          />

          <StatCard
            icon={
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
            title="الحلقات النشطة"
            value={stats.totalGroups}
            color="bg-gradient-to-br from-pink-500 to-pink-700"
            bgColor="bg-pink-50"
            borderColor="border-pink-200"
            percentage={76}
            onClick={handleGroupsClick}
          />
        </div>

        {/* الرسوم البيانية المحسنة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center text-right">
              <span className="w-3 h-10 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full mr-4"></span>
              إحصائيات المستخدمين
            </h3>
            <div className="h-80">
              <BarChart
                data={[
                  stats.totalStudents,
                  stats.totalTeachers,
                  stats.totalGroups,
                  stats.totalExams,
                ]}
                labels={["الطلاب", "المعلمين", "الحلقات", "الامتحانات"]}
                colors={[
                  "bg-gradient-to-t from-blue-500 to-blue-600",
                  "bg-gradient-to-t from-green-500 to-green-600",
                  "bg-gradient-to-t from-purple-500 to-purple-600",
                  "bg-gradient-to-t from-orange-500 to-orange-600"
                ]}
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center text-right">
              <span className="w-3 h-10 bg-gradient-to-b from-green-500 to-green-700 rounded-full mr-4"></span>
              توزيع الطلاب حسب الحلقات
            </h3>
            <div className="text-sm text-gray-600 mb-6 text-right grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                <span className="font-semibold text-blue-700">
                  إجمالي {groupsDistribution.reduce((sum, g) => sum + g.studentCount, 0).toLocaleString()} طالب
                </span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                <span className="font-semibold text-green-700">{groupsDistribution.length} حلقة إجمالي</span>
              </div>
              <div className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-200">
                <span className="font-semibold text-purple-700">{groupsWithStudents.length} حلقة نشطة</span>
              </div>
            </div>
            <div className="h-96">
              {groupsDistribution.length > 0 ? (
                <PieChart
                  data={groupDistribution.data}
                  labels={groupDistribution.labels}
                  colors={[
                    "#3b82f6", // أزرق
                    "#22c55e", // أخضر
                    "#f59e0b", // برتقالي
                    "#a855f7", // بنفسجي
                    "#ef4444", // أحمر
                    "#ec4899", // وردي
                    "#06b6d4", // سماوي
                    "#84cc16", // أخضر فاتح
                    "#f97316", // برتقالي غامق
                    "#8b5cf6", // بنفسجي فاتح
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <p className="text-lg font-semibold">لا توجد حلقات</p>
                    <p className="text-sm text-gray-400 mt-2">ابدأ بإنشاء حلقات جديدة</p>
                    <button 
                      onClick={handleGroupsClick}
                      className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg">
                      إضافة حلقة جديدة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* قسم الطلاب النشطون والأنشطة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-right flex items-center">
              <span className="w-3 h-10 bg-gradient-to-b from-green-500 to-green-700 rounded-full mr-4"></span>
              الطلاب النشطون
            </h3>
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="text-6xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent animate-pulse">
                    {stats.activeStudents.toLocaleString()}
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-gray-600 text-lg font-medium">طالب نشط هذا الشهر</p>
                <div className="mt-4 flex justify-center">
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                    +{Math.round((stats.activeStudents / stats.totalStudents) * 100)}% من الإجمالي
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-right flex items-center">
              <span className="w-3 h-10 bg-gradient-to-b from-pink-500 to-pink-700 rounded-full mr-4"></span>
              الأنشطة التعليمية
            </h3>
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent animate-pulse">
                    {stats.totalActivities.toLocaleString()}
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-pink-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-gray-600 text-lg font-medium">نشاط تعليمي متاح</p>
                <div className="mt-4 flex justify-center">
                  <div className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-semibold">
                    أنشطة متنوعة ومفيدة
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قسم الإحصائيات السريعة */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-right flex items-center">
            <span className="w-3 h-10 bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-full mr-4"></span>
            إحصائيات سريعة
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round((stats.activeStudents / stats.totalStudents) * 100)}%
              </div>
              <p className="text-blue-700 font-medium">معدل النشاط</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(stats.totalStudents / Math.max(stats.totalTeachers, 1))}
              </div>
              <p className="text-green-700 font-medium">طلاب لكل معلم</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(stats.totalStudents / Math.max(stats.totalGroups, 1))}
              </div>
              <p className="text-purple-700 font-medium">طلاب لكل حلقة</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.averageExamMarks}%
              </div>
              <p className="text-orange-700 font-medium">متوسط النجاح</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #1d4ed8, #1e40af);
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        @keyframes float-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float-in {
          animation: float-in 0.6s ease-out forwards;
        }

        .animate-float-in:nth-child(1) { animation-delay: 0.1s; }
        .animate-float-in:nth-child(2) { animation-delay: 0.2s; }
        .animate-float-in:nth-child(3) { animation-delay: 0.3s; }
        .animate-float-in:nth-child(4) { animation-delay: 0.4s; }
        .animate-float-in:nth-child(5) { animation-delay: 0.5s; }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;