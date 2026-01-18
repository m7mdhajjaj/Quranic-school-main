import { useState, useEffect } from 'react';
import { getStudentSectionsGrouped } from '@/Api/DailyMark/studentGroupedSectionsApi';
import type { GroupedSurah, StudentGroupedSectionsResponse } from '@/Api/DailyMark/studentGroupedSectionsApi';

interface UseStudentGroupedSectionsReturn {
  surahs: GroupedSurah[];
  summary: StudentGroupedSectionsResponse['summary'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch student sections grouped by Surah
 */
export const useStudentGroupedSections = (
  studentId: string | undefined,
  groupId?: string
): UseStudentGroupedSectionsReturn => {
  const [surahs, setSurahs] = useState<GroupedSurah[]>([]);
  const [summary, setSummary] = useState<StudentGroupedSectionsResponse['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getStudentSectionsGrouped(studentId, groupId);

      if (response.success && response.data) {
        setSurahs(response.data.surahs);
        setSummary(response.data.summary);
      } else {
        setError(response.error || 'فشل في جلب المقاطع');
        setSurahs([]);
        setSummary(null);
      }
    } catch (err) {
      console.error('Error in useStudentGroupedSections:', err);
      setError('حدث خطأ غير متوقع');
      setSurahs([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId, groupId]);

  return {
    surahs,
    summary,
    loading,
    error,
    refetch: fetchData,
  };
};
