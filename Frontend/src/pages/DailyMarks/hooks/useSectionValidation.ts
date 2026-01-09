import { useMemo } from 'react';
import type { QuranSegmentUI } from '../types/types';
import { validateSectionConsistency } from '../utils/validationLogic';

export const useSectionValidation = (
  memorizationMeta: QuranSegmentUI[] | undefined, 
  reviewMeta: QuranSegmentUI[] | undefined
) => {
  
  const consistencyErrors = useMemo(() => {
    return validateSectionConsistency(memorizationMeta, reviewMeta);
  }, [memorizationMeta, reviewMeta]);

  const hasConsistencyErrors = consistencyErrors.length > 0;

  return {
    consistencyErrors,
    hasConsistencyErrors
  };
};
