import { useState, useCallback } from 'react';
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUsers,
  FaChartLine,
  FaUserTie,
  FaClipboardList,
} from 'react-icons/fa';
import {
  StatCardSkeleton,
  ChartSkeleton,
  ListSkeleton,
} from '@/components/skeletons';
import {
  StatCard,
  DonutChart,
  PieChart,
  QuickActions,
  AttendanceSection,
  TopListsSection,
} from './components';
import { useDashboardData } from './hooks';
import AddStudentForm from '../StudentsManagement/Model/StudentForm';
import TeacherForm from '../TeachersManagement/Model/TeacherForm';
import AddGroupForm from '../GroupManagement/Model/GroupForm';
import { AssistantForm } from '../TeacherAssistantManagement/Model/AssistantForm';
import { SecretaryForm } from '../SecretaryManagement/Model/SecretaryForm';
import { createSecretary } from '@/Api/secretaryApi';

const AdminDashboard = () => {

  // استخدام hook لجلب البيانات - البيانات معالجة جاهزة
  const {
    stats,
    isLoadingStats,
    isLoadingCharts,
    isLoadingTopStudents,
    isLoadingTopTeachers,
    error,
    fetchStats,
    groupDistribution,
    genderDistribution,
    topStudents,
    topTeachers,
  } = useDashboardData();

  // State لإدارة الـ Modals
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [showAddAssistantForm, setShowAddAssistantForm] = useState(false);
  const [showAddSecretaryForm, setShowAddSecretaryForm] = useState(false);
  const [isSecretaryLoading, setIsSecretaryLoading] = useState(false);

  // Handler لإضافة سكرتير
  const handleCreateSecretary = useCallback(async (data: Parameters<typeof createSecretary>[0]) => {
    setIsSecretaryLoading(true);
    try {
      const response = await createSecretary(data);
      if (response.success) {
        setShowAddSecretaryForm(false);
        fetchStats(true);
      } else {
        throw new Error(response.message || 'فشل في إضافة السكرتير');
      }
    } finally {
      setIsSecretaryLoading(false);
    }
  }, [fetchStats]);


  // Loading state - استخدام Skeleton بدلاً من Spinner

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg max-w-md">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
              className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20"
      dir="rtl"
    >
      <div className="max-w-[98%] mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
              <FaChartLine className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                📊 لوحة الإحصائيات
              </h1>
              <p className="text-white/70 text-sm mt-1">
                نظرة شاملة على أداء المنصة
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards - تظهر فقط إذا كان هناك بيانات أو أثناء التحميل */}
        {(isLoadingStats || stats.totalStudents > 0 || stats.totalTeachers > 0 || stats.totalAssistants > 0 || stats.totalSecretaries > 0 || stats.totalGroups > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
            {isLoadingStats ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  icon={<FaGraduationCap className="text-3xl text-white" />}
                  title="إجمالي الطلاب"
                  value={stats.totalStudents}
                  color="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700"
                  bgColor="bg-white"
                />

                <StatCard
                  icon={<FaChalkboardTeacher className="text-3xl text-white" />}
                  title="إجمالي المعلمين"
                  value={stats.totalTeachers}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  bgColor="bg-white"
                />

                <StatCard
                  icon={<FaUserTie className="text-3xl text-white" />}
                  title="المساعدين"
                  value={stats.totalAssistants}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  bgColor="bg-white"
                />

                <StatCard
                  icon={<FaClipboardList className="text-3xl text-white" />}
                  title="السكرتيرات"
                  value={stats.totalSecretaries}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  bgColor="bg-white"
                />

                <StatCard
                  icon={<FaUsers className="text-3xl text-white" />}
                  title="عدد الحلقات"
                  value={stats.totalGroups}
                  color="bg-gradient-to-br from-green-600 to-emerald-600"
                  bgColor="bg-white"
                />
              </>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
            إجراءات سريعة
          </h2>
          <QuickActions
            onAddStudent={() => setShowAddStudentForm(true)}
            onAddTeacher={() => setShowAddTeacherForm(true)}
            onAddGroup={() => setShowAddGroupForm(true)}
            onAddAssistant={() => setShowAddAssistantForm(true)}
            onAddSecretary={() => setShowAddSecretaryForm(true)}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
          {/* Donut Chart - توزيع الطلاب حسب الحلقات */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <FaChartLine className="text-white text-base sm:text-lg" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    توزيع الطلاب حسب الحلقات
                  </h3>
                  {groupDistribution.data.length > 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                      {groupDistribution.labels.length} حلقة
                    </p>
                  )}
                </div>
              </div>
              {groupDistribution.data.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl self-start sm:self-auto">
                  <span className="text-xs sm:text-sm font-bold text-green-700">
                    {groupDistribution.data
                      .reduce((a, b) => a + b, 0)
                      .toLocaleString()}{' '}
                    طالب
                  </span>
                </div>
              )}
            </div>
            <div className="min-h-[400px] sm:min-h-[500px] lg:min-h-[450px] flex items-center justify-center">
              {isLoadingCharts ? (
                <ChartSkeleton type="donut" />
              ) : groupDistribution.data.length > 0 &&
                groupDistribution.data.reduce((a, b) => a + b, 0) > 0 ? (
                <DonutChart
                  data={groupDistribution.data}
                  labels={groupDistribution.labels}
                  colors={groupDistribution.colors}
                />
              ) : (
                <div className="flex items-center justify-center w-full text-gray-400 py-8">
                  <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-green-50 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 flex items-center justify-center">
                      <FaChartLine className="text-4xl sm:text-5xl text-green-300" />
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-600 mb-2">
                      لا توجد حلقات بها طلاب
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4">
                      لعرض التوزيع، يجب ربط الطلاب بالحلقات
                    </p>
                    <button
                      onClick={() => setShowAddGroupForm(true)}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      إضافة حلقة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pie Chart - توزيع الطلاب حسب الجنس */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaUsers className="text-green-600 text-base sm:text-lg" />
                توزيع الطلاب حسب الجنس
              </h3>
              {genderDistribution.data.length > 0 &&
                genderDistribution.data.reduce((a, b) => a + b, 0) > 0 && (
                  <div className="bg-green-50 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                    <span className="text-xs sm:text-sm font-bold text-green-600">
                      {genderDistribution.data.reduce((a, b) => a + b, 0)} طالب
                    </span>
                  </div>
                )}
            </div>
            <div className="min-h-[400px] sm:min-h-[500px] lg:min-h-[450px] flex items-center justify-center">
              {isLoadingCharts ? (
                <ChartSkeleton type="pie" />
              ) : genderDistribution.data.length > 0 &&
                genderDistribution.data.reduce((a, b) => a + b, 0) > 0 ? (
                <PieChart
                  data={genderDistribution.data}
                  labels={genderDistribution.labels}
                  colors={genderDistribution.colors}
                />
              ) : (
                <div className="flex items-center justify-center w-full text-gray-400 py-8">
                  <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-green-50 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 flex items-center justify-center">
                      <FaUsers className="text-4xl sm:text-5xl text-green-300" />
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-600 mb-2">
                      لا توجد بيانات
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4">
                      قم بإضافة طلاب لعرض توزيع الجنس
                    </p>
                    <button
                      onClick={() => setShowAddStudentForm(true)}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      إضافة طالب
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Section - Absent Students Today */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <AttendanceSection />
        </div>

        {/* Top Lists Section */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          {(isLoadingCharts || isLoadingTopStudents || isLoadingTopTeachers) ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-100 shadow-sm">
                <div className="animate-pulse mb-4 sm:mb-6">
                  <div className="h-6 bg-gray-300 rounded w-32"></div>
                </div>
                <ListSkeleton count={5} showAvatar={true} />
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-100 shadow-sm">
                <div className="animate-pulse mb-4 sm:mb-6">
                  <div className="h-6 bg-gray-300 rounded w-32"></div>
                </div>
                <ListSkeleton count={5} showAvatar={true} />
              </div>
            </div>
          ) : (
            <TopListsSection
              topStudents={topStudents}
              topTeachers={topTeachers}
            />
          )}
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
          <TeacherForm
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

        {showAddAssistantForm && (
          <AssistantForm
            isOpen={showAddAssistantForm}
            onClose={() => setShowAddAssistantForm(false)}
            onSubmit={async () => {
              setShowAddAssistantForm(false);
              fetchStats(true); // إعادة تحميل البيانات بعد إضافة مساعد
            }}
            isLoading={false}
          />
        )}

        {showAddSecretaryForm && (
          <SecretaryForm
            isOpen={showAddSecretaryForm}
            onClose={() => setShowAddSecretaryForm(false)}
            onSubmit={handleCreateSecretary}
            isLoading={isSecretaryLoading}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
