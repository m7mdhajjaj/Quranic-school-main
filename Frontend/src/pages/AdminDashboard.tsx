import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../components/Loading/LoadingSkeleton";
import { useDashboardStats } from "../hooks/useDashboardStats";
import "../styles/dashboard.css";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
  trend?: string;
  onClick?: () => void;
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

  // تحويل بيانات الحلقات للرسم البياني - فقط الحلقات التي بها طلاب
  const groupsWithStudents = groupsDistribution.filter(
    (g) => g.studentCount > 0
  );
  const groupDistribution: ChartData = {
    labels: groupsWithStudents.map((g) => g.groupName),
    data: groupsWithStudents.map((g) => g.studentCount),
  };

  const [marksByGroup] = useState<ChartData>({
    labels: [
      "حلقة الأطفال",
      "حلقة المبتدئين",
      "حلقة المتوسطين",
      "حلقة المتقدمين",
    ],
    data: [85, 78, 82, 88],
  });

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
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-red-500"
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
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
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
  }) => (
    <div
      className={`${bgColor} p-6 rounded-xl border-2 ${borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        onClick ? "cursor-pointer hover:scale-105" : ""
      }`}
      onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={`p-3 ${color} rounded-xl shadow-md`}>{icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <svg
                  className="w-4 h-4 ml-1"
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
                {trend}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const BarChart: React.FC<BarChartProps> = ({
    data,
    labels,
    color = "bg-blue-500",
    maxValue = 100,
  }) => {
    const max = Math.max(...data, maxValue);
    return (
      <div className="h-full flex items-end justify-around gap-4 px-4">
        {data.map((value, i) => {
          const heightPercent = (value / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-100 rounded-t-lg relative h-60 overflow-hidden">
                <div
                  className={`${color} rounded-t-lg absolute bottom-0 w-full transition-all duration-500 hover:opacity-80 flex items-end justify-center pb-2`}
                  data-height={heightPercent}>
                  <span className="text-white font-bold text-sm">{value}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
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
              className="w-16 h-16 mx-auto mb-2 text-gray-300"
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
            <p>لا توجد بيانات للعرض</p>
          </div>
        </div>
      );
    }

    let currentAngle = 0;

    return (
      <div className="flex flex-col items-center h-full justify-center">
        <div className="relative w-64 h-64 mb-4">
          <svg
            viewBox="0 0 120 120"
            className="transform -rotate-90 drop-shadow-lg">
            {/* الخلفية */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="#f3f4f6"
              stroke="#e5e7eb"
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
                    className="hover:opacity-90 transition-all duration-200 cursor-pointer hover:scale-105"
                    stroke="white"
                    strokeWidth="3"
                    style={{ transformOrigin: "60px 60px" }}
                  />

                  {/* النص داخل القطعة */}
                  {percentage >= 8 && (
                    <text
                      x={
                        60 +
                        30 *
                          Math.cos(
                            (((startAngle + currentAngle) / 2) * Math.PI) / 180
                          )
                      }
                      y={
                        60 +
                        30 *
                          Math.sin(
                            (((startAngle + currentAngle) / 2) * Math.PI) / 180
                          )
                      }
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="transform rotate-90"
                      style={{
                        transform: `rotate(90deg) translate(${
                          60 +
                          30 *
                            Math.cos(
                              (((startAngle + currentAngle) / 2) * Math.PI) /
                                180
                            )
                        }px, ${
                          60 +
                          30 *
                            Math.sin(
                              (((startAngle + currentAngle) / 2) * Math.PI) /
                                180
                            )
                        }px)`,
                        textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
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
              r="20"
              fill="white"
              stroke="#e5e7eb"
              strokeWidth="2"
            />

            {/* النص المركزي */}
            <text
              x="60"
              y="55"
              textAnchor="middle"
              fill="#374151"
              fontSize="10"
              fontWeight="bold"
              className="transform rotate-90">
              المجموع
            </text>
            <text
              x="60"
              y="68"
              textAnchor="middle"
              fill="#1f2937"
              fontSize="14"
              fontWeight="bold"
              className="transform rotate-90">
              {total}
            </text>
          </svg>
        </div>

        {/* الأسطورة المحسنة */}
        <div className="w-full space-y-2">
          {labels.map((label: string, i: number) => {
            const percentage =
              total > 0 ? Math.round((data[i] / total) * 100) : 0;
            if (data[i] === 0) return null;

            return (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: colors[i] || "#94a3b8" }}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {data[i]}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
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
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50"
      dir="rtl">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="text-right">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              لوحة الإحصائيات
            </h1>
            <p className="text-gray-600">نظرة شاملة على أداء المنصة</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex flex-col items-start gap-2">
              <button
                onClick={() => fetchStats(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                <svg
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
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
                {refreshing ? "جاري التحديث..." : "تحديث البيانات"}
              </button>
              {lastUpdated && (
                <p className="text-xs text-gray-500 text-right">
                  آخر تحديث: {lastUpdated.toLocaleTimeString("ar-SA")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={
              <svg
                className="w-7 h-7 text-white"
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
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            trend="+12% هذا الشهر"
          />

          <StatCard
            icon={
              <svg
                className="w-7 h-7 text-white"
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
            color="bg-gradient-to-br from-green-500 to-green-600"
            bgColor="bg-green-50"
            borderColor="border-green-200"
            trend="+8% هذا الشهر"
            onClick={handleTeachersClick}
          />

          <StatCard
            icon={
              <svg
                className="w-7 h-7 text-white"
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
            value={stats.averageMarks}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            trend="+5% تحسن"
          />

          <StatCard
            icon={
              <svg
                className="w-7 h-7 text-white"
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
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
          />

          <StatCard
            icon={
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            }
            title="إجمالي الأنشطة"
            value={stats.totalActivities}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            bgColor="bg-pink-50"
            borderColor="border-pink-200"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center text-right">
              <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></span>
              إحصائيات المستخدمين
            </h3>
            <div className="h-72">
              <BarChart
                data={[
                  stats.totalStudents,
                  stats.totalTeachers,
                  stats.totalGroups,
                ]}
                labels={["الطلاب", "المعلمين", "الحلقات"]}
                color="bg-gradient-to-t from-blue-500 to-blue-600"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center text-right">
              <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></span>
              توزيع الطلاب حسب الحلقات
            </h3>
            <div className="text-sm text-gray-600 mb-4 text-right flex flex-wrap gap-4 justify-between">
              <span>
                إجمالي{" "}
                {groupsDistribution.reduce((sum, g) => sum + g.studentCount, 0)}{" "}
                طالب
              </span>
              <span>{groupsDistribution.length} حلقة إجمالي</span>
              <span>{groupsWithStudents.length} حلقة نشطة</span>
            </div>
            <div className="h-80">
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
                      className="w-12 h-12 mx-auto mb-2 text-gray-300"
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
                    <p className="text-sm">لا توجد حلقات</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center text-right">
              <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></span>
              الدرجات حسب الحلقات
            </h3>
            <div className="h-72">
              <BarChart
                data={marksByGroup.data}
                labels={marksByGroup.labels}
                color="bg-gradient-to-t from-purple-500 to-purple-600"
                maxValue={100}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-right">
              معدل الحضور
            </h3>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.attendanceRate}%
                </div>
                <p className="text-gray-600">من إجمالي الحصص</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-right">
              الطلاب النشطون
            </h3>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.activeStudents}
                </div>
                <p className="text-gray-600">طالب نشط هذا الشهر</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
