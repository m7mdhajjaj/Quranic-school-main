// ============================================================================
// useGroupStatistics Hook - جلب إحصائيات الحلقة من Backend
// ============================================================================

import { useState, useCallback } from 'react';
import * as warningApi from '@/Api/warningApi';

export interface GroupStatistics {
  groupName: string;
  totalStudents: number;
  studentsWithWarnings: number;
  totalWarnings: number;
  warningsByType: {
    warning: number;
    first: number;
    second: number;
    third: number;
    expulsion: number;
  };
  topStudents: Array<{
    name: string;
    warningsCount: number;
  }>;
  studentsDetails?: Array<{
    _id: string;
    name: string;
    warningsCount: number;
    warningsOnlyCount: number;
    existingWarningTypes: string[];
  }>;
}

export const useGroupStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ جلب إحصائيات الحلقة من Backend
  const fetchGroupStatistics = useCallback(async (groupId: string): Promise<GroupStatistics | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await warningApi.getGroupStatistics(groupId);
      return data;
    } catch (err) {
      console.error('Error fetching group statistics:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        : 'حدث خطأ أثناء جلب الإحصائيات';
      setError(errorMessage || 'حدث خطأ أثناء جلب الإحصائيات');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchGroupStatistics, loading, error };
};
