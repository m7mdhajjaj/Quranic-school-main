/**
 * Page Header Component
 * Displays title, description, and current period title
 */

import { getMonthName } from "../utils/arrangementHelpers";

interface PageHeaderProps {
  selectedMonth: number;
  selectedYear: number;
  studentsCount: number;
}

export const PageHeader = ({
  selectedMonth,
  selectedYear,
  studentsCount,
}: PageHeaderProps) => {
  return (
    <div className="text-center mb-16" data-aos="fade-down">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
        ترتيب الطلاب المتميزين
      </h1>
      <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
      <p className="text-slate-600 text-lg max-w-3xl mx-auto">
        يعرض هذا الترتيب الطلاب بناءً على معدلاتهم الشهرية في الحفظ والمراجعة
      </p>

      {/* Current month/year title */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl shadow-lg inline-block">
          <h2 className="text-2xl font-bold text-center">
            🏆 ترتيب {getMonthName(selectedMonth)} {selectedYear}
          </h2>
          <p className="text-center text-emerald-100 mt-1">
            {studentsCount} طالب في الحلقة
          </p>
        </div>
      </div>
    </div>
  );
};
