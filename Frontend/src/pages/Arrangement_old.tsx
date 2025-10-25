import { useEffect, useState, useCallback, useMemo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  getRankingByAverages,
  type StudentWithAverage,
} from "../Api/rankingApi";
import { useArrangementSocket } from "../Socket";

// Interface for Group
interface Group {
  id: string;
  name: string;
  number: number;
}

// Interface for User
interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  role: string;
  group?: string; // For students
  groups?: Group[]; // For teachers
}

const Arrangement = () => {
  // استخدام نظام Socket الجديد مع Heartbeat تلقائي كل 30 ثانية
  const {
    isConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useArrangementSocket();

  // State for user role
  const [, setCurrentUser] = useState<User | null>(null);
  const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState<boolean>(false);

  // State for students with averages
  const [studentsWithAverages, setStudentsWithAverages] = useState<
    StudentWithAverage[]
  >([]);

  // State for selected group (for teachers)
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // State for year and month selectors
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // State for loading
  const [loading, setLoading] = useState<boolean>(true);

  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // Memoized user authentication check
  const userAuth = useMemo(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return { user: null, isTeacherOrAdmin: false };

    try {
      const userData = JSON.parse(userJson) as User;
      return {
        user: userData,
        isTeacherOrAdmin:
          userData.role === "teacher" || userData.role === "admin",
      };
    } catch (err) {
      console.error("Error parsing user data:", err);
      return { user: null, isTeacherOrAdmin: false };
    }
  }, []);

  // Update state based on authentication
  useEffect(() => {
    setCurrentUser(userAuth.user);
    setIsTeacherOrAdmin(userAuth.isTeacherOrAdmin);

    // Set selected group based on user role
    if (userAuth.user?.role === "student") {
      // For students, set their group
      setSelectedGroup(userAuth.user.group || "");
    } else if (
      userAuth.user?.role === "teacher" &&
      userAuth.user.groups &&
      userAuth.user.groups.length > 0
    ) {
      // For teachers, set the first group as default
      setSelectedGroup(userAuth.user.groups[0].name);
    }
    // Admin doesn't need selectedGroup initially
  }, [userAuth]);

  // Initialize available years
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    setAvailableYears(years);
  }, []);

  // Fetch ranking data
  const fetchRankingData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentGroup = selectedGroup || userAuth.user?.group || "";

      const response = await getRankingByAverages(
        selectedMonth,
        selectedYear,
        currentGroup
      );

      if (response.success) {
        setStudentsWithAverages(response.data);
      } else {
        setStudentsWithAverages([]);
      }
    } catch (error) {
      console.error("Error fetching ranking data:", error);
      setError("حدث خطأ أثناء جلب البيانات");
      setStudentsWithAverages([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedGroup, userAuth.user]);

  // Fetch data when dependencies change
  useEffect(() => {
    if (selectedGroup || userAuth.user?.role === "admin") {
      fetchRankingData();
    }
  }, [fetchRankingData, selectedGroup, userAuth.user]);

  // Socket: إعادة جلب البيانات عند استقبال تحديث
  useEffect(() => {
    if (socketLastUpdate) {
      console.log("📡 Socket update received, refreshing rankings...");
      fetchRankingData();
    }
  }, [socketLastUpdate, fetchRankingData]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });
  }, []);

  // Function to handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
  };

  // Function to handle month change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
  };

  // Function to handle group change (for teachers)
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupName = e.target.value;
    setSelectedGroup(groupName);
  };

  // Helper function to get student full name
  const getFullName = (student: StudentWithAverage) => {
    const firstName = student.firstName || "";
    const fatherName = student.fatherName || "";
    const lastName = student.lastName || "";
    return `${firstName} ${fatherName} ${lastName}`.trim() || "-";
  };

  // Convert month number to Arabic name
  const getMonthName = (month: number) => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "إبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    return months[month - 1] || "";
  };

  // Get top three students
  const topThreeStudents = studentsWithAverages.slice(0, 3);

  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
    if (rank === 1) return "#FFD700"; // Gold
    if (rank === 2) return "#C0C0C0"; // Silver
    if (rank === 3) return "#CD7F32"; // Bronze
    return "#E5E7EB"; // Gray
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        <div className="text-center mb-16" data-aos="fade-down">
          {/* Socket Connection Indicator - للمطورين فقط */}
          {import.meta.env.DEV && (
            <div className="flex justify-center mb-4">
              <div 
                className="flex items-center gap-1.5 cursor-help bg-white px-4 py-2 rounded-full shadow-sm"
                title={
                  isConnected
                    ? `💓 Heartbeat نشط (كل 30 ثانية)\nSocket ID: ${socketId || 'N/A'}\nآخر تحديث: ${socketLastUpdate?.toLocaleTimeString('ar-SA') || 'لا يوجد'}`
                    : 'Socket غير متصل - وضع التحديث التلقائي'
                }>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-yellow-500'
                } animate-pulse`}></div>
                <span className={`text-xs font-medium ${
                  isConnected ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {isConnected ? '💓 تحديث مباشر' : 'تحديث تلقائي'}
                </span>
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            ترتيب الطلاب المتميزين
          </h1>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            يعرض هذا الترتيب الطلاب بناءً على معدلاتهم الشهرية في الحفظ
            والمراجعة
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
            {/* Year selector */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                السنة
              </label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="w-32 px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 font-semibold text-center">
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month selector */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                الشهر
              </label>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-40 px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 font-semibold text-center">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>

            {/* Group selector for teachers with multiple groups */}
            {userAuth.user?.role === "teacher" &&
              userAuth.user.groups &&
              userAuth.user.groups.length > 1 && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    الحلقة
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={handleGroupChange}
                    className="w-48 px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 font-semibold text-center">
                    {userAuth.user.groups.map((group) => (
                      <option key={group.id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            {/* Display group name for teachers with single group or students */}
            {((userAuth.user?.role === "teacher" &&
              userAuth.user.groups &&
              userAuth.user.groups.length === 1) ||
              userAuth.user?.role === "student") && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  الحلقة
                </label>
                <div className="w-48 px-4 py-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl shadow-md font-bold text-emerald-800 text-center">
                  {userAuth.user.role === "student"
                    ? userAuth.user.group
                    : userAuth.user.groups?.[0]?.name}
                </div>
              </div>
            )}
          </div>
          <br />

          {/* Show current month/year title */}
          <div className="mt-8 mb-22">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl shadow-lg inline-block">
              <h2 className="text-2xl font-bold text-center">
                🏆 ترتيب {getMonthName(selectedMonth)} {selectedYear}
              </h2>
              <p className="text-center text-emerald-100 mt-1">
                {studentsWithAverages.length} طالب في الحلقة
              </p>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && <div className="text-center py-8">جاري التحميل...</div>}

        {/* Error message */}
        {!loading && error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8"
            role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Main content when data is loaded */}
        {!loading && !error && (
          <>
            {/* Show message if no students */}
            {studentsWithAverages.length === 0 ? (
              <div className="text-center py-16" data-aos="fade-up">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                  <svg
                    className="w-20 h-20 mx-auto mb-4 text-gray-300"
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
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    لا يوجد طلاب بمعدلات
                  </h3>
                  <p className="text-gray-500 mb-6">
                    لم يتم تسجيل معدلات للطلاب في {getMonthName(selectedMonth)}{" "}
                    {selectedYear}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Olympic-style podium for top 3 */}
                {topThreeStudents.length >= 3 && (
                  <div className="mb-20 relative" data-aos="fade-up">
                    <div className="flex justify-center items-end h-96 mb-8">
                      {/* Second place - left */}
                      {topThreeStudents[1] && (
                        <div
                          className="w-1/4 flex flex-col items-center mx-2"
                          data-aos="fade-up"
                          data-aos-delay="200">
                          <div className="relative">
                            <div
                              className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#e9f5f2] border-4 mb-4 flex items-center justify-center"
                              style={{ borderColor: getMedalColor(2) }}>
                              <div className="text-[#1f6357] font-bold text-4xl">
                                2
                              </div>
                            </div>
                            <div
                              className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                              style={{ backgroundColor: getMedalColor(2) }}>
                              2
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className="font-bold text-lg">
                              {getFullName(topThreeStudents[1])}
                            </h3>
                            <p className="text-emerald-700 font-semibold">
                              {topThreeStudents[1].overallAverage.toFixed(1)}%
                            </p>
                          </div>
                          <div
                            className="w-full h-40 rounded-t-lg mt-4 flex items-center justify-center"
                            style={{ backgroundColor: getMedalColor(2) }}>
                            <span className="text-3xl font-bold text-white">
                              2
                            </span>
                          </div>
                        </div>
                      )}

                      {/* First place - center */}
                      {topThreeStudents[0] && (
                        <div
                          className="w-1/3 flex flex-col items-center mx-2 -mt-10"
                          data-aos="fade-up"
                          data-aos-delay="100">
                          <div className="relative">
                            <div
                              className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#e9f5f2] border-4 mb-4 flex items-center justify-center"
                              style={{ borderColor: getMedalColor(1) }}>
                              <div className="text-[#1f6357] font-bold text-5xl">
                                1
                              </div>
                            </div>
                            <div
                              className="absolute -top-5 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xl"
                              style={{ backgroundColor: getMedalColor(1) }}>
                              1
                            </div>
                            <div className="absolute top-0 left-0 right-0 -mt-8 flex justify-center">
                              <svg
                                className="w-10 h-10"
                                style={{ color: getMedalColor(1) }}
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className="font-bold text-xl">
                              {getFullName(topThreeStudents[0])}
                            </h3>
                            <p className="text-emerald-700 font-bold text-lg">
                              {topThreeStudents[0].overallAverage.toFixed(1)}%
                            </p>
                          </div>
                          <div
                            className="w-full h-52 rounded-t-lg mt-4 flex items-center justify-center"
                            style={{ backgroundColor: getMedalColor(1) }}>
                            <span className="text-4xl font-bold text-white">
                              1
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Third place - right */}
                      {topThreeStudents[2] && (
                        <div
                          className="w-1/4 flex flex-col items-center mx-2"
                          data-aos="fade-up"
                          data-aos-delay="300">
                          <div className="relative">
                            <div
                              className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#e9f5f2] border-4 mb-4 flex items-center justify-center"
                              style={{ borderColor: getMedalColor(3) }}>
                              <div className="text-[#1f6357] font-bold text-4xl">
                                3
                              </div>
                            </div>
                            <div
                              className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                              style={{ backgroundColor: getMedalColor(3) }}>
                              3
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className="font-bold text-lg">
                              {getFullName(topThreeStudents[2])}
                            </h3>
                            <p className="text-emerald-700 font-semibold">
                              {topThreeStudents[2].overallAverage.toFixed(1)}%
                            </p>
                          </div>
                          <div
                            className="w-full h-32 rounded-t-lg mt-4 flex items-center justify-center"
                            style={{ backgroundColor: getMedalColor(3) }}>
                            <span className="text-3xl font-bold text-white">
                              3
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="h-6 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg shadow-lg"></div>
                  </div>
                )}

                {/* All students table */}
                <div
                  className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
                  data-aos="fade-up"
                  data-aos-delay="400">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6">
                    <h2 className="text-xl font-bold text-white">
                      ترتيب جميع الطلاب
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr className="text-right">
                          <th className="py-3 px-6 text-sm font-medium text-gray-600">
                            الترتيب
                          </th>
                          <th className="py-3 px-6 text-sm font-medium text-gray-600">
                            الطالب
                          </th>
                          <th className="py-3 px-6 text-sm font-medium text-gray-600">
                            المعدل الكلي
                          </th>
                          <th className="py-3 px-6 text-sm font-medium text-gray-600">
                            معدل الحفظ
                          </th>
                          <th className="py-3 px-6 text-sm font-medium text-gray-600">
                            معدل المراجعة
                          </th>
                          <th className="py-3 px-6 text-sm font-medium text-gray-600">
                            عدد العلامات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {studentsWithAverages.map((student, index) => (
                          <tr
                            key={student._id}
                            className={`hover:bg-gray-50 ${
                              index < 3 ? "bg-emerald-50/50" : ""
                            }`}>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <span
                                  className="font-bold flex items-center justify-center w-8 h-8 rounded-full text-white mr-2"
                                  style={{
                                    backgroundColor: getMedalColor(
                                      student.rank
                                    ),
                                  }}>
                                  {student.rank}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-[#e9f5f2] flex items-center justify-center mr-3">
                                  <span className="text-[#1f6357] font-bold">
                                    {student.rank}
                                  </span>
                                </div>
                                <span className="font-medium">
                                  {getFullName(student)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`font-bold ${
                                  index < 3
                                    ? "text-emerald-700"
                                    : "text-gray-700"
                                }`}>
                                {student.overallAverage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-700">
                              {student.memorizationAverage.toFixed(1)}%
                            </td>
                            <td className="py-4 px-6 text-gray-700">
                              {student.reviewAverage.toFixed(1)}%
                            </td>
                            <td className="py-4 px-6 text-gray-700">
                              {student.totalMarks}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Criteria Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          data-aos="fade-up"
          data-aos-delay="500">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2">الحفظ</h3>
            <p className="text-gray-600 text-center">
              يتم تقييم الطلاب بناءً على معدل الحفظ الشهري المسجل في النظام
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2">المراجعة</h3>
            <p className="text-gray-600 text-center">
              يتم التقييم بناءً على معدل المراجعة الشهري وأداء الطالب في
              المراجعات
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2">
              المعدل الإجمالي
            </h3>
            <p className="text-gray-600 text-center">
              المعدل النهائي يحسب من مجموع معدلات الحفظ والمراجعة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Arrangement;
