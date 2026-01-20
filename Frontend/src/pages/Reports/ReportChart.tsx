// ============================================================================
// Reports/ReportChart.tsx - Chart Display Component
// ============================================================================

import React from "react";
import { Card } from "@/components/UI/Card";
import MarksBarChart from "@/components/Chart/MarksBarChart";

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
      className="max-w-4xl mx-auto mt-6 sm:mt-8 bg-white border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-center text-slate-800">
        {title}
      </h2>

      {labels.length > 0 ? (
        <>
          <MarksBarChart labels={labels} data={data} />
          <div className="text-center mt-4 sm:mt-6 text-slate-600 text-xs sm:text-sm bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 p-3 sm:p-4 rounded-xl border border-emerald-100/50">
            {getFilterText()}
          </div>
        </>
      ) : (
        <div className="text-center py-8 sm:py-12 text-slate-500">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600"
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
          <p className="text-base sm:text-lg font-semibold text-slate-700">
            لا توجد بيانات لعرضها
          </p>
          <p className="text-xs sm:text-sm mt-2 text-slate-500">
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
