/**
 * ============================================================================
 * useAutoValidateSchedule Hook (V7 - Simplified)
 * ============================================================================
 * 
 * V7: Backend handles all validation via SectionSequenceService
 * Frontend no longer needs to validate - just return valid state
 * 
 * Full validation rules in Backend:
 * - Current week only (Sat-Fri)
 * - Daily/Weekly quotas
 * - Flexible review ranges
 * - Review max boundary
 */

import { useState, useCallback } from 'react';

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
  _date: string | undefined,
  _debounceMs: number = 600
) => {
  // ✅ V7: Backend handles all validation - Frontend always returns valid
  const [isValidating] = useState(false);
  const [allValid] = useState(true);
  const [validationErrors] = useState<string[]>([]);
  const [suggestedAlternatives] = useState<AlternativeDateOption[]>([]);
  const [suggestedAlternative] = useState<{
    date: string;
    dateKey: string;
    dayName?: string;
    weekNumber?: number;
    reason: string;
  } | null>(null);

  const clearValidation = useCallback(() => {
    // No-op since we don't track validation state anymore
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
