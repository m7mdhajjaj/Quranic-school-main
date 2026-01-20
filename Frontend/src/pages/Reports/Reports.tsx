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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 pb-8" dir="rtl">
      <ReportHeader />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-6">
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
            <p className="mt-4 text-slate-600">جاري تحميل التقارير...</p>
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
