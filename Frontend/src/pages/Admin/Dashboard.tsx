import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../../components/Loading/LoadingSkeleton";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useDashboardSocket } from "../../Socket";
import AddStudentForm from "../../components/Forms/AddStudentForm";
import AddTeacherForm from "../../components/Forms/AddTeacherForm";
import AddGroupForm from "../../components/Forms/AddGroupForm";

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
  onSegmentClick?: (
    label: string,
    value: number,
    percentage: number,
    color: string,
    index: number
  ) => void;
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

  // استخدام نظام Socket الجديد مع Heartbeat تلقائي كل 30 ثانية
  const {
    isConnected,
    dashboardData: _socketData, // البيانات من Socket (يمكن استخدامها لاحقاً)
    lastUpdate: socketLastUpdate,
    requestUpdate,
    socketId,
  } = useDashboardSocket();

  // عداد التحديثات التلقائية وآخر تحديث تلقائي
  const [autoRefreshCount, setAutoRefreshCount] = useState(0);
  const [lastAutoRefresh, setLastAutoRefresh] = useState<Date | null>(null);

  // State لإدارة عرض تفاصيل الحلقة المحددة
  const [selectedGroup, setSelectedGroup] = useState<{
    name: string;
    count: number;
    percentage: number;
    color: string;
    index: number;
  } | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);

  // State لإدارة امتداد المعلومات
  const [expandedGroup, setExpandedGroup] = useState<{
    name: string;
    count: number;
    percentage: number;
    color: string;
    index: number;
  } | null>(null);

  // State لإدارة فتح وإغلاق الـ Forms
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);

  // نظام التحديث التلقائي كنظام احتياطي
  useEffect(() => {
    // تحديث تلقائي كل 30 ثانية عندما يكون Socket غير متصل
    const refreshInterval = setInterval(() => {
      if (!isConnected && !refreshing) {
        setAutoRefreshCount((count) => count + 1);
        setLastAutoRefresh(new Date());
        console.log("🔄 تحديث تلقائي لللوحة (وضع احتياطي)");
        fetchStats(true);
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [isConnected, refreshing, fetchStats]);

  // تطبيق الألوان والعروض ديناميكياً
  useEffect(() => {
    // تطبيق الألوان
    const colorElements = document.querySelectorAll("[data-color]");
    colorElements.forEach((element) => {
      const color = element.getAttribute("data-color");
      if (color) {
        (element as HTMLElement).style.backgroundColor = color;
      }
    });

    // تطبيق العروض
    const widthElements = document.querySelectorAll("[data-width]");
    widthElements.forEach((element) => {
      const width = element.getAttribute("data-width");
      if (width) {
        (element as HTMLElement).style.width = `${width}%`;
      }
    });

    // تطبيق الارتفاعات والتأخيرات
    const heightElements = document.querySelectorAll("[data-height]");
    heightElements.forEach((element) => {
      const height = element.getAttribute("data-height");
      const delay = element.getAttribute("data-delay");
      if (height) {
        (element as HTMLElement).style.height = `${height}%`;
      }
      if (delay) {
        (element as HTMLElement).style.animationDelay = `${delay}ms`;
      }
    });

    // تطبيق ألوان الخلفية للـ Modal
    const bgColorElements = document.querySelectorAll("[data-bg-color]");
    bgColorElements.forEach((element) => {
      const bgColor = element.getAttribute("data-bg-color");
      if (bgColor) {
        (element as HTMLElement).style.backgroundColor = bgColor;
      }
    });
  }, [groupsDistribution, selectedGroup, expandedGroup]);

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

  // Handlers لفتح الـ Forms
  const handleOpenAddStudentForm = () => {
    setShowAddStudentForm(true);
  };

  const handleOpenAddTeacherForm = () => {
    setShowAddTeacherForm(true);
  };

  const handleOpenAddGroupForm = () => {
    setShowAddGroupForm(true);
  };

  // دالة للتعامل مع الضغط على الحلقة
  const handleGroupClick = (
    groupName: string,
    studentCount: number,
    percentage: number,
    color: string,
    index: number
  ) => {
    setSelectedGroup({
      name: groupName,
      count: studentCount,
      percentage,
      color,
      index,
    });
    setShowGroupDetails(true);
  };

  // دالة لإغلاق التفاصيل
  const handleCloseDetails = () => {
    setShowGroupDetails(false);
    setSelectedGroup(null);
  };

  // دوال لإدارة امتداد المعلومات
  const handleGroupHover = (
    name: string,
    count: number,
    percentage: number,
    color: string,
    index: number
  ) => {
    setExpandedGroup({ name, count, percentage, color, index });
  };

  const handleGroupLeave = () => {
    // لا نقوم بإخفاء الامتداد فوراً ليبقى ظاهراً
    // setExpandedGroup(null);
  };

  const clearExpanded = () => {
    setExpandedGroup(null);
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
            <div className="flex items-center gap-3">
              <p className="text-gray-600">نظرة شاملة على أداء المنصة</p>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}></div>
                <span
                  className={`text-sm ${
                    isConnected ? "text-green-600" : "text-red-600"
                  }`}>
                  {isConnected ? "متصل" : "غير متصل"}
                </span>
              </div>
            </div>
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
          <div
            className={`p-4 ${color} rounded-2xl shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            {icon}
          </div>

          {/* مؤشر النسبة المئوية */}
          {percentage > 0 && (
            <div className="text-right">
              <div className="w-16 h-16 relative">
                <svg
                  className="w-16 h-16 transform -rotate-90"
                  viewBox="0 0 64 64">
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
                  <span className="text-xs font-bold text-gray-700">
                    {percentage}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">
            {value.toLocaleString()}
          </p>
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
    const total = data.reduce((sum, val) => sum + val, 0);

    const defaultColors = [
      "bg-gradient-to-t from-blue-500 to-blue-600",
      "bg-gradient-to-t from-green-500 to-green-600",
      "bg-gradient-to-t from-purple-500 to-purple-600",
      "bg-gradient-to-t from-orange-500 to-orange-600",
      "bg-gradient-to-t from-pink-500 to-pink-600",
    ];

    return (
      <div className="h-full flex items-end justify-around gap-3 px-2">
        {data.map((value, i) => {
          const heightPercent = (value / max) * 100;
          const percentage = total > 0 ? (value / total) * 100 : 0;
          const color = colors[i] || defaultColors[i % defaultColors.length];

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center group relative">
              {/* النسبة المئوية عند hover */}
              <div className="mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1">
                <span className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 rounded-lg shadow-lg border border-white/20">
                  {percentage.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-2xl relative h-52 overflow-hidden shadow-inner">
                <div
                  className={`${color} rounded-2xl absolute bottom-0 w-full transition-all duration-1000 hover:opacity-90 flex items-center justify-center group-hover:shadow-xl transform group-hover:scale-[1.02]`}
                  data-height={Math.max(heightPercent, 8)}
                  data-delay={i * 200}>
                  {/* القيمة */}
                  <div className="text-center text-white">
                    <div className="font-bold text-sm bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                      {value.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* تأثير الإضاءة */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 pointer-events-none"></div>

                {/* خط المؤشر */}
                <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              </div>

              {/* التسمية */}
              <div className="mt-3 text-center">
                <p className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {labels[i]}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">
                  {value.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const PieChart: React.FC<PieChartProps> = ({
    data,
    labels,
    colors,
    onSegmentClick,
  }) => {
    const total = data.reduce((sum: number, val: number) => sum + val, 0);

    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 w-full overflow-hidden">
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
            <p className="text-sm text-gray-400">
              قم بإضافة حلقات وطلاب لرؤية الإحصائيات
            </p>
          </div>
        </div>
      );
    }

    let currentAngle = 0;

    return (
      <div className="flex flex-col items-center h-full justify-center w-full overflow-hidden px-4">
        <div className="relative w-64 h-64 md:w-72 md:h-72 mb-4 flex-shrink-0">
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
                    className="hover:opacity-80 transition-all duration-300 cursor-pointer hover:scale-105 filter hover:brightness-110 pie-chart-path"
                    stroke="white"
                    strokeWidth="3"
                    onClick={() =>
                      onSegmentClick?.(
                        labels[i],
                        value,
                        percentage,
                        colors[i] || "#94a3b8",
                        i
                      )
                    }
                    onMouseEnter={() =>
                      handleGroupHover(
                        labels[i],
                        value,
                        Math.round(percentage * 10) / 10,
                        colors[i] || "#94a3b8",
                        i
                      )
                    }
                    onMouseLeave={handleGroupLeave}
                  />

                  {/* النص داخل القطعة مع النسبة */}
                  {percentage >= 10 && (
                    <g>
                      <text
                        x={
                          60 +
                          28 *
                            Math.cos(
                              (((startAngle + currentAngle) / 2) * Math.PI) /
                                180
                            )
                        }
                        y={
                          60 +
                          28 *
                            Math.sin(
                              (((startAngle + currentAngle) / 2) * Math.PI) /
                                180
                            ) -
                          2
                        }
                        fill="white"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="transform rotate-90 pie-chart-text">
                        {Math.round(percentage * 10) / 10}%
                      </text>
                      <text
                        x={
                          60 +
                          28 *
                            Math.cos(
                              (((startAngle + currentAngle) / 2) * Math.PI) /
                                180
                            )
                        }
                        y={
                          60 +
                          28 *
                            Math.sin(
                              (((startAngle + currentAngle) / 2) * Math.PI) /
                                180
                            ) +
                          6
                        }
                        fill="white"
                        fontSize="6"
                        fontWeight="600"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="transform rotate-90 pie-chart-value-text">
                        ({value})
                      </text>
                    </g>
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

            {/* النص المركزي المحسن */}
            <text
              x="60"
              y="48"
              textAnchor="middle"
              fill="#64748b"
              fontSize="8"
              fontWeight="600"
              className="transform rotate-90">
              إجمالي الطلاب
            </text>
            <text
              x="60"
              y="62"
              textAnchor="middle"
              fill="#1e293b"
              fontSize="18"
              fontWeight="bold"
              className="transform rotate-90">
              {total.toLocaleString()}
            </text>
            <text
              x="60"
              y="74"
              textAnchor="middle"
              fill="#64748b"
              fontSize="7"
              fontWeight="500"
              className="transform rotate-90">
              في {labels.length} حلقة
            </text>
          </svg>
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
            <div className="flex items-center gap-3 text-xl">
              <p className="text-gray-600 font-medium">
                نظرة شاملة ومتطورة على أداء المنصة
              </p>
              <div
                className="flex items-center gap-1.5"
                title={
                  isConnected
                    ? `💓 Heartbeat نشط (كل 30 ثانية)\nSocket ID: ${socketId || 'N/A'}\nآخر تحديث: ${socketLastUpdate?.toLocaleTimeString('ar-SA') || 'N/A'}`
                    : `تحديث تلقائي كل 30 ثانية${
                        lastAutoRefresh
                          ? ` | آخر تحديث: ${lastAutoRefresh.toLocaleTimeString(
                              "ar-SA"
                            )}`
                          : ""
                      }`
                }>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-yellow-500"
                  } animate-pulse`}></div>
                <span
                  className={`text-sm font-medium cursor-help ${
                    isConnected ? "text-green-600" : "text-yellow-600"
                  }`}>
                  {isConnected
                    ? "💓 متصل مباشرة"
                    : `تحديث تلقائي (${autoRefreshCount})`}
                </span>
              </div>
            </div>
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

              <div className="flex items-center gap-3">
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
                
                {isConnected && (
                  <button
                    onClick={requestUpdate}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                    title="طلب تحديث فوري من الخادم">
                    <svg
                      className="w-4 h-4"
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
                    <span className="font-semibold text-sm">تحديث الآن</span>
                  </button>
                )}
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
                  "bg-gradient-to-t from-orange-500 to-orange-600",
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
                  إجمالي{" "}
                  {groupsDistribution
                    .reduce((sum, g) => sum + g.studentCount, 0)
                    .toLocaleString()}{" "}
                  طالب
                </span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                <span className="font-semibold text-green-700">
                  {groupsDistribution.length} حلقة إجمالي
                </span>
              </div>
              <div className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-200">
                <span className="font-semibold text-purple-700">
                  {groupsWithStudents.length} حلقة نشطة
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96 overflow-hidden">
              {/* الرسم البياني الدائري */}
              <div className="lg:col-span-2 overflow-hidden relative">
                {groupsDistribution.length > 0 ? (
                  <PieChart
                    data={groupDistribution.data}
                    labels={groupDistribution.labels}
                    onSegmentClick={handleGroupClick}
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
                      <p className="text-sm text-gray-400 mt-2">
                        ابدأ بإنشاء حلقات جديدة
                      </p>
                      <button
                        onClick={handleGroupsClick}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg">
                        إضافة حلقة جديدة
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* امتداد معلومات الحلقة المحددة */}
              <div className="lg:col-span-1 h-full overflow-hidden">
                {expandedGroup ? (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-2xl border border-gray-200 h-full flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">
                        تفاصيل الحلقة
                      </h4>
                      <button
                        onClick={clearExpanded}
                        title="إخفاء التفاصيل"
                        className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* اسم الحلقة مع أيقونة ملونة */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-icon"
                        data-bg-color={expandedGroup.color}>
                        📚
                      </div>
                      <div>
                        <h5 className="text-xl font-bold text-gray-900">
                          {expandedGroup.name}
                        </h5>
                        <p className="text-sm text-gray-600">
                          الحلقة رقم {expandedGroup.index + 1}
                        </p>
                      </div>
                    </div>

                    {/* إحصائيات مفصلة */}
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {/* عدد الطلاب */}
                      <div className="bg-white p-3 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            عدد الطلاب
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            {expandedGroup.count.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          من إجمالي{" "}
                          {groupsDistribution
                            .reduce((sum, g) => sum + g.studentCount, 0)
                            .toLocaleString()}{" "}
                          طالب
                        </div>
                      </div>

                      {/* النسبة المئوية */}
                      <div className="bg-white p-3 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-600">
                            النسبة المئوية
                          </span>
                          <span className="text-xl font-bold text-green-600">
                            {expandedGroup.percentage.toFixed(1)}%
                          </span>
                        </div>
                        {/* شريط تقدم */}
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 progress-bar"
                            data-width={expandedGroup.percentage}
                            data-bg-color={expandedGroup.color}></div>
                        </div>
                      </div>

                      {/* ترتيب الحلقة */}
                      <div className="bg-white p-3 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            ترتيب الحلقة
                          </span>
                          <span className="text-xl font-bold text-purple-600">
                            #{expandedGroup.index + 1}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          من أصل {groupsWithStudents.length} حلقة نشطة
                        </div>
                      </div>

                      {/* معلومات إضافية */}
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-xl border border-yellow-200">
                        <h6 className="text-sm font-bold text-gray-800 mb-2">
                          معلومات إضافية
                        </h6>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div>
                            • متوسط الطلاب:{" "}
                            {Math.round(
                              groupsDistribution.reduce(
                                (sum, g) => sum + g.studentCount,
                                0
                              ) / groupsDistribution.length
                            )}{" "}
                            طالب/حلقة
                          </div>
                          <div>
                            •{" "}
                            {expandedGroup.percentage >
                            50 / groupsDistribution.length
                              ? "أكبر من"
                              : "أصغر من"}{" "}
                            المتوسط
                          </div>
                          <div>
                            • مستوى التمثيل:{" "}
                            {expandedGroup.percentage > 20
                              ? "عالي"
                              : expandedGroup.percentage > 10
                              ? "متوسط"
                              : "منخفض"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-4 rounded-2xl border-2 border-dashed border-gray-300 h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg
                        className="w-12 h-12 mx-auto mb-3 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-base font-medium mb-1">
                        مرر فوق أي قطعة
                      </p>
                      <p className="text-sm">لعرض معلومات مفصلة عن الحلقة</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* قسم الحضور والغياب للحلقات */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-right flex items-center">
            <span className="w-3 h-10 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-full mr-4"></span>
            الحضور والغياب حسب الحلقات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupsWithStudents.slice(0, 6).map((group, idx) => {
              const attendanceRate = 75 + Math.random() * 20; // نسبة وهمية
              const presentCount = Math.round(
                (attendanceRate / 100) * group.studentCount
              );
              const absentCount = group.studentCount - presentCount;

              return (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border-2 border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {group.groupName}
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                      {attendanceRate.toFixed(0)}%
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        حاضر
                      </span>
                      <span className="font-bold text-green-600">
                        {presentCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        غائب
                      </span>
                      <span className="font-bold text-red-600">
                        {absentCount}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${attendanceRate}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          {groupsWithStudents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
              <p className="font-semibold">لا توجد حلقات لعرض بيانات الحضور</p>
            </div>
          )}
        </div>

        {/* قسم الإجراءات السريعة وأفضل الطلاب والمعلمين */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* الإجراءات السريعة */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-right flex items-center">
              <span className="w-3 h-10 bg-gradient-to-b from-purple-500 to-purple-700 rounded-full mr-4"></span>
              إجراءات سريعة
            </h3>
            <div className="space-y-4">
              <button
                onClick={handleOpenAddStudentForm}
                className="group w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg mb-0.5">إضافة طالب جديد</p>
                    <p className="text-sm text-blue-100">
                      تسجيل طالب في النظام
                    </p>
                  </div>
                </div>
                <svg
                  className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={handleOpenAddTeacherForm}
                className="group w-full flex items-center justify-between p-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg mb-0.5">إضافة معلم جديد</p>
                    <p className="text-sm text-green-100">
                      تسجيل معلم في النظام
                    </p>
                  </div>
                </div>
                <svg
                  className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={handleOpenAddGroupForm}
                className="group w-full flex items-center justify-between p-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg mb-0.5">إضافة حلقة جديدة</p>
                    <p className="text-sm text-orange-100">إنشاء حلقة تحفيظ</p>
                  </div>
                </div>
                <svg
                  className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* أفضل 5 طلاب */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-right flex items-center">
              <span className="w-3 h-10 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full mr-4"></span>
              أفضل 5 طلاب
            </h3>
            <div className="space-y-3">
              {[
                { name: "محمد أحمد", grade: 98, rank: 1 },
                { name: "فاطمة علي", grade: 96, rank: 2 },
                { name: "عمر خالد", grade: 94, rank: 3 },
                { name: "آية حسن", grade: 92, rank: 4 },
                { name: "يوسف إبراهيم", grade: 90, rank: 5 },
              ].map((student, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-300">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-white ${
                      student.rank === 1
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                        : student.rank === 2
                        ? "bg-gradient-to-br from-gray-300 to-gray-500"
                        : student.rank === 3
                        ? "bg-gradient-to-br from-orange-400 to-orange-600"
                        : "bg-gradient-to-br from-blue-400 to-blue-600"
                    }`}>
                    {student.rank === 1
                      ? "🥇"
                      : student.rank === 2
                      ? "🥈"
                      : student.rank === 3
                      ? "🥉"
                      : student.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-500">طالب متميز</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-yellow-600 text-lg">
                      {student.grade}%
                    </p>
                    <p className="text-xs text-gray-500">المعدل</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* أفضل 5 معلمين */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-right flex items-center">
              <span className="w-3 h-10 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-full mr-4"></span>
              أفضل 5 معلمين
            </h3>
            <div className="space-y-3">
              {groupsWithStudents
                .sort((a, b) => b.studentCount - a.studentCount)
                .slice(0, 5)
                .map((group, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center rounded-full">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        معلم {group.groupName}
                      </p>
                      <p className="text-xs text-gray-500">
                        حلقة {group.groupName}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-emerald-600 text-lg">
                        {group.studentCount}
                      </p>
                      <p className="text-xs text-gray-500">طالب</p>
                    </div>
                  </div>
                ))}
              {groupsWithStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">لا توجد بيانات</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* قسم آخر الإشعارات */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="w-3 h-10 bg-gradient-to-b from-red-500 to-red-700 rounded-full mr-4"></span>
              آخر الإشعارات
            </h3>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-semibold text-sm">
              عرض الكل
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                type: "success",
                icon: "✅",
                title: "تم إضافة طالب جديد",
                desc: "تم تسجيل محمد أحمد في حلقة الإخلاص",
                time: "منذ 5 دقائق",
                color: "from-green-50 to-emerald-50",
                borderColor: "border-green-200",
              },
              {
                type: "warning",
                icon: "⚠️",
                title: "تنبيه غياب",
                desc: "3 طلاب غائبين اليوم عن حلقة الهدى",
                time: "منذ 15 دقيقة",
                color: "from-yellow-50 to-amber-50",
                borderColor: "border-yellow-200",
              },
              {
                type: "info",
                icon: "📝",
                title: "امتحان قادم",
                desc: "امتحان سورة البقرة غداً الساعة 10 صباحاً",
                time: "منذ ساعة",
                color: "from-blue-50 to-cyan-50",
                borderColor: "border-blue-200",
              },
              {
                type: "success",
                icon: "🎉",
                title: "إنجاز جديد",
                desc: "فاطمة علي أتمت حفظ جزء عم بامتياز",
                time: "منذ 2 ساعة",
                color: "from-purple-50 to-pink-50",
                borderColor: "border-purple-200",
              },
              {
                type: "info",
                icon: "👤",
                title: "معلم جديد",
                desc: "تم تسجيل المعلم أحمد خالد في النظام",
                time: "منذ 3 ساعات",
                color: "from-indigo-50 to-blue-50",
                borderColor: "border-indigo-200",
              },
              {
                type: "success",
                icon: "📚",
                title: "حلقة جديدة",
                desc: "تم إنشاء حلقة التوحيد بنجاح",
                time: "منذ 4 ساعات",
                color: "from-teal-50 to-cyan-50",
                borderColor: "border-teal-200",
              },
            ].map((notification, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-4 p-4 bg-gradient-to-r ${notification.color} rounded-xl border ${notification.borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1`}>
                <div className="text-3xl">{notification.icon}</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 mb-1">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.desc}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {notification.time}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
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
                {Math.round((stats.activeStudents / stats.totalStudents) * 100)}
                %
              </div>
              <p className="text-blue-700 font-medium">معدل النشاط</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(
                  stats.totalStudents / Math.max(stats.totalTeachers, 1)
                )}
              </div>
              <p className="text-green-700 font-medium">طلاب لكل معلم</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(
                  stats.totalStudents / Math.max(stats.totalGroups, 1)
                )}
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

      {/* Modal لعرض تفاصيل الحلقة */}
      {showGroupDetails && selectedGroup && (
        <div
          className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={handleCloseDetails}>
          <div
            className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              {/* رأس Modal */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  تفاصيل الحلقة
                </h3>
                <button
                  onClick={handleCloseDetails}
                  title="إغلاق"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* أيقونة ملونة */}
              {/* أيقونة ملونة */}
              <div className="mb-6">
                <div
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl modal-group-icon"
                  data-bg-color={selectedGroup.color}>
                  📚
                </div>
              </div>

              {/* معلومات الحلقة */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedGroup.name}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedGroup.count.toLocaleString()}
                    </div>
                    <p className="text-blue-700 font-medium text-sm">
                      عدد الطلاب
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedGroup.percentage.toFixed(1)}%
                    </div>
                    <p className="text-green-700 font-medium text-sm">
                      النسبة المئوية
                    </p>
                  </div>
                </div>

                {/* إحصائيات إضافية */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">
                    التوزيع النسبي
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 modal-progress-bar"
                      data-width={selectedGroup.percentage}
                      data-bg-color={selectedGroup.color}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => navigate("/admin/groups")}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold">
                  إدارة الحلقات
                </button>
                <button
                  onClick={handleCloseDetails}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold">
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

        /* أنماط محسنة للرسم البياني الدائري */
        [data-color] {
          background-color: var(--color);
        }
        
        [data-width] {
          width: calc(var(--width) * 1%);
        }

        /* تأثيرات النص في الرسم البياني */
        .pie-chart-text {
          text-shadow: 1px 1px 3px rgba(0,0,0,0.9);
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        }
        
        .pie-chart-value-text {
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }

        .pie-chart-path {
          transform-origin: 60px 60px;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }

        [data-height] {
          height: var(--height);
          animation-delay: var(--delay);
        }

        /* أنماط Modal */
        .modal-group-icon[data-bg-color] {
          background-color: var(--bg-color);
        }

        .modal-progress-bar[data-bg-color] {
          background-color: var(--bg-color);
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        /* أنماط امتداد المعلومات */
        .group-icon[data-bg-color] {
          background-color: var(--bg-color);
        }

        .progress-bar[data-bg-color] {
          background-color: var(--bg-color);
        }
      `}</style>

      {/* Forms Modals */}
      {showAddStudentForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AddStudentForm
              onClose={() => setShowAddStudentForm(false)}
              onSuccess={() => {
                setShowAddStudentForm(false);
                fetchStats(true);
              }}
            />
          </div>
        </div>
      )}

      {showAddTeacherForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AddTeacherForm
              onClose={() => setShowAddTeacherForm(false)}
              onSuccess={() => {
                setShowAddTeacherForm(false);
                fetchStats(true);
              }}
            />
          </div>
        </div>
      )}

      {showAddGroupForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AddGroupForm
              onClose={() => setShowAddGroupForm(false)}
              onSuccess={() => {
                setShowAddGroupForm(false);
                fetchStats(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
