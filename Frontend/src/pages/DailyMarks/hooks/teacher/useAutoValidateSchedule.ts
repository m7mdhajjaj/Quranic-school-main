/**
 * ============================================================================
 * useAutoValidateSchedule Hook (V7 - Simplified)
 * ============================================================================
 * 
 * V7: Backend handles all validation via SectionSequenceService
 * This hook now only validates date format on frontend
 * 
 * Full validation rules in Backend:
 * - Current week only (Sat-Fri)
 * - Daily/Weekly quotas
 * - Flexible review ranges
 * - Review max boundary
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { validateDateFormat } from '@/Validation/DailyMark';

export interface SegmentData {
  surahNumber: number;
  ayahStart: number;
  ayahEnd: number;
}

export interface AlternativeDateOption {
  date: string;
  dateKey: string;
  dayName: string;
  weekNumber: number;
  isPreferred: boolean;
  reason: string;
}

export const useAutoValidateSchedule = (
  _groupId: string | undefined,
  _segments: SegmentData[],
  date: string | undefined,
  debounceMs: number = 600
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [allValid, setAllValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [suggestedAlternatives] = useState<AlternativeDateOption[]>([]);
  const [suggestedAlternative] = useState<{
    date: string;
    dateKey: string;
    dayName?: string;
    weekNumber?: number;
    reason: string;
  } | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // ✅ لا تحقق إذا لم يكن هناك تاريخ
    if (!date) {
      setAllValid(true);
      setValidationErrors([]);
      setIsValidating(false);
      return;
    }

    // ✅ فقط تحقق من صيغة التاريخ
    debounceRef.current = setTimeout(async () => {
      setIsValidating(true);

      // V7: Just validate date format locally
      const isValid = await validateDateFormat(date);
      setAllValid(isValid);
      setValidationErrors(isValid ? [] : ['صيغة التاريخ غير صحيحة (YYYY-MM-DD)']);
      setIsValidating(false);
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, debounceMs]);

  const clearValidation = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setAllValid(true);
    setValidationErrors([]);
    setIsValidating(false);
  }, []);

  return {
    isValidating,
    allValid,
    validationErrors,
    suggestedAlternatives,
    suggestedAlternative,
    clearValidation,
  };
};
