// ============================================================================
// Reports.tsx - Main Reports Page (Restructured)
// ============================================================================

import React from "react";
import ReportHeader from "./ReportHeader";
import ReportFilters from "./ReportFilters";
import ReportChart from "./ReportChart";
import { useReportData } from "./useReportData";

const Reports: React.FC = () => {
  const {
    loading,
    userRole,
    chartData,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    groups,
    selectedGroupId,
    setSelectedGroupId,
  } = useReportData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 pb-8">
      <ReportHeader />

      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* اختيار الحلقة للمعلم */}
        {userRole === "teacher" && groups.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              اختر الحلقة
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-right bg-white">
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name} ({group.totalStudents} طالب)
                </option>
              ))}
            </select>
          </div>
        )}

        <ReportFilters
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-gray-600">جاري تحميل التقارير...</p>
          </div>
        ) : (
          <ReportChart
            labels={chartData.labels}
            data={chartData.data}
            userRole={userRole}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;
