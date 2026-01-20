import React, { useCallback } from "react";
import { Card } from "@/components/UI";
import type { ReciterSelectorProps } from "../types/reciterSelector";

const ReciterSelector: React.FC<ReciterSelectorProps> = ({
  reciters,
  selectedReciter,
  onReciterChange,
}) => {
  // Optimize click handler to prevent blocking
  const handleReciterClick = useCallback((reciterCode: string) => {
    // Immediate UI update
    onReciterChange(reciterCode);
  }, [onReciterChange]);

  return (
    <Card variant="elevated" padding="lg" className="mb-6 sm:mb-8 border border-emerald-100 animate-slideDown">
      {/* العنوان */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 rounded-lg p-2 sm:p-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">اختر القارئ المفضل</h2>
      </div>

      {/* شبكة القراء */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {reciters.map((reciterOption) => (
          <Card
            key={reciterOption.code}
            onClick={() => handleReciterClick(reciterOption.code)}
            hover={selectedReciter !== reciterOption.code}
            padding="md"
            className={`relative text-right overflow-hidden ${
              selectedReciter === reciterOption.code
                ? "border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-lg scale-105"
                : "border-2 border-gray-200 hover:border-emerald-300"
            }`}>
            {/* خلفية متحركة */}
            <div className={`absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              selectedReciter === reciterOption.code ? "opacity-100" : ""
            }`}></div>

            {/* المحتوى */}
            <div className="relative z-10">
              {/* اسم القارئ */}
              <div className="font-bold text-base sm:text-lg mb-1">{reciterOption.name}</div>
              
              {/* علامة التحديد */}
              {selectedReciter === reciterOption.code && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 mt-2 animate-fadeIn">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-semibold">القارئ المحدد</span>
                </div>
              )}
            </div>

            {/* أيقونة ميكروفون */}
            <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 transition-all duration-300 ${
              selectedReciter === reciterOption.code 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-75 group-hover:opacity-50 group-hover:scale-100"
            }`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
              </svg>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

// ✅ Memoize to prevent re-renders when parent updates
export default React.memo(ReciterSelector);
