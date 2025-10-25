// ============================================================================
// SurahCard Component - بطاقة السورة
// ============================================================================

import type { SurahCardProps } from "../types/test";

export const SurahCard: React.FC<SurahCardProps> = ({
  surah,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-sm transition-all duration-300 transform active:scale-95 md:hover:scale-105 hover:shadow-xl ${
        isSelected
          ? "bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-600 text-white shadow-lg scale-[1.02] md:scale-105"
          : "bg-white border-gray-300 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50"
      }`}>
      {/* رقم السورة */}
      <div
        className={`absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md ${
          isSelected
            ? "bg-yellow-400 text-yellow-900"
            : "bg-gray-200 text-gray-600 group-hover:bg-indigo-500 group-hover:text-white"
        }`}>
        {surah.number}
      </div>

      {/* علامة الاختيار */}
      {isSelected && (
        <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-md animate-bounce">
          <span className="text-emerald-600 text-sm sm:text-lg">✓</span>
        </div>
      )}

      {/* محتوى البطاقة */}
      <div className="mt-1">
        <div
          className={`font-bold mb-0.5 sm:mb-1 text-sm sm:text-base leading-tight ${
            isSelected
              ? "text-white"
              : "text-gray-800 group-hover:text-indigo-700"
          }`}>
          {surah.name}
        </div>
        <div
          className={`text-[10px] sm:text-xs ${
            isSelected
              ? "text-emerald-100"
              : "text-gray-500 group-hover:text-indigo-600"
          }`}>
          📄 {surah.numberOfAyahs} آية
        </div>
      </div>
    </button>
  );
};
