import { useState, useRef, useEffect } from "react";
import { quranSurahs } from "@/data/quranSurahs";
import { getLastSegment } from "@/Api/DailyMark/sectionApi";
import { normalizeText } from "@/pages/DailyMarks/utils/normalizeText";
import type { QuranSegmentUI } from "../types/types";

export function useQuranSegmentInputLogic({ segments = [], groupName, type, onChange, excludeId, date }: {
  segments?: QuranSegmentUI[];
  groupName?: string;
  type?: 'memorization' | 'review';
  onChange: (segments: QuranSegmentUI[]) => void;
  excludeId?: string;
  date?: string;
}) {
  const segment: QuranSegmentUI = segments[0] || { surahNumber: undefined, ayahStart: undefined, ayahEnd: undefined } as QuranSegmentUI;
  const [surahInput, setSurahInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof quranSurahs>([]);
  const [expectedStart, setExpectedStart] = useState<number | null>(null);
  const [reviewLimit, setReviewLimit] = useState<number | null>(null);
  const [noMemorizationError, setNoMemorizationError] = useState<string | null>(null);
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

  useEffect(() => {
    if (groupName && (type === 'memorization' || type === 'review') && segment.surahNumber) {
      
      // Use the actual type to get specific suggestions (Strict Mode)
      // ✅ V8: Pass date to ensure review suggestions respect the selected date (exclude same day)
      getLastSegment(groupName, segment.surahNumber, type, excludeId, date).then(suggestion => {
        if (suggestion) {
          const nextStart = suggestion.nextStart || 1;
          
          if (type === 'memorization') {
              setExpectedStart(nextStart);
              setReviewLimit(null);
              setNoMemorizationError(null);
          } else if (type === 'review') {
              // For review: nextStart is the start of the next review cycle
              setExpectedStart(nextStart); 
              // API now returns maxMemorized specifically for review context
              const maxMem = suggestion.maxMemorized || 0;
              setReviewLimit(maxMem > 0 ? maxMem : null);
              
              // ✅ V8: Check if no memorization exists for this surah
              if (maxMem === 0) {
                const surahName = quranSurahs.find(s => s.number === segment.surahNumber)?.name || segment.surahNumber;
                setNoMemorizationError(`⚠️ لا يوجد حفظ سابق لسورة ${surahName}. يجب حفظ السورة أولاً قبل مراجعتها.`);
              } else {
                setNoMemorizationError(null);
              }
          }
        } else {
          setExpectedStart(1);
          setReviewLimit(null);
          // ✅ V8: No suggestion means no memorization for review
          if (type === 'review') {
            const surahName = quranSurahs.find(s => s.number === segment.surahNumber)?.name || segment.surahNumber;
            setNoMemorizationError(`⚠️ لا يوجد حفظ سابق لسورة ${surahName}. يجب حفظ السورة أولاً قبل مراجعتها.`);
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
        
        getLastSegment(groupName, numValue, type, excludeId).then(suggestion => {
          if (suggestion) {
            const nextStart = suggestion.nextStart || 1;
            
             if (type === 'memorization') {
                 setExpectedStart(nextStart);
                 setReviewLimit(null);
             } else {
                 setExpectedStart(nextStart); // Suggest next review cycle start
                 setReviewLimit(suggestion.maxMemorized || null);
             }
            
            // Auto fill Logic
            let updated = false;
            let updatedSegment = { ...newSegment };

            // 1. Auto-fill Start
            if (suggestion.nextStart) {
                updatedSegment.ayahStart = suggestion.nextStart;
                updated = true;
            }
            
            // 2. Auto-fill End (Strict Matching)
            if (type === 'review' && suggestion.suggestedEnd) {
                 updatedSegment.ayahEnd = suggestion.suggestedEnd;
                 updated = true;
            } else if (type === 'review' && !suggestion.suggestedEnd) {
                 if (suggestion.maxMemorized && suggestion.maxMemorized < 9999) {
                     // ✅ V8: Always default to maxMemorized for easier bulk review
                     updatedSegment.ayahEnd = suggestion.maxMemorized;
                     updated = true;
                 }
            }
            
            if (updated) {
                 onChange([updatedSegment]);
            }

          } else {
            setExpectedStart(1);
            setReviewLimit(null);
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
