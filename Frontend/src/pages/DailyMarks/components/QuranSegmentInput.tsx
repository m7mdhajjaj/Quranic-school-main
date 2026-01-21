import React from 'react';
import { quranSurahs } from '@/data/quranSurahs';
import { BookOpen, Search, X } from 'lucide-react';
import type { QuranSegmentUI } from '../types/types';

import { useQuranSegmentInputLogic } from "../hooks/ui";

import type { CompletedSurah } from '@/Api/DailyMark/sectionApi';

interface QuranSegmentInputProps {
  label: string;
  onChange: (segments: QuranSegmentUI[]) => void;
  segments?: QuranSegmentUI[]; 
  colorClass?: string;
  error?: string; // Add error prop to show validation issues
  groupName?: string; // For auto-suggestions
  type?: 'memorization' | 'review'; // For auto-suggestions
  excludeId?: string; // For correct suggestions during edit
  completedSurahs?: CompletedSurah[]; // New: For validation
  date?: string; // ✅ V8: Pass date for context-aware suggestions
  onValidationError?: (error: string | null) => void; // ✅ V8: Callback for validation errors
  groupId?: string; // ✅ V10: For Active Surah validation
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
  excludeId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  completedSurahs = [],
  date, // ✅ Receive date from parent
  onValidationError, // ✅ V8: Callback for validation errors
  groupId // ✅ V10: For Active Surah validation
}) => {
  // استخدم الهوك لفصل المنطق
  // ✅ V8: reviewLimit و expectedStart لم تعد تستخدم للـ validation (Backend handles it)
  const {
    surahInput,
    isFocused,
    setIsFocused,
    suggestions,
    handleUpdate,
    handleInputChange,
    selectSurah,
    handleClear,
    handleBlur,
    currentSurah,
    maxAyah,
    segment,
    reviewLimit, // ✅ Retrive reviewLimit for input constraints
    noMemorizationError, // ✅ V8: Error when no memorization exists
    activeSurahError, // ✅ V10: Error when Active Surah validation fails
    activeSurahInfo // ✅ V13: معلومات السورة الفعالة للتحقق قبل الاختيار
  } = useQuranSegmentInputLogic({ segments, groupName, type, onChange, excludeId, date, groupId });

  // ✅ V13: التحقق من وجود سورة فعالة غير مكتملة
  const hasBlockingActiveSurah = activeSurahInfo?.isActive && !activeSurahInfo?.canStartNewSurah;
  const blockingActiveSurahNumber = hasBlockingActiveSurah ? activeSurahInfo?.surahNumber : null;

  // ✅ V8: Notify parent of validation errors (combine both errors)
  React.useEffect(() => {
    if (onValidationError) {
      onValidationError(noMemorizationError || activeSurahError);
    }
  }, [noMemorizationError, activeSurahError, onValidationError]);

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
                      {/* ✅ V13: تحذير إذا كانت هناك سورة فعالة غير مكتملة */}
                      {hasBlockingActiveSurah && activeSurahInfo && (
                        <div className="sticky top-0 bg-amber-50 border-b-2 border-amber-300 px-4 py-3 z-10">
                          <div className="flex items-center gap-2 text-amber-800">
                            <span className="text-lg">🔒</span>
                            <div className="flex-1">
                              <p className="text-xs font-bold">يجب إكمال {activeSurahInfo.surahName} أولاً</p>
                              <p className="text-[10px] mt-0.5">
                                التقدم: {activeSurahInfo.lastAyahEnd || 0}/{activeSurahInfo.totalAyahs} آية ({activeSurahInfo.progressPercent}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {suggestions.map(s => {
                          const isCompleted = completedSurahs.some(c => c.surahNumber === s.number);
                          // ✅ V13 FIX: للمراجعة يمكن تكرار السور المكتملة، للحفظ فقط ممنوع
                          const isBlockedByCompletion = type === 'memorization' && isCompleted;
                          // ✅ V13: منع اختيار سورة غير السورة الفعالة
                          const isBlockedByActiveSurah = hasBlockingActiveSurah && s.number !== blockingActiveSurahNumber;
                          const isBlockedForSelection = isBlockedByCompletion || isBlockedByActiveSurah;
                          // ✅ V13: السورة الفعالة تظهر بلون مميز
                          const isActiveSurah = blockingActiveSurahNumber === s.number;
                          
                          return (
                          <div 
                            key={s.number}
                            className={`px-4 py-3 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group/item
                                ${isActiveSurah 
                                  ? 'bg-amber-50 hover:bg-amber-100 cursor-pointer border-r-4 border-r-amber-500' 
                                  : isBlockedForSelection 
                                  ? 'bg-gray-50/50 cursor-not-allowed opacity-50' 
                                  : 'cursor-pointer hover:bg-gray-50 bg-white'}
                            `}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur before click
                                if (isBlockedByCompletion) {
                                   import('@/utils/toastUtils').then(({ showWarningToast }) => {
                                      showWarningToast(`⚠️ سورة ${s.name} مكتملة بالفعل في الحفظ`);
                                   });
                                   return;
                                }
                                if (isBlockedByActiveSurah) {
                                   import('@/utils/toastUtils').then(({ showWarningToast }) => {
                                      showWarningToast(`🔒 يجب إكمال ${activeSurahInfo?.surahName} أولاً (${activeSurahInfo?.progressPercent}% مكتمل)`);
                                   });
                                   return;
                                }
                                selectSurah(s);
                            }}
                          >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold 
                                        ${isActiveSurah
                                            ? 'bg-amber-200 text-amber-800 ring-2 ring-amber-400'
                                            : isBlockedForSelection 
                                            ? 'bg-gray-200 text-gray-500' 
                                            : isCompleted && type === 'review'
                                            ? 'bg-green-100 text-green-700'
                                            : (colorClass === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')
                                        }`}>
                                    {s.number}
                                    </span>
                                    {isActiveSurah && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white animate-pulse"></div>}
                                    {isCompleted && !isActiveSurah && <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${type === 'review' ? 'bg-blue-500' : 'bg-green-500'}`}></div>}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`font-bold ${isBlockedForSelection && !isActiveSurah ? 'text-gray-500' : isActiveSurah ? 'text-amber-800' : 'text-gray-700 group-hover/item:text-black'}`}>
                                        {s.name}
                                    </span>
                                    {isActiveSurah && (
                                      <span className="text-[9px] font-bold text-amber-600">⚡ السورة الفعالة - اختر للإكمال</span>
                                    )}
                                    {isCompleted && !isActiveSurah && (
                                      <span className={`text-[9px] font-bold ${type === 'review' ? 'text-blue-600' : 'text-green-600'}`}>
                                        {type === 'review' ? '✓ يمكن إعادة المراجعة' : 'تم الختم ✓'}
                                      </span>
                                    )}
                                    {isBlockedByActiveSurah && !isActiveSurah && !isCompleted && (
                                      <span className="text-[9px] font-bold text-gray-400">🔒 أكمل السورة الفعالة أولاً</span>
                                    )}
                                </div>
                              </div>
                              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full group-hover/item:bg-white">
                                {s.ayahCount} آية
                              </span>
                          </div>
                          );
                      })}
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
            max={maxAyah}
            disabled={!segment.surahNumber}
            className={`w-full rounded-lg border text-sm font-bold py-2 px-1 text-center transition-all outline-none 
                disabled:bg-gray-50 disabled:border-gray-50 disabled:text-gray-400
                ${
                     (!segment.ayahStart && segment.surahNumber) ? 'border-red-200 bg-red-50/30' : 
                     `border-gray-100 bg-white hover:border-gray-200 ${activeBorder} ${activeRing}`
            }`}
            placeholder="1"
            value={segment.ayahStart || ''}
            onChange={(e) => handleUpdate('ayahStart', e.target.value)}
          />
        </div>

        {/* Ayah End */}
        <div className="w-[85px] shrink-0 relative">
          <label className="block text-[11px] font-bold text-gray-500 mb-1.5 text-center">
            إلى <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={segment.ayahStart || 1}
            // ✅ V9: Review end is capped at reviewLimit but user can edit
            max={type === 'review' && reviewLimit ? reviewLimit : maxAyah}
            disabled={!segment.surahNumber}
            className={`w-full rounded-lg border text-sm font-bold py-2 px-1 text-center transition-all outline-none 
                disabled:bg-gray-50 disabled:border-gray-50 disabled:text-gray-400
                ${
                !segment.ayahEnd && segment.surahNumber ? 'border-red-200 bg-red-50/30' : 
                `border-gray-100 bg-white hover:border-gray-200 ${activeBorder} ${activeRing}`
            }`}
            placeholder={type === 'review' && reviewLimit ? reviewLimit.toString() : maxAyah.toString()}
            value={segment.ayahEnd || ''}
            onChange={(e) => handleUpdate('ayahEnd', e.target.value)}
          />
          
          {/* Review Limit Hint */}
          {type === 'review' && reviewLimit && segment.surahNumber && (
             <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-max z-10">
                 <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 shadow-sm whitespace-nowrap">
                   حد المراجعة: {reviewLimit}
                 </span>
             </div>
           )}
        </div>
      </div>
      
      {/* ✅ V10: Active Surah validation error - shown immediately in modal with enhanced styling */}
      {activeSurahError && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl shadow-lg animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">⛔ سورة غير مكتملة</span>
              </div>
              <p className="text-sm text-red-800 whitespace-pre-line leading-relaxed">{activeSurahError}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* ✅ V9: No memorization error */}
      {noMemorizationError && !activeSurahError && (
        <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl shadow-lg animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-700 bg-yellow-100 px-2 py-0.5 rounded">⚠️ تنبيه:</span>
              </div>
              <p className="text-sm font-bold text-amber-800 whitespace-pre-line leading-relaxed">{noMemorizationError}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* ✅ V8: Backend handles all review validation - removed frontend real-time validation */}

      
      {!segment.surahNumber && !activeSurahError && !noMemorizationError && (
        <p className="text-xs text-gray-400 mt-1 mr-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"></span>
           اترك الحقول فارغة إذا لم يوجد لهذه الفقرة {label.includes('حفظ') ? 'حفظ' : 'مراجعة'} اليوم.
        </p>
      )}

    </div>
  );
};

export default QuranSegmentInput;
