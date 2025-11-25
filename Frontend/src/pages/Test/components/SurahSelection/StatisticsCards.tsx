// ============================================================================
// StatisticsCards Component - بطاقات الإحصائيات
// ============================================================================

import type { StatisticsCardsProps } from "../../types/test";
import { calculateTotalAyahs } from "../../utils/testHelpers";

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  selectedSurahs,
  surahs,
}) => {
  if (selectedSurahs.length === 0) return null;

  const totalAyahs = calculateTotalAyahs(selectedSurahs, surahs);

  return (
    <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-blue-200 text-center">
        <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📊</div>
        <div className="text-xl sm:text-2xl font-bold text-blue-700">~10</div>
        <div className="text-xs sm:text-sm text-blue-600">أسئلة متوقعة</div>
      </div>
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-purple-200 text-center">
        <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">⏱️</div>
        <div className="text-xl sm:text-2xl font-bold text-purple-700">
          20 ث
        </div>
        <div className="text-xs sm:text-sm text-purple-600">لكل سؤال</div>
      </div>
      <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-amber-200 text-center">
        <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🎯</div>
        <div className="text-xl sm:text-2xl font-bold text-amber-700">
          {totalAyahs}
        </div>
        <div className="text-xs sm:text-sm text-amber-600">آية إجمالية</div>
      </div>
    </div>
  );
};
