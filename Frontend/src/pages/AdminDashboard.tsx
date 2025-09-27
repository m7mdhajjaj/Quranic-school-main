import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalExams: 0,
    totalGroups: 0,
    averageMarks: 0,
    activeStudents: 0,
    attendanceRate: 0,
    upcomingExams: 0,
    newStudentsThisMonth: 0,
    totalActivities: 0,
  });

  // Additional chart data
  const [groupDistribution, setGroupDistribution] = useState({
    labels: [
      "حلقة الأطفال",
      "حلقة المبتدئين",
      "حلقة المتوسطين",
      "حلقة المتقدمين",
    ],
    data: [25, 30, 20, 15],
  });

  const [marksByGroup, setMarksByGroup] = useState({
    labels: [
      "حلقة الأطفال",
      "حلقة المبتدئين",
      "حلقة المتوسطين",
      "حلقة المتقدمين",
    ],
    data: [85, 78, 82, 88],
  });

  const [genderDistribution, setGenderDistribution] = useState({
    male: 65,
    female: 35,
  });

  // Load statistics on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch students count
        const studentsResponse = await fetch("/api/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const studentsData = await studentsResponse.json();
        const studentsCount = Array.isArray(studentsData)
          ? studentsData.length
          : 0;

        // Fetch teachers count
        const teachersResponse = await fetch("/api/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const teachersData = await teachersResponse.json();
        const teachersCount =
          teachersData.success && Array.isArray(teachersData.data)
            ? teachersData.data.length
            : 0;

        // Fetch exams count
        const examsResponse = await fetch("/api/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const examsData = await examsResponse.json();
        const examsCount = Array.isArray(examsData) ? examsData.length : 0;

        // Fetch groups count
        const groupsResponse = await fetch("/api/groups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groupsData = await groupsResponse.json();
        const groupsCount =
          groupsData.success && Array.isArray(groupsData.data)
            ? groupsData.data.length
            : 0;

        // Calculate average marks (placeholder - would need marks API)
        const averageMarks = 85; // Placeholder value

        setStats({
          totalStudents: studentsCount,
          totalTeachers: teachersCount,
          totalExams: examsCount,
          totalGroups: groupsCount,
          averageMarks: averageMarks,
          activeStudents: 42, // Dummy data
          attendanceRate: 87, // Dummy data
          upcomingExams: 5, // Dummy data
          newStudentsThisMonth: 8, // Dummy data
          totalActivities: 23, // Dummy data
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, []);
  return (
    <div className="admin-dashboard">
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              لوحة الإحصائيات
            </h2>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
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
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      إجمالي الطلاب
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalStudents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
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
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      إجمالي المعلمين
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalTeachers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
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
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      إجمالي الاختبارات
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalExams}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      إجمالي الحلقات
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalGroups}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      الطلاب النشطين اليوم
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.activeStudents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
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
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      معدل الحضور
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.attendanceRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
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
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      الامتحانات القادمة
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.upcomingExams}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
                <div className="flex items-center">
                  <div className="p-2 bg-teal-500 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      طلاب جدد هذا الشهر
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.newStudentsThisMonth}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <div className="flex items-center">
                  <div className="p-2 bg-pink-500 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v3M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4h10M9 9h6m-6 4h6m2 5H7m6 0h4"
                      />
                    </svg>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      إجمالي الأنشطة
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalActivities}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  إحصائيات المستخدمين
                </h3>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: ["الطلاب", "المعلمين", "الحلقات"],
                      datasets: [
                        {
                          label: "العدد",
                          data: [
                            stats.totalStudents,
                            stats.totalTeachers,
                            stats.totalGroups,
                          ],
                          backgroundColor: [
                            "rgba(59, 130, 246, 0.8)", // blue
                            "rgba(34, 197, 94, 0.8)", // green
                            "rgba(239, 68, 68, 0.8)", // red
                          ],
                          borderColor: [
                            "rgb(59, 130, 246)",
                            "rgb(34, 197, 94)",
                            "rgb(239, 68, 68)",
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        title: {
                          display: true,
                          text: "إحصائيات النظام",
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  توزيع الطلاب حسب الحلقات
                </h3>
                <div className="h-64">
                  <Pie
                    data={{
                      labels: groupDistribution.labels,
                      datasets: [
                        {
                          data: groupDistribution.data,
                          backgroundColor: [
                            "rgba(59, 130, 246, 0.8)", // blue
                            "rgba(34, 197, 94, 0.8)", // green
                            "rgba(239, 68, 68, 0.8)", // red
                            "rgba(168, 85, 247, 0.8)", // purple
                          ],
                          borderColor: [
                            "rgb(59, 130, 246)",
                            "rgb(34, 197, 94)",
                            "rgb(239, 68, 68)",
                            "rgb(168, 85, 247)",
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  متوسط العلامات لكل حلقة
                </h3>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: marksByGroup.labels,
                      datasets: [
                        {
                          label: "متوسط العلامات",
                          data: marksByGroup.data,
                          backgroundColor: "rgba(34, 197, 94, 0.8)",
                          borderColor: "rgb(34, 197, 94)",
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            stepSize: 10,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Additional Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  توزيع الطلاب حسب الجنس
                </h3>
                <div className="h-64">
                  <Pie
                    data={{
                      labels: ["ذكور", "إناث"],
                      datasets: [
                        {
                          data: [
                            genderDistribution.male,
                            genderDistribution.female,
                          ],
                          backgroundColor: [
                            "rgba(59, 130, 246, 0.8)", // blue for male
                            "rgba(236, 72, 153, 0.8)", // pink for female
                          ],
                          borderColor: [
                            "rgb(59, 130, 246)",
                            "rgb(236, 72, 153)",
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  إحصائيات الحضور والأداء
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      معدل الحضور العام
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {stats.attendanceRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${stats.attendanceRate}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-600">
                      متوسط العلامات
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {stats.averageMarks}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${stats.averageMarks}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-600">
                      الطلاب النشطين اليوم
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {stats.activeStudents}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.activeStudents /
                            Math.max(stats.totalStudents, 1)) *
                          100
                        }%`,
                      }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
