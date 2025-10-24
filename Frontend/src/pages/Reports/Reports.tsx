// ============================================================================
// Reports/Reports.tsx - Main Reports Component
// ============================================================================

import React from "react";
import { useReportData } from "./useReportData";
import ReportHeader from "./ReportHeader";
import ReportFilters from "./ReportFilters";
import ReportChart from "./ReportChart";
import ReportsSkeleton from "../../components/shared/Skeleton/ReportsSkeleton";

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
    return <ReportsSkeleton />;
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
