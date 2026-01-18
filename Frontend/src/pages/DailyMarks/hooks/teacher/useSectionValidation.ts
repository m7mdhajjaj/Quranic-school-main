/**
 * ============================================================================
 * useSectionValidation Hook (V8 - Simplified)
 * ============================================================================
 * 
 * V8: Backend handles ALL validation via SectionSequenceService
 * Frontend no longer validates - just returns empty errors
 * 
 * All validation rules handled by Backend:
 * - Consistency (same segment memorization + review)
 * - Monotonic order
 * - Quotas
 * - Review limits
 */

import { useMemo } from 'react';
import { type QuranSegmentUI } from '@/Validation/DailyMark';

export const useSectionValidation = (
  _memorizationMeta: QuranSegmentUI[] | undefined, 
  _reviewMeta: QuranSegmentUI[] | undefined
) => {
  
  // ✅ V8: Backend handles all validation - Frontend returns empty
  const consistencyErrors = useMemo(() => [], []);
  const hasConsistencyErrors = false;

  return {
    consistencyErrors,
    hasConsistencyErrors
  };
};
