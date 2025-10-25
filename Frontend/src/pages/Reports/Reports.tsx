// ============================================================================
// Reports/Reports.tsx - Main Reports Component
// ============================================================================

import React from "react";
import { useReportData } from "./useReportData";
import ReportHeader from "./ReportHeader";
import ReportFilters from "./ReportFilters";
import ReportChart from "./ReportChart";

const Reports: React.FC = () => {
  const {
    loading,
    userRole,
    chartData,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  } = useReportData();

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div
      className="container mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4"
      dir="rtl">
      <ReportHeader />

      <ReportFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      <ReportChart
        labels={chartData.labels}
        data={chartData.data}
        userRole={userRole}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
};

export default Reports;
