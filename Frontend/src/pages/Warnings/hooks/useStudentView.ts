// ============================================================================
// useStudentView Hook - منطق عرض الطالب
// ============================================================================

import { useMemo } from 'react';
import type { Warning } from '../types/warnings';

interface UseStudentViewProps {
  warnings: Warning[];
}

export const useStudentView = ({ warnings }: UseStudentViewProps) => {
  // ===== Computed Values =====
  const hasWarnings = useMemo(() => 
    warnings.length > 0, 
    [warnings.length]
  );

  const warningsCount = useMemo(() => 
    warnings.length, 
    [warnings.length]
  );

  const warningsByType = useMemo(() => {
    const types = {
      warning: 0,
      first: 0,
      second: 0,
      third: 0,
    };
    
    warnings.forEach(w => {
      if (w.type in types) {
        types[w.type as keyof typeof types]++;
      }
    });
    
    return types;
  }, [warnings]);

  return {
    hasWarnings,
    warningsCount,
    warningsByType,
  };
};
