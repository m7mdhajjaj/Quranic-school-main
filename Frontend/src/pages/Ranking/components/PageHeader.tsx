/**
 * Page Header Component
 * Displays title, description, and current period title
 */

import { getMonthName } from "../utils/rankingHelpers";
import { Trophy } from "lucide-react";
import type { PageHeaderProps } from "../types/ranking";

export const PageHeader = ({
  selectedMonth,
  selectedYear,
  studentsCount,
}: PageHeaderProps) => {
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              🏆 ترتيب الطلاب المتميزين
            </h1>
            <p className="text-white/70 text-sm mt-1">
              يعرض هذا الترتيب الطلاب بناءً على معدلاتهم الشهرية في الحفظ والمراجعة
            </p>
          </div>
        </div>
      </div>

      {/* Current month/year title */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white px-8 py-4 rounded-2xl shadow-lg inline-block border border-white/10">
          <h2 className="text-2xl font-bold text-center">
            🏆 ترتيب {getMonthName(selectedMonth)} {selectedYear}
          </h2>
          <p className="text-center text-white/70 mt-1">
            {studentsCount} طالب في الحلقة
          </p>
        </div>
      </div>
    </div>
  );
};
