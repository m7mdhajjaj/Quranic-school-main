// ============================================================================
// Reports/ReportChart.tsx - Chart Display Component
// ============================================================================

import React from "react";
import { Card } from "../../components/shared";
import MarksBarChart from "../../components/MarksBarChart";

interface ReportChartProps {
  labels: string[];
  data: number[];
  userRole: string;
  selectedMonth: number | null;
  selectedYear: number | null;
}

const ReportChart: React.FC<ReportChartProps> = ({
  labels,
  data,
  userRole,
  selectedMonth,
  selectedYear,
}) => {
  const isStudent = userRole === "student";
  const title = isStudent ? "📊 معدلاتي الشهرية" : "📈 متوسط معدلات الحلقة";

  const getFilterText = () => {
    if (selectedMonth && selectedYear) {
      return isStudent
        ? `📅 يتم عرض معدلك للشهر ${selectedMonth}/${selectedYear}`
        : `📅 يتم عرض متوسط معدلات جميع الطلاب للشهر ${selectedMonth}/${selectedYear}`;
    }
    return isStudent
      ? "📅 يتم عرض معدلاتك لآخر 6 أشهر"
      : "📅 يتم عرض متوسط معدلات جميع الطلاب لآخر 6 أشهر";
  };

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="max-w-4xl mx-auto mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
        {title}
      </h2>

      {labels.length > 0 ? (
        <>
          <MarksBarChart labels={labels} data={data} />
          <div className="text-center mt-4 sm:mt-6 text-gray-600 text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded-lg">
            {getFilterText()}
          </div>
        </>
      ) : (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300"
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
          <p className="text-base sm:text-lg font-medium">
            لا توجد بيانات لعرضها
          </p>
          <p className="text-xs sm:text-sm mt-2">
            {isStudent
              ? "لم يتم تسجيل أي معدلات شهرية بعد"
              : "لم يتم تسجيل أي معدلات شهرية للطلاب بعد"}
          </p>
        </div>
      )}
    </Card>
  );
};

export default ReportChart;
