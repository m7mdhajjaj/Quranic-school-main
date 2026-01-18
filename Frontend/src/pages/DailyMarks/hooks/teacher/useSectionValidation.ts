import { useMemo } from 'react';
import { validateSectionConsistency, type QuranSegmentUI } from '@/Validation/DailyMark';

/**
 * ✅ V7 Compatible - UI validation hook
 * Provides quick feedback for consistency errors
 * Backend handles deeper date-aware validation via SectionSequenceService
 */
export const useSectionValidation = (
  memorizationMeta: QuranSegmentUI[] | undefined, 
  reviewMeta: QuranSegmentUI[] | undefined
) => {
  
  const consistencyErrors = useMemo(() => {
    // ✅ Don't show validation errors if both fields are empty
    // (Prevents errors on initial modal open)
    const hasMem = memorizationMeta && memorizationMeta.length > 0;
    const hasRev = reviewMeta && reviewMeta.length > 0;
    
    // Only validate if user has entered data
    if (!hasMem && !hasRev) {
      return [];
    }
    
    return validateSectionConsistency(memorizationMeta, reviewMeta);
  }, [memorizationMeta, reviewMeta]);

  const hasConsistencyErrors = consistencyErrors.length > 0;

  return {
    consistencyErrors,
    hasConsistencyErrors
  };
};
