import React, { useState, useEffect, useRef } from 'react';
import { quranSurahs } from '@/data/quranSurahs';
import { BookOpen, Search, X } from 'lucide-react';
import type { QuranSegmentData } from '@/Validation/dailyMarksValidation';

import { getLastSegment } from '@/Api/DailyMark/sectionApi';

interface QuranSegmentInputProps {
  label: string;
  onChange: (segments: QuranSegmentData[]) => void;
  segments?: QuranSegmentData[]; 
  colorClass?: string;
  error?: string; // Add error prop to show validation issues
  groupName?: string; // For auto-suggestions
  type?: 'memorization' | 'review'; // For auto-suggestions
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
  type
}) => {
  const segment = segments[0] || { surahNumber: undefined, ayahStart: undefined, ayahEnd: undefined };
  
  // Local state for the text input
  const [surahInput, setSurahInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof quranSurahs>([]);
  const [expectedStart, setExpectedStart] = useState<number | null>(null);
  
  // Ref to track if the update came from internal typing
  const isInternalUpdate = useRef(false);

  // Initial Sync / External Sync
  useEffect(() => {
    if (segment.surahNumber && !isInternalUpdate.current) {
       const found = quranSurahs.find(s => s.number === segment.surahNumber);
       if (found) setSurahInput(found.name);
    } else if (!segment.surahNumber && !isFocused) {
       setSurahInput('');
    }
    // Reset flag after render
    if(isInternalUpdate.current) isInternalUpdate.current = false;
  }, [segment.surahNumber, isFocused]);

  // Fetch sequence info when Surah changes
  useEffect(() => {
      // Enable suggestions for both memorization and review
      if (groupName && (type === 'memorization' || type === 'review') && segment.surahNumber) {
          getLastSegment(groupName, segment.surahNumber, type).then(suggestion => {
             if (suggestion && suggestion.nextStart) {
                 setExpectedStart(suggestion.nextStart);
             } else {
                 setExpectedStart(1); // Default to 1 if no history
             }
          }).catch(() => setExpectedStart(null));
      } else {
          setExpectedStart(null);
      }
  }, [segment.surahNumber, groupName, type]);


  const handleUpdate = (field: keyof QuranSegmentData, value: any, surahData?: {number: number, name: string}) => {
    let newSegment: QuranSegmentData = { ...segment };

    if (field === 'surahNumber') {
      // Logic for changing Surah
      const numValue = Number(value);
      isInternalUpdate.current = true; // Mark as internal to prevent overwrite loop

      if (!numValue || !surahData) {
        onChange([]); // Clear segment
        setExpectedStart(null);
        return;
      }

      // Find full surah data to get ayahCount
      const fullSurahData = quranSurahs.find(s => s.number === numValue);

      newSegment = {
        surahNumber: numValue,
        surahNameCanonical: surahData.name,
        ayahStart: 1, 
        ayahEnd: fullSurahData ? fullSurahData.ayahCount : undefined 
      };

      // 1. Immediate Update (Optimistic)
      onChange([newSegment]);

      // 2. Smart Suggestion (Async)
      if (groupName && type) {
          getLastSegment(groupName, numValue, type).then(suggestion => {
             if (suggestion && suggestion.nextStart) {
                 const nextStart = suggestion.nextStart;
                 setExpectedStart(nextStart); // Update expected

                 // Ensure valid range
                 const maxAyah = fullSurahData?.ayahCount || 999;
                 
                 if (nextStart <= maxAyah) {
                     const smartSegment = {
                         ...newSegment,
                         ayahStart: nextStart,
                         ayahEnd: fullSurahData ? fullSurahData.ayahCount : undefined 
                     };
                     onChange([smartSegment]);
                 }
             } else {
                 setExpectedStart(1);
             }
          }).catch(err => console.log('Smart suggestion failed', err));
      }
      return; 

    } else {
       newSegment[field] = Number(value);
    }
    
    onChange([newSegment]);
  };

  // Handle Text Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSurahInput(val);
    isInternalUpdate.current = true;

    if (!val) {
        setSuggestions([]);
        if(segment.surahNumber) onChange([]); // Clear parent selection
        return;
    }

    const normalizedVal = normalizeText(val);

    // Filter Suggestions (Enhanced Search)
    const matches = quranSurahs.filter(s => {
        const normName = normalizeText(s.name);
        // 1. Exact or StartsWith (High priority)
        if (normName.startsWith(normalizedVal)) return true;
        // 2. Contains (Medium priority - good for "Imran" in "Al Imran")
        if (normName.includes(normalizedVal)) return true;
        return false;
    }).slice(0, 5); // Limit to 5 suggestions

    setSuggestions(matches);
  };

  // Commit Selection
  const selectSurah = (s: typeof quranSurahs[0]) => {
      setSurahInput(s.name);
      setSuggestions([]);
      handleUpdate('surahNumber', s.number, { number: s.number, name: s.name });
  };

  // Blur Handler: Auto-select if exact match or clear if invalid
  const handleBlur = () => {
      setIsFocused(false);
      // specific small delay to allow click on suggestion to fire first
      setTimeout(() => {
          if (!surahInput) {
             if(segment.surahNumber) onChange([]);
             return;
          }
          
          // If we have a valid selection already and text matches it approximately, keep it
          const currentSurah = quranSurahs.find(s => s.number === segment.surahNumber);
          if (currentSurah && normalizeText(surahInput) === normalizeText(currentSurah.name)) {
              setSurahInput(currentSurah.name); // Fix format
              return;
          }

          // If text doesn't match current selection, try to find a match
          // Logic: If one perfect match exists in suggestions, take it.
          if (suggestions.length === 1) {
              selectSurah(suggestions[0]);
          } else {
              // Invalid input, check strict match against all
              const strictMatch = quranSurahs.find(s => normalizeText(s.name) === normalizeText(surahInput));
              if (strictMatch) {
                  selectSurah(strictMatch);
              } else {
                 // No match found -> Revert to previous valid or Clear?
                 // User request: "If I type wrong it should show not found"
                 // If we leave it, the input has text but no 'surahNumber'. This is invalid state.
                 // We should visually indicate error or clear.
                 // Let's clear for safety but maybe keep text red? Valid data requires surahNumber.
                 if (segment.surahNumber) onChange([]); // Detach data
              }
          }
      }, 200);
  };

  const currentSurah = quranSurahs.find(s => s.number === segment.surahNumber);
  const maxAyah = currentSurah ? currentSurah.ayahCount : 999;
  
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
            <div className={`p-1.5 rounded-lg ${bgSelected}`}>
               <BookOpen className={`h-4 w-4 ${textSelected}`} />
            </div>
            <h4 className={`text-base font-bold text-gray-800 flex items-center gap-2`}>
            {label}
            {error && <span className="text-xs text-red-500 font-normal bg-red-50 px-2 py-0.5 rounded-full">({error})</span>}
            </h4>
        </div>
        {segment.surahNumber && (
            <button 
                type="button"
                onClick={() => {
                    setSurahInput('');
                    onChange([]);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-gray-100 rounded-full"
                title="حذف هذا المقطع"
            >
                <X className="h-4 w-4" />
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
                className={`w-full rounded-xl border-2 text-sm py-2.5 pl-9 pr-3 transition-all duration-200 outline-none
                    ${!segment.surahNumber && surahInput && !isFocused ? 'border-red-300 bg-red-50/30' : 
                      segment.surahNumber ? `${activeBorder} border-gray-200 ${bgSelected} font-semibold ${textSelected}` : 
                      `border-gray-200 bg-white hover:border-gray-300 ${activeBorder} ${activeRing}`
                    }
                `}
                placeholder="ابحث عن السورة..."
                value={surahInput}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
              />
              <Search className={`absolute left-3 top-3 h-4 w-4 transition-colors ${segment.surahNumber ? textSelected : 'text-gray-400 group-hover:text-gray-600'}`} />
              
              {/* Dropdown Suggestions */}
              {isFocused && surahInput && !segment.surahNumber && suggestions.length > 0 && (
                  <div className="absolute top-full text-right left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 mt-2 max-h-60 overflow-y-auto divide-y divide-gray-50 z-[100] animate-in fade-in zoom-in-95 duration-100 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
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
               {isFocused && surahInput && suggestions.length === 0 && (
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
        <div className="w-1/2 sm:w-[100px] relative">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex justify-between items-center">
            <span>من آية <span className="text-red-500">*</span></span>
            {expectedStart && segment.ayahStart !== expectedStart && (
                <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1 rounded ml-1 animate-pulse">
                   التالي: {expectedStart}
                </span>
            )}
          </label>
          <input
            type="number"
            min={1}
            max={maxAyah}
            disabled={!segment.surahNumber}
            className={`w-full rounded-xl border-2 text-sm py-2.5 px-3 text-center transition-all outline-none 
                disabled:bg-gray-100 disabled:border-transparent disabled:text-gray-400
                ${
                     (expectedStart && segment.ayahStart > expectedStart) ? 'border-amber-400 bg-amber-50 text-amber-900' : // Gap Warning
                     (!segment.ayahStart && segment.surahNumber) ? 'border-red-300 bg-red-50/30' : 
                     `border-gray-200 bg-white hover:border-gray-300 ${activeBorder} ${activeRing}`
            }`}
            placeholder="1"
            value={segment.ayahStart || ''}
            onChange={(e) => handleUpdate('ayahStart', e.target.value)}
          />
        </div>

        {/* Ayah End */}
        <div className="w-1/2 sm:w-[100px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            إلى آية <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={segment.ayahStart || 1}
            max={maxAyah}
            disabled={!segment.surahNumber}
            className={`w-full rounded-xl border-2 text-sm py-2.5 px-3 text-center transition-all outline-none 
                disabled:bg-gray-100 disabled:border-transparent disabled:text-gray-400
                ${
                !segment.ayahEnd && segment.surahNumber ? 'border-red-300 bg-red-50/30' : 
                `border-gray-200 bg-white hover:border-gray-300 ${activeBorder} ${activeRing}`
            }`}
            placeholder={maxAyah.toString()}
            value={segment.ayahEnd || ''}
            onChange={(e) => handleUpdate('ayahEnd', e.target.value)}
          />
        </div>

      </div>
      
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
