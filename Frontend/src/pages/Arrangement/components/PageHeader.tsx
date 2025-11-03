/**
 * Page Header Component
 * Displays title, description, and current period title
 * Uses shared PageHeader component
 */

import SharedPageHeader from "../../../components/UI/PageHeader";
import { getMonthName } from "../utils/arrangementHelpers";
import { Trophy } from "lucide-react";

interface ArrangementPageHeaderProps {
  selectedMonth: number;
  selectedYear: number;
  studentsCount: number;
}

export const PageHeader = ({
  selectedMonth,
  selectedYear,
  studentsCount,
}: ArrangementPageHeaderProps) => {
  return (
    <div data-aos="fade-down">
      {/* استخدام المكون المشترك */}
      <SharedPageHeader
        title="ترتيب الطلاب المتميزين"
        subtitle="يعرض هذا الترتيب الطلاب بناءً على معدلاتهم الشهرية في الحفظ والمراجعة"
        icon={<Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
        showDivider={true}
        className="mb-8"
      />

      {/* Current month/year title */}
      <div className="text-center">
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
