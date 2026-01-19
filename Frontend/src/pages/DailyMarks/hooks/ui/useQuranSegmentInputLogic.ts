import { useState, useRef, useEffect } from "react";
import { quranSurahs } from "@/data/quranSurahs";
import { getLastSegment } from "@/Api/DailyMark/sectionApi";
import { getActiveSurahInfo } from "@/Api/DailyMark/activeSurahApi";
import { normalizeText } from "@/pages/DailyMarks/utils/normalizeText";
import type { QuranSegmentUI } from "../types/types";

export function useQuranSegmentInputLogic({ segments = [], groupName, type, onChange, excludeId, date, groupId }: {
  segments?: QuranSegmentUI[];
  groupName?: string;
  type?: 'memorization' | 'review';
  onChange: (segments: QuranSegmentUI[]) => void;
  excludeId?: string;
  date?: string;
  groupId?: string; // ✅ V10: للتحقق من Active Surah
}) {
  const segment: QuranSegmentUI = segments[0] || { surahNumber: undefined, ayahStart: undefined, ayahEnd: undefined } as QuranSegmentUI;
  const [surahInput, setSurahInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof quranSurahs>([]);
  const [expectedStart, setExpectedStart] = useState<number | null>(null);
  const [reviewLimit, setReviewLimit] = useState<number | null>(null);
  const [noMemorizationError, setNoMemorizationError] = useState<string | null>(null);
  // ✅ V10: Active Surah validation error
  const [activeSurahError, setActiveSurahError] = useState<string | null>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (segment.surahNumber && !isInternalUpdate.current) {
      const found = quranSurahs.find(s => s.number === segment.surahNumber);
      if (found) setSurahInput(found.name);
    } else if (!segment.surahNumber && !isFocused) {
      setSurahInput('');
    }
    if (isInternalUpdate.current) isInternalUpdate.current = false;
  }, [segment.surahNumber, isFocused]);

  // ✅ V10: التحقق من Active Surah عند اختيار سورة جديدة
  useEffect(() => {
    if (!groupId || !segment.surahNumber || !type) {
      setActiveSurahError(null);
      return;
    }

    // جلب معلومات Active Surah
    getActiveSurahInfo(groupId).then(response => {
      if (!response.success || !response.data) {
        setActiveSurahError(null);
        return;
      }

      // ✅ V10 FIX: البيانات تُرجع مباشرة وليس داخل activeSurah
      const typeData = type === 'memorization' ? response.data.memorization : response.data.review;
      
      // التحقق من وجود سورة فعالة
      if (typeData && typeData.isActive && typeData.surahNumber !== segment.surahNumber) {
        const typeLabel = type === 'memorization' ? 'حفظ' : 'مراجعة';
        setActiveSurahError(
          `يجب إكمال ${typeLabel} سورة ${typeData.surahName} أولاً (وصلت للآية ${typeData.lastAyahEnd} من ${typeData.totalAyahs}) قبل البدء بسورة جديدة.`
        );
      } else {
        setActiveSurahError(null);
      }
    }).catch((err) => {
      console.error('Error checking active surah:', err);
      setActiveSurahError(null);
    });
  }, [groupId, segment.surahNumber, type]);

  useEffect(() => {
    if (groupName && (type === 'memorization' || type === 'review') && segment.surahNumber) {
      
      // Use the actual type to get specific suggestions (Strict Mode)
      // ✅ V9: Pass date to ensure review suggestions respect the selected date (exclude same day)
      getLastSegment(groupName, segment.surahNumber, type, excludeId, date).then(suggestion => {
        if (suggestion) {
          const nextStart = suggestion.nextStart || 1;
          
          if (type === 'memorization') {
              setExpectedStart(nextStart);
              setReviewLimit(null);
              setNoMemorizationError(null);
          } else if (type === 'review') {
              // ✅ V9: Review ALWAYS starts from 1
              setExpectedStart(1); // Always 1 for review
              // API now returns maxMemorized specifically for review context
              const maxMem = suggestion.maxMemorized || 0;
              setReviewLimit(maxMem > 0 ? maxMem : null);
              
              // ✅ V9: Auto-fill the range for review
              if (maxMem > 0) {
                const autoSegment: QuranSegmentUI = {
                  ...segment,
                  ayahStart: 1,
                  ayahEnd: maxMem
                };
                onChange([autoSegment]);
                setNoMemorizationError(null);
              } else {
                // ✅ V9: Check if no memorization exists for this surah BEFORE this date
                const surahName = quranSurahs.find(s => s.number === segment.surahNumber)?.name || segment.surahNumber;
                setNoMemorizationError(`⚠️ لا يوجد حفظ سابق لسورة ${surahName} قبل هذا التاريخ. يجب حفظ السورة أولاً ثم مراجعتها في يوم لاحق.`);
              }
          }
        } else {
          setExpectedStart(type === 'review' ? 1 : 1); // ✅ V9: Always 1 for review
          setReviewLimit(null);
          // ✅ V9: No suggestion means no memorization for review
          if (type === 'review') {
            const surahName = quranSurahs.find(s => s.number === segment.surahNumber)?.name || segment.surahNumber;
            setNoMemorizationError(`⚠️ لا يوجد حفظ سابق لسورة ${surahName} قبل هذا التاريخ. يجب حفظ السورة أولاً ثم مراجعتها في يوم لاحق.`);
          } else {
            setNoMemorizationError(null);
          }
        }
      }).catch(() => {
        setExpectedStart(null);
        setReviewLimit(null);
        setNoMemorizationError(null);
      });
    } else {
      setExpectedStart(null);
      setReviewLimit(null);
      setNoMemorizationError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment.surahNumber, groupName, type, excludeId, date]);

  const handleUpdate = (field: keyof QuranSegmentUI, value: number | string, surahData?: { number: number, name: string }) => {
    let newSegment: QuranSegmentUI = { ...segment };
    if (field === 'surahNumber') {
      const numValue = Number(value);
      isInternalUpdate.current = true;
      if (!numValue || !surahData) {
        onChange([]);
        setExpectedStart(null);
        return;
      }
      const fullSurahData = quranSurahs.find(s => s.number === numValue);
      newSegment = {
        surahNumber: numValue,
        surahNameCanonical: surahData.name,
        ayahStart: 1,
        ayahEnd: fullSurahData ? fullSurahData.ayahCount : undefined
      };
      setExpectedStart(null);
      setReviewLimit(null);
      onChange([newSegment]);
      
      if (groupName && (type === 'memorization' || type === 'review')) {
        
        getLastSegment(groupName, numValue, type, excludeId, date).then(suggestion => {
          if (suggestion) {
            const nextStart = suggestion.nextStart || 1;
            
             if (type === 'memorization') {
                 setExpectedStart(nextStart);
                 setReviewLimit(null);
                 
                 // Auto fill for memorization
                 if (suggestion.nextStart && suggestion.nextStart > 1) {
                   const updatedSegment = { ...newSegment, ayahStart: suggestion.nextStart };
                   onChange([updatedSegment]);
                 }
             } else {
                 // ✅ V9: Review always starts from 1
                 setExpectedStart(1);
                 const maxMem = suggestion.maxMemorized || 0;
                 setReviewLimit(maxMem > 0 ? maxMem : null);
                 
                 // ✅ V9: Auto fill for review (locked range)
                 if (maxMem > 0) {
                   const updatedSegment = { 
                     ...newSegment, 
                     ayahStart: 1,  // Always 1
                     ayahEnd: maxMem  // Auto-determined by backend
                   };
                   onChange([updatedSegment]);
                   setNoMemorizationError(null);
                 } else {
                   const surahName = quranSurahs.find(s => s.number === numValue)?.name || numValue;
                   setNoMemorizationError(`⚠️ لا يوجد حفظ سابق لسورة ${surahName} قبل هذا التاريخ.`);
                 }
             }

          } else {
            setExpectedStart(1);
            setReviewLimit(null);
            
            if (type === 'review') {
              const surahName = quranSurahs.find(s => s.number === numValue)?.name || numValue;
              setNoMemorizationError(`⚠️ لا يوجد حفظ سابق لسورة ${surahName} قبل هذا التاريخ.`);
            }
          }
        }).catch(() => {
          setExpectedStart(null);
          setReviewLimit(null);
        });
      }
      return;
    } else {
      // فقط الحقول الرقمية يتم تحويلها إلى رقم
      if (field === 'ayahStart' || field === 'ayahEnd') {
        newSegment[field] = typeof value === 'string' ? Number(value) : value;
      } else {
        // فقط الحقول النصية يتم تعيينها كنص
        if (field === 'surahNameCanonical') {
          newSegment[field] = typeof value === 'string' ? value : String(value);
        }
      }
    }
    onChange([newSegment]);
  };

  const handleInputChange = (val: string) => {
    setSurahInput(val);
    isInternalUpdate.current = true;
    if (!val) {
      setSuggestions([]);
      if (segment.surahNumber) onChange([]);
      return;
    }
    const normalizedVal = normalizeText(val);
    const matches = quranSurahs.filter(s => {
      const normName = normalizeText(s.name);
      if (normName.startsWith(normalizedVal)) return true;
      if (normName.includes(normalizedVal)) return true;
      return false;
    }).slice(0, 5);
    setSuggestions(matches);
  };

  const selectSurah = (s: typeof quranSurahs[0]) => {
    setSurahInput(s.name);
    setSuggestions([]);
    handleUpdate('surahNumber', s.number, { number: s.number, name: s.name });
  };

  const handleClear = () => {
    setSurahInput('');
    setSuggestions([]);
    setIsFocused(false);
    setExpectedStart(null);
    setReviewLimit(null);
    isInternalUpdate.current = true;
    onChange([]);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      if (!surahInput) {
        if (segment.surahNumber) onChange([]);
        return;
      }
      const currentSurah = quranSurahs.find(s => s.number === segment.surahNumber);
      if (currentSurah && normalizeText(surahInput) === normalizeText(currentSurah.name)) {
        setSurahInput(currentSurah.name);
        return;
      }
      const fullMatch = quranSurahs.find(s => normalizeText(s.name) === normalizeText(surahInput));
      if (fullMatch) {
        selectSurah(fullMatch);
      } else {
        if (segment.surahNumber) onChange([]);
      }
    }, 200);
  };

  const currentSurah = quranSurahs.find(s => s.number === segment.surahNumber);
  const maxAyah = currentSurah ? currentSurah.ayahCount : 999;

  return {
    surahInput,
    setSurahInput,
    isFocused,
    setIsFocused,
    suggestions,
    setSuggestions,
    expectedStart,
    setExpectedStart,
    reviewLimit,
    setReviewLimit,
    noMemorizationError,
    activeSurahError, // ✅ V10: Active Surah validation error
    handleUpdate,
    handleInputChange,
    selectSurah,
    handleClear,
    handleBlur,
    currentSurah,
    maxAyah,
    segment,
  };
}
