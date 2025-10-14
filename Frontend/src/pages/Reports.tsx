import { useState, useEffect, useCallback } from "react";
import MarksBarChart from "../components/MarksBarChart";
import { ReportsSkeleton } from "../components/Loading/LoadingSkeleton";
import { getStudentMarks, getAverageMarks } from "../Api/reportApi";
import { getProfile } from "../Api/profileApi";

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("teacher");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{
    labels: string[];
    data: number[];
  }>({ labels: [], data: [] });
  const [userId, setUserId] = useState<string>("");

  // Load chart data based on filters
  const loadChartData = useCallback(
    async (role?: string, id?: string) => {
      try {
        const currentRole = role || userRole;
        const currentUserId = id || userId;

        const params = {
          month: selectedMonth || undefined,
          year: selectedYear || undefined,
          ...(currentRole === "student" && { studentId: currentUserId }),
        };

        const data =
          currentRole === "student"
            ? await getStudentMarks(params)
            : await getAverageMarks(params);

        setChartData(data);
      } catch (error) {
        console.error("خطأ في تحميل بيانات الرسم البياني:", error);
      }
    },
    [selectedMonth, selectedYear, userRole, userId]
  );

  // Initialize component and load user data
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        setUserRole(profile.role || "teacher");
        setUserId(profile._id || "");
        await loadChartData(profile.role, profile._id);
      } catch (error) {
        console.error("خطأ في تحميل بيانات المستخدم:", error);
        setUserRole("teacher");
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [loadChartData]);

  // Reload data when filters change
  useEffect(() => {
    if (!loading && userId) {
      loadChartData();
    }
  }, [selectedMonth, selectedYear, userRole, userId, loading, loadChartData]);

  if (loading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-center">الحلقات</h1>
      <div className="bg-white rounded-xl shadow-md p-4 mb-8 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
          فلترة حسب الشهر والسنة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              اختر الشهر (اختياري):
            </label>
            <select
              value={selectedMonth ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMonth(val ? Number(val) : null);
              }}
              title="اختر الشهر"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">آخر 6 أشهر</option>
              <option value={1}>يناير (1)</option>
              <option value={2}>فبراير (2)</option>
              <option value={3}>مارس (3)</option>
              <option value={4}>أبريل (4)</option>
              <option value={5}>مايو (5)</option>
              <option value={6}>يونيو (6)</option>
              <option value={7}>يوليو (7)</option>
              <option value={8}>أغسطس (8)</option>
              <option value={9}>سبتمبر (9)</option>
              <option value={10}>أكتوبر (10)</option>
              <option value={11}>نوفمبر (11)</option>
              <option value={12}>ديسمبر (12)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              اختر السنة (اختياري):
            </label>
            <select
              value={selectedYear ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(val ? Number(val) : null);
              }}
              title="اختر السنة"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">آخر 6 أشهر</option>
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>
      </div>
      {/* يمكنك هنا عرض النتائج حسب الفلترة */}
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mt-8">
        {userRole === "student" ? (
          <>
            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
              📊 معدلاتي الشهرية
            </h2>
            {chartData.labels.length > 0 ? (
              <>
                <MarksBarChart
                  labels={chartData.labels}
                  data={chartData.data}
                />
                <div className="text-center mt-6 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                  {selectedMonth && selectedYear
                    ? `📅 يتم عرض معدلك للشهر ${selectedMonth}/${selectedYear}`
                    : `📅 يتم عرض معدلاتك لآخر 6 أشهر`}
                </div>
              </>
            ) : (
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-lg font-medium">لا توجد بيانات لعرضها</p>
                <p className="text-sm mt-2">لم يتم تسجيل أي معدلات شهرية بعد</p>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
              📈 متوسط معدلات الحلقة
            </h2>
            {chartData.labels.length > 0 ? (
              <>
                <MarksBarChart
                  labels={chartData.labels}
                  data={chartData.data}
                />
                <div className="text-center mt-6 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                  {selectedMonth && selectedYear
                    ? `📅 يتم عرض متوسط معدلات جميع الطلاب للشهر ${selectedMonth}/${selectedYear}`
                    : `📅 يتم عرض متوسط معدلات جميع الطلاب لآخر 6 أشهر`}
                </div>
              </>
            ) : (
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-lg font-medium">لا توجد بيانات لعرضها</p>
                <p className="text-sm mt-2">
                  لم يتم تسجيل أي معدلات شهرية للطلاب بعد
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
