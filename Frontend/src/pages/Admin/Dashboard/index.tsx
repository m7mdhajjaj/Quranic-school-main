import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUsers,
  FaClipboardCheck,
  FaChartLine,
} from "react-icons/fa";
import { LoadingSpinner } from "@/components/UI";
import {
  StatCard,
  BarChart,
  PieChart,
  QuickActions,
  AttendanceSection,
  TopListsSection,
  NotificationsSection,
  type Notification,
} from "./components";
import { useDashboardData } from "./hooks";
import type { ChartData } from "./types";
import AddStudentForm from "../../../Forms/AddStudentForm";
import AddTeacherForm from "../../../Forms/AddTeacherForm";
import AddGroupForm from "../../../Forms/AddGroupForm";
import { useDashboardSocket } from "@/Socket";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Socket للتحديثات الفورية
  const { lastUpdate: socketLastUpdate } = useDashboardSocket();

  // استخدام hook لجلب البيانات
  const { stats, isLoading, error, fetchStats, chartsData } =
    useDashboardData();

  // State لإدارة الـ Modals
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);

  // Navigation handlers
  const handleTeachersClick = () => navigate("/admin/teachers");
  const handleStudentsClick = () => navigate("/admin/students");
  const handleGroupsClick = () => navigate("/admin/groups");
  const handleExamsClick = () => navigate("/admin/exams");

  // تحويل بيانات الحلقات للرسم البياني من API
  const groupDistribution: ChartData = chartsData?.groupDistribution
    ? {
        labels: chartsData.groupDistribution.map((g) => g._id || "غير محدد"),
        data: chartsData.groupDistribution.map((g) => g.count),
      }
    : { labels: [], data: [] };

  // بيانات الجنس من API
  const genderDistribution = chartsData?.genderDistribution
    ? {
        labels: chartsData.genderDistribution.map((g) =>
          g._id === "male" ? "ذكور" : "إناث"
        ),
        data: chartsData.genderDistribution.map((g) => g.count),
        colors: ["from-blue-500 to-blue-600", "from-pink-500 to-pink-600"],
      }
    : {
        labels: ["ذكور", "إناث"],
        data: [0, 0],
        colors: ["from-blue-500 to-blue-600", "from-pink-500 to-pink-600"],
      };

  // Socket: Refresh data when socket updates
  useEffect(() => {
    if (socketLastUpdate) {
      console.log("🔄 Socket update detected, refreshing dashboard...");
      fetchStats();
    }
  }, [socketLastUpdate, fetchStats]);

  // Debug: عرض البيانات في console
  useEffect(() => {
    console.log("🔍 Dashboard Debug:");
    console.log("chartsData:", chartsData);
    console.log("groupDistribution:", groupDistribution);
    console.log("genderDistribution:", genderDistribution);
  }, [chartsData, groupDistribution, genderDistribution]);

  // إشعارات وهمية
  const notifications: Notification[] = [
    {
      id: "1",
      type: "info",
      title: "طالب جديد",
      message: "تم تسجيل طالب جديد في الحلقة الأولى",
      time: "منذ 5 دقائق",
    },
    {
      id: "2",
      type: "warning",
      title: "غياب متكرر",
      message: "الطالب أحمد محمد لديه 3 غيابات هذا الأسبوع",
      time: "منذ ساعة",
    },
  ];

  // بيانات أفضل الطلاب والمعلمين من API
  const topStudents =
    chartsData?.topStudents && chartsData.topStudents.length > 0
      ? chartsData.topStudents
      : [{ name: "لا يوجد بيانات", value: 0 }];

  const topTeachers =
    chartsData?.topTeachers && chartsData.topTeachers.length > 0
      ? chartsData.topTeachers
      : [{ name: "لا يوجد بيانات", value: 0 }];

  // بيانات الحضور الشهري من API
  const attendanceData = chartsData?.monthlyAttendance
    ? {
        present: chartsData.monthlyAttendance.present || 0,
        absent: chartsData.monthlyAttendance.absent || 0,
        late: chartsData.monthlyAttendance.late || 0,
      }
    : {
        present: 0,
        absent: 0,
        late: 0,
      };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 flex items-center justify-center">
        <LoadingSpinner 
          size="xl" 
          color="blue" 
          text="جاري تحميل الإحصائيات..." 
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg max-w-md">
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
            <p className="text-lg font-medium mb-4">{error}</p>
            <button
              onClick={() => fetchStats(true)}
              className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      dir="rtl">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
            لوحة الإحصائيات
          </h1>
          <p className="text-gray-600 text-xl font-medium">
            نظرة شاملة ومتطورة على أداء المنصة
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-12">
          <StatCard
            icon={<FaGraduationCap className="text-3xl" />}
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
            icon={<FaChalkboardTeacher className="text-3xl" />}
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
            icon={<FaClipboardCheck className="text-3xl" />}
            title="معدل الدرجات"
            value={stats.averageExamMarks}
            color="bg-gradient-to-br from-purple-500 to-purple-700"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            trend="+5% تحسن"
            percentage={stats.averageExamMarks}
          />

          <StatCard
            icon={<FaClipboardCheck className="text-3xl" />}
            title="عدد الامتحانات"
            value={stats.totalExams}
            color="bg-gradient-to-br from-orange-500 to-orange-700"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
            percentage={68}
            onClick={handleExamsClick}
          />

          <StatCard
            icon={<FaUsers className="text-3xl" />}
            title="عدد الحلقات"
            value={stats.totalGroups}
            color="bg-gradient-to-br from-pink-500 to-pink-700"
            bgColor="bg-pink-50"
            borderColor="border-pink-200"
            percentage={75}
            onClick={handleGroupsClick}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            إجراءات سريعة
          </h2>
          <QuickActions
            onAddStudent={() => setShowAddStudentForm(true)}
            onAddTeacher={() => setShowAddTeacherForm(true)}
            onAddGroup={() => setShowAddGroupForm(true)}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Bar Chart - توزيع الطلاب حسب الحلقات */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaChartLine className="text-blue-600" />
                توزيع الطلاب حسب الحلقات
              </h3>
              {groupDistribution.data.length > 0 && (
                <div className="bg-blue-50 px-3 py-1 rounded-lg">
                  <span className="text-sm font-bold text-blue-600">
                    {groupDistribution.data.reduce((a, b) => a + b, 0)} طالب
                  </span>
                </div>
              )}
            </div>
            <div className="h-80">
              {groupDistribution.data.length > 0 &&
              groupDistribution.data.reduce((a, b) => a + b, 0) > 0 ? (
                <BarChart
                  data={groupDistribution.data}
                  labels={groupDistribution.labels}
                  maxValue={Math.max(...groupDistribution.data, 20)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center max-w-md mx-auto">
                    <div className="bg-blue-50 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <FaChartLine className="text-5xl text-blue-300" />
                    </div>
                    <p className="text-lg font-bold text-gray-600 mb-2">
                      لا توجد حلقات بها طلاب
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      لعرض التوزيع، يجب ربط الطلاب بالحلقات
                    </p>
                    <button
                      onClick={handleGroupsClick}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      إدارة الحلقات
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pie Chart - توزيع الطلاب حسب الجنس */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaUsers className="text-purple-600" />
                توزيع الطلاب حسب الجنس
              </h3>
              {genderDistribution.data.length > 0 &&
                genderDistribution.data.reduce((a, b) => a + b, 0) > 0 && (
                  <div className="bg-purple-50 px-3 py-1 rounded-lg">
                    <span className="text-sm font-bold text-purple-600">
                      {genderDistribution.data.reduce((a, b) => a + b, 0)} طالب
                    </span>
                  </div>
                )}
            </div>
            <div className="h-80">
              {genderDistribution.data.length > 0 &&
              genderDistribution.data.reduce((a, b) => a + b, 0) > 0 ? (
                <PieChart
                  data={genderDistribution.data}
                  labels={genderDistribution.labels}
                  colors={genderDistribution.colors}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center max-w-md mx-auto">
                    <div className="bg-purple-50 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <FaUsers className="text-5xl text-purple-300" />
                    </div>
                    <p className="text-lg font-bold text-gray-600 mb-2">
                      لا توجد بيانات
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      قم بإضافة طلاب لعرض توزيع الجنس
                    </p>
                    <button
                      onClick={() => setShowAddStudentForm(true)}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      إضافة طالب
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Section */}
        <div className="mb-12">
          <AttendanceSection data={attendanceData} />
        </div>

        {/* Top Lists Section */}
        <div className="mb-12">
          <TopListsSection
            topStudents={topStudents}
            topTeachers={topTeachers}
          />
        </div>

        {/* Notifications Section */}
        <div className="mb-12">
          <NotificationsSection
            notifications={notifications}
            onMarkAsRead={(id) => console.log("Mark as read:", id)}
          />
        </div>

        {/* Forms Modals */}
        {showAddStudentForm && (
          <AddStudentForm
            onClose={() => setShowAddStudentForm(false)}
            onSuccess={() => {
              setShowAddStudentForm(false);
              fetchStats(true); // إعادة تحميل البيانات بعد إضافة طالب
            }}
          />
        )}

        {showAddTeacherForm && (
          <AddTeacherForm
            onClose={() => setShowAddTeacherForm(false)}
            onSuccess={() => {
              setShowAddTeacherForm(false);
              fetchStats(true); // إعادة تحميل البيانات بعد إضافة معلم
            }}
          />
        )}

        {showAddGroupForm && (
          <AddGroupForm
            onClose={() => setShowAddGroupForm(false)}
            onSuccess={() => {
              setShowAddGroupForm(false);
              fetchStats(true); // إعادة تحميل البيانات بعد إضافة حلقة
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
