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
        <ReportFilters
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          userRole={userRole}
          groups={groups}
          selectedGroupId={selectedGroupId}
          onGroupChange={setSelectedGroupId}
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
