import { useState, useCallback, useRef, useEffect } from 'react';
import * as yup from 'yup';
import { 
  validateBeforeInsert, 
  validateAndAutoFix,
  suggestSingleDate, 
  type ValidateBeforeInsertResponse, 
  type ValidateAndAutoFixResponse,
  type SuggestSingleDateResponse 
} from '@/Api/DailyMark/schedulerApi';

// ✅ Yup Schema for date validation
const dateSchema = yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ غير صحيحة (YYYY-MM-DD)');

/**
 * ============================================================================
 * useSchedulerValidation Hook
 * ============================================================================
 * Hook للتحقق من صلاحية التاريخ وترتيب الآيات قبل الإدراج
 * 
 * القاعدة الذهبية: date1 < date2 ⟹ ayahStart1 ≤ ayahStart2
 * 
 * يمنع حالات مثل:
 * - تاريخ 10/1 → آيات 50-60
 * - تاريخ 11/1 → آيات 11-20 ❌ (تاريخ أحدث لكن آيات أقدم)
 */

export interface SchedulerValidationState {
  isValidating: boolean;
  validationResult: ValidateBeforeInsertResponse['validation'] | null;
  suggestedDate: SuggestSingleDateResponse['suggestion'] | null;
  error: string | null;
}

export interface SchedulerValidationActions {
  validateSegment: (
    groupId: string,
    surahNumber: number,
    ayahStart: number,
    ayahEnd: number,
    proposedDate: string
  ) => Promise<boolean>;
  getSuggestedDate: (
    groupId: string,
    surahNumber: number,
    ayahStart: number,
    ayahEnd?: number
  ) => Promise<SuggestSingleDateResponse['suggestion'] | null>;
  clearValidation: () => void;
}

export const useSchedulerValidation = (debounceMs: number = 500): [SchedulerValidationState, SchedulerValidationActions] => {
  const [state, setState] = useState<SchedulerValidationState>({
    isValidating: false,
    validationResult: null,
    suggestedDate: null,
    error: null,
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  /**
   * التحقق من صلاحية مقطع معين مع تاريخ معين
   */
  const validateSegment = useCallback(async (
    groupId: string,
    surahNumber: number,
    ayahStart: number,
    ayahEnd: number,
    proposedDate: string
  ): Promise<boolean> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const result = await validateBeforeInsert(groupId, surahNumber, ayahStart, ayahEnd, proposedDate);
      
      setState(prev => ({
        ...prev,
        isValidating: false,
        validationResult: result.validation,
        error: null,
      }));

      return result.validation.isValid;
    } catch (err: any) {
      if (err.name === 'AbortError') return false;
      
      setState(prev => ({
        ...prev,
        isValidating: false,
        error: err.response?.data?.message || 'خطأ في التحقق',
      }));
      return false;
    }
  }, []);

  /**
   * الحصول على تاريخ مقترح لمقطع
   */
  const getSuggestedDate = useCallback(async (
    groupId: string,
    surahNumber: number,
    ayahStart: number,
    ayahEnd?: number
  ): Promise<SuggestSingleDateResponse['suggestion'] | null> => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const result = await suggestSingleDate(groupId, surahNumber, ayahStart, ayahEnd);
      
      setState(prev => ({
        ...prev,
        isValidating: false,
        suggestedDate: result.suggestion || null,
        error: result.success ? null : result.message || null,
      }));

      return result.suggestion || null;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isValidating: false,
        error: err.response?.data?.message || 'خطأ في اقتراح التاريخ',
      }));
      return null;
    }
  }, []);

  /**
   * مسح نتائج التحقق
   */
  const clearValidation = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setState({
      isValidating: false,
      validationResult: null,
      suggestedDate: null,
      error: null,
    });
  }, []);

  return [state, { validateSegment, getSuggestedDate, clearValidation }];
};

/**
 * ============================================================================
 * useAutoValidateSchedule Hook
 * ============================================================================
 * Hook للتحقق التلقائي عند تغيير البيانات (مع debounce)
 */
export interface SegmentData {
  surahNumber: number;
  ayahStart: number;
  ayahEnd: number;
}

export const useAutoValidateSchedule = (
  groupId: string | undefined,
  segments: SegmentData[],
  date: string | undefined,
  debounceMs: number = 600
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [allValid, setAllValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [suggestedAlternative, setSuggestedAlternative] = useState<{
    date: string;
    dateKey: string;
    reason: string;
  } | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Skip if missing data
    if (!groupId || !date || segments.length === 0) {
      setAllValid(true);
      setValidationErrors([]);
      setSuggestedAlternative(null);
      return;
    }

    // Filter valid segments
    const validSegments = segments.filter(
      s => s.surahNumber && s.ayahStart && s.ayahEnd && s.ayahStart <= s.ayahEnd
    );

    if (validSegments.length === 0) {
      setAllValid(true);
      setValidationErrors([]);
      setSuggestedAlternative(null);
      return;
    }

    // Debounce the validation
    debounceRef.current = setTimeout(async () => {
      setIsValidating(true);
      const errors: string[] = [];
      let isAllValid = true;
      let lastSuggestion: typeof suggestedAlternative = null;

      // ✅ Validate date format with Yup first
      try {
        await dateSchema.validate(date);
      } catch (yupError: any) {
        setAllValid(false);
        setValidationErrors([yupError.message]);
        setSuggestedAlternative(null);
        setIsValidating(false);
        return;
      }

      try {
        for (const seg of validSegments) {
          // ✅ V7: استخدام validateBeforeInsert المحسّنة
          const result = await validateBeforeInsert(
            groupId,
            seg.surahNumber,
            seg.ayahStart,
            seg.ayahEnd,
            date
          );

          if (!result.validation.isValid) {
            isAllValid = false;
            if (result.validation.reason) {
              errors.push(result.validation.reason);
            }
            if (result.validation.suggestedAlternative) {
              lastSuggestion = result.validation.suggestedAlternative;
            }
          }
        }
      } catch (err: any) {
        console.error('Schedule validation error:', err);
        // Don't block on API errors, just log
      }

      setAllValid(isAllValid);
      setValidationErrors(errors);
      setSuggestedAlternative(lastSuggestion);
      setIsValidating(false);
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [groupId, JSON.stringify(segments), date, debounceMs]);

  const clearValidation = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setAllValid(true);
    setValidationErrors([]);
    setSuggestedAlternative(null);
    setIsValidating(false);
  }, []);

  return {
    isValidating,
    allValid,
    validationErrors,
    suggestedAlternative,
    clearValidation,
  };
};
/**
 * ============================================================================
 * useValidateWithAutoFix Hook
 * ============================================================================
 * Hook محسن للتحقق من صلاحية التاريخ مع اقتراح بديل تلقائي
 * يستخدم validateAndAutoFix بدلاً من validateBeforeInsert للحصول على
 * معلومات أكثر تفصيلاً عن constraints
 */
export const useValidateWithAutoFix = (debounceMs: number = 500) => {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidateAndAutoFixResponse['validation'] | null>(null);
  const [debugInfo, setDebugInfo] = useState<ValidateAndAutoFixResponse['debugInfo'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  /**
   * التحقق من صلاحية مقطع مع إصلاح تلقائي
   */
  const validateWithAutoFix = useCallback(async (
    groupId: string,
    surahNumber: number,
    ayahStart: number,
    ayahEnd: number,
    proposedDate: string
  ): Promise<ValidateAndAutoFixResponse['validation'] | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Validate date format first
    try {
      await dateSchema.validate(proposedDate);
    } catch (yupError: any) {
      setError(yupError.message);
      return null;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await validateAndAutoFix(
        groupId,
        surahNumber,
        ayahStart,
        ayahEnd,
        proposedDate
      );

      setResult(response.validation);
      setDebugInfo(response.debugInfo || null);
      setIsValidating(false);

      return response.validation;
    } catch (err: any) {
      if (err.name === 'AbortError') return null;

      setError(err.response?.data?.message || 'خطأ في التحقق');
      setIsValidating(false);
      return null;
    }
  }, []);

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsValidating(false);
    setResult(null);
    setDebugInfo(null);
    setError(null);
  }, []);

  return {
    isValidating,
    result,
    debugInfo,
    error,
    validateWithAutoFix,
    clear,
    // Helper computed values
    isValid: result?.isValid ?? true,
    hasAlternative: !!result?.suggestedAlternative,
    alternativeDate: result?.suggestedAlternative?.date || null,
    alternativeReason: result?.suggestedAlternative?.reason || null,
  };
};