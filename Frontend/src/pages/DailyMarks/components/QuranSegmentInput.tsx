import React from 'react';
import { quranSurahs } from '@/data/quranSurahs';
import { BookOpen, Search, X } from 'lucide-react';
import type { QuranSegmentUI } from '../types/types';

import { useQuranSegmentInputLogic } from "../hooks/useQuranSegmentInputLogic";

interface QuranSegmentInputProps {
  label: string;
  onChange: (segments: QuranSegmentUI[]) => void;
  segments?: QuranSegmentUI[]; 
  colorClass?: string;
  error?: string; // Add error prop to show validation issues
  groupName?: string; // For auto-suggestions
  type?: 'memorization' | 'review'; // For auto-suggestions
  excludeId?: string; // For correct suggestions during edit
}

// Normalization Helper
const normalizeText = (text: string) => {
  if (!text) return "";
  let normalized = text.toString().trim();
  normalized = normalized.replace(/[\u064B-\u065F]/g, ""); // Remove Harakat
  normalized = normalized.replace(/[أإآ]/g, "ا"); // Normalize Alef
  normalized = normalized.replace(/ى/g, "ي"); // Normalize Ya
  normalized = normalized.replace(/ة/g, "ه"); // Normalize Ta Marbuta
  return normalized;
};

const QuranSegmentInput: React.FC<QuranSegmentInputProps> = ({
  label,
  onChange,
  segments = [],
  colorClass = "emerald",
  error,
  groupName,
  type,
  excludeId
}) => {
  // استخدم الهوك لفصل المنطق
  const {
    surahInput,
    isFocused,
    setIsFocused,
    suggestions,
    expectedStart,
    reviewLimit,
    handleUpdate,
    handleInputChange,
    selectSurah,
    handleClear,
    handleBlur,
    currentSurah,
    maxAyah,
    segment,
  } = useQuranSegmentInputLogic({ segments, groupName, type, onChange, excludeId });

  // Dynamic border/ring colors based on colorClass prop
  const activeRing = colorClass === 'amber' ? 'focus:ring-amber-500' : 'focus:ring-emerald-500';
  const activeBorder = colorClass === 'amber' ? 'focus:border-amber-500' : 'focus:border-emerald-500';
  const bgSelected = colorClass === 'amber' ? 'bg-amber-50' : 'bg-emerald-50';
  const textSelected = colorClass === 'amber' ? 'text-amber-700' : 'text-emerald-700';

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className={`flex items-center justify-between pb-2 border-b border-gray-100`}>
        <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${bgSelected} transition-colors`}>
               <BookOpen className={`h-4 w-4 ${textSelected}`} />
            </div>
            <h4 className={`text-base font-bold text-gray-800 flex items-center gap-2`}>
            {label}
            {/* Show error only if compact style is needed, otherwise rely on ErrorMessageList in modal */}
            {error && <span className="text-[10px] text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full animate-pulse">!</span>}
            </h4>
        </div>
        {(segment.surahNumber || surahInput) && (
            <button 
                type="button"
                onClick={handleClear}
                className="group p-1.5 rounded-full hover:bg-red-50 transition-all duration-200"
                title="مسح البيانات (سيتم الحذف عند الحفظ)"
            >
                <X className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
        )}
      </div>

      <div className={`flex flex-col sm:flex-row gap-3 items-start p-4 rounded-xl border transition-all duration-300 ${isFocused ? 'bg-white shadow-md border-gray-200 relative z-30' : 'bg-gray-50/50 border-gray-100 relative z-0'}`}>
        
        {/* Surah Search Input */}
        <div className="flex-1 w-full sm:w-auto relative z-20">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
             القسم / السورة <span className="text-red-500">*</span>
          </label>
           <div className="relative group">
              <input
                type="text"
                autoComplete="off"
                className={`w-full rounded-xl border text-sm py-2.5 pl-9 pr-3 transition-all duration-200 outline-none
                    ${!segment.surahNumber && surahInput && !isFocused ? 'border-red-200 bg-red-50/30' : 
                      segment.surahNumber ? `${activeBorder} border-gray-100 ${bgSelected} font-semibold ${textSelected}` : 
                      `border-gray-100 bg-white hover:border-gray-200 ${activeBorder} ${activeRing}`
                    }
                `}
                placeholder="ابحث عن السورة..."
                value={surahInput}
                onChange={e => handleInputChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
              />
              <Search className={`absolute left-3 top-3 h-4 w-4 transition-colors ${segment.surahNumber ? textSelected : 'text-gray-400 group-hover:text-gray-600'}`} />
              
              {/* Dropdown Suggestions */}
              {isFocused && surahInput && !segment.surahNumber && suggestions.length > 0 && (
                  <div className={`absolute top-full text-right left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 mt-2 max-h-60 overflow-y-auto divide-y divide-gray-50 z-[100] animate-in fade-in zoom-in-95 duration-100 scrollbar-thin ${colorClass === 'amber' ? 'scrollbar-thumb-amber-500' : 'scrollbar-thumb-emerald-500'} scrollbar-track-transparent`}>
                      {suggestions.map(s => (
                          <div 
                            key={s.number}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between group/item`}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur before click
                                selectSurah(s);
                            }}
                          >
                              <div className="flex items-center gap-3">
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${colorClass === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {s.number}
                                </span>
                                <span className="font-bold text-gray-700 group-hover/item:text-black">{s.name}</span>
                              </div>
                              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full group-hover/item:bg-white">
                                {s.ayahCount} آية
                              </span>
                          </div>
                      ))}
                  </div>
              )}
               {isFocused && surahInput && suggestions.length === 0 && !quranSurahs.some(s => normalizeText(s.name) === normalizeText(surahInput)) && (
                  <div className="absolute top-full text-right left-0 w-full bg-white rounded-xl shadow-lg border border-gray-200 mt-2 p-4 text-center ">
                      <p className="text-gray-500 text-sm font-medium">عذراً، لا توجد نتائج</p>
                      <p className="text-xs text-gray-400 mt-1">تأكد من كتابة اسم السورة بشكل صحيح</p>
                  </div>
              )}
           </div>
           {currentSurah && (
             <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[10px] text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-full">
                  عدد الآيات: {currentSurah.ayahCount}
                </span>
             </div>
           )}
        </div>

        {/* Ayah Start */}
        <div className="w-[85px] relative shrink-0">
          <label className="block text-[11px] font-bold text-gray-500 mb-1.5 text-center">
            من <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={type === 'review' && reviewLimit ? reviewLimit : maxAyah}
            disabled={!segment.surahNumber || (type === 'review' && !!reviewLimit && !!expectedStart && expectedStart > reviewLimit)}
            className={`w-full rounded-lg border text-sm font-bold py-2 px-1 text-center transition-all outline-none 
                disabled:bg-gray-50 disabled:border-gray-50 disabled:text-gray-400
                ${
                     (type === 'review' && reviewLimit && expectedStart && expectedStart > reviewLimit) ? 'bg-emerald-50 border-emerald-100 text-emerald-700 cursor-not-allowed opacity-80' : // Completed
                     (type === 'review' && reviewLimit && segment.ayahStart && segment.ayahStart > reviewLimit) ? 'border-red-300 bg-red-50 text-red-900' :
                     (expectedStart && segment.ayahStart && segment.ayahStart > expectedStart) ? 'border-amber-300 bg-amber-50 text-amber-900' : 
                     (!segment.ayahStart && segment.surahNumber) ? 'border-red-200 bg-red-50/30' : 
                     `border-gray-100 bg-white hover:border-gray-200 ${activeBorder} ${activeRing}`
            }`}
            placeholder={type === 'review' && reviewLimit && expectedStart && expectedStart > reviewLimit ? "✓" : "1"}
            value={type === 'review' && reviewLimit && expectedStart && expectedStart > reviewLimit ? "" : (segment.ayahStart || '')}
            onChange={(e) => handleUpdate('ayahStart', e.target.value)}
          />
        </div>

        {/* Ayah End */}
        <div className="w-[85px] shrink-0">
          <label className="block text-[11px] font-bold text-gray-500 mb-1.5 text-center">
            إلى <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={segment.ayahStart || 1}
            max={type === 'review' && reviewLimit ? reviewLimit : maxAyah}
            disabled={!segment.surahNumber || (type === 'review' && !!reviewLimit && !!expectedStart && expectedStart > reviewLimit)}
            className={`w-full rounded-lg border text-sm font-bold py-2 px-1 text-center transition-all outline-none 
                disabled:bg-gray-50 disabled:border-gray-50 disabled:text-gray-400
                ${
                (type === 'review' && reviewLimit && expectedStart && expectedStart > reviewLimit) ? 'bg-emerald-50 border-emerald-100 text-emerald-700 cursor-not-allowed opacity-80' : // Completed
                (type === 'review' && reviewLimit && segment.ayahEnd && segment.ayahEnd > reviewLimit) ? 'border-red-300 bg-red-50 text-red-900' :
                !segment.ayahEnd && segment.surahNumber ? 'border-red-200 bg-red-50/30' : 
                `border-gray-100 bg-white hover:border-gray-200 ${activeBorder} ${activeRing}`
            }`}
            placeholder={type === 'review' && reviewLimit && expectedStart && expectedStart > reviewLimit ? "✓" : maxAyah.toString()}
            value={type === 'review' && reviewLimit && expectedStart && expectedStart > reviewLimit ? "" : (segment.ayahEnd || '')}
            onChange={(e) => handleUpdate('ayahEnd', e.target.value)}
          />
        </div>
      </div>
      
      {/* Review Limit Warning */}
      {type === 'review' && reviewLimit !== null && (
          <div className="mt-2 text-center text-xs">
              {reviewLimit === 0 ? (
                  <span className="font-bold text-red-500 bg-red-50 py-1 px-3 rounded-lg inline-block border border-red-100">
                      ⚠️ لم يتم حفظ هذه السورة بعد!
                  </span>
              ) : (segment.ayahStart && segment.ayahStart > reviewLimit) ? (
                  <span className="font-bold text-emerald-600 bg-emerald-50 py-1 px-3 rounded-lg inline-block border border-emerald-100">
                      🎉 تم مراجعة كل الحفظ (حتى آية {reviewLimit})
                  </span>
              ) : (
                  <span className="text-gray-400">
                      * أقصى حد للمراجعة هو آية {reviewLimit}
                  </span>
              )}
          </div>
      )}


      
      {!segment.surahNumber && (
        <p className="text-xs text-gray-400 mt-1 mr-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"></span>
           اترك الحقول فارغة إذا لم يوجد لهذه الفقرة {label.includes('حفظ') ? 'حفظ' : 'مراجعة'} اليوم.
        </p>
      )}

    </div>
  );
};

export default QuranSegmentInput;
