// ============================================================================
// ProgressBar Component - شريط التقدم
// ============================================================================

import type { ProgressBarProps } from "../../types/test";
import { calculateProgress } from "../../utils/testHelpers";

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  score,
}) => {
  const progress = calculateProgress(current, total);

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-4 md:p-6 mb-6 border border-emerald-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl font-bold text-sm md:text-base shadow-md">
            السؤال {current + 1} / {total}
          </div>
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-xl font-bold text-amber-700 border border-amber-200">
            <span className="text-2xl">⭐</span> {score}
          </div>
        </div>
        <div className="text-gray-600 text-sm font-medium hidden md:block">
          {Math.round(progress)}% مكتمل
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out shadow-md"
          style={{ width: `${progress}%` }}>
          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
