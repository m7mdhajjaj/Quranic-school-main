import { useState, useEffect, useCallback } from 'react';
import { getStudentSectionsGrouped } from '@/Api/DailyMark/studentGroupedSectionsApi';
import type { GroupedSurah, StudentGroupedSectionsResponse, TimeFilterParams } from '@/Api/DailyMark/studentGroupedSectionsApi';

interface UseStudentGroupedSectionsReturn {
  surahs: GroupedSurah[];
  summary: StudentGroupedSectionsResponse['summary'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setTimeFilter: (params: TimeFilterParams) => void;
  timeFilterParams: TimeFilterParams;
}

/**
 * Hook to fetch student sections grouped by Surah
 * ✅ مع دعم فلتر الفترة الزمنية
 */
export const useStudentGroupedSections = (
  studentId: string | undefined,
  groupId?: string,
  initialTimeFilter?: TimeFilterParams
): UseStudentGroupedSectionsReturn => {
  const [surahs, setSurahs] = useState<GroupedSurah[]>([]);
  const [summary, setSummary] = useState<StudentGroupedSectionsResponse['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilterParams, setTimeFilterParams] = useState<TimeFilterParams>(
    initialTimeFilter || { timeFilter: 'all' }
  );

  const fetchData = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getStudentSectionsGrouped(studentId, groupId, timeFilterParams);

      if (response.success && response.data) {
        setSurahs(response.data.surahs);
        setSummary(response.data.summary);
      } else {
        setError(response.error || 'فشل في جلب المقاطع');
        setSurahs([]);
        setSummary(null);
      }
    } catch {
      setError('حدث خطأ غير متوقع');
      setSurahs([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [studentId, groupId, timeFilterParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setTimeFilter = useCallback((params: TimeFilterParams) => {
    setTimeFilterParams(params);
  }, []);

  return {
    surahs,
    summary,
    loading,
    error,
    refetch: fetchData,
    setTimeFilter,
    timeFilterParams,
  };
};
