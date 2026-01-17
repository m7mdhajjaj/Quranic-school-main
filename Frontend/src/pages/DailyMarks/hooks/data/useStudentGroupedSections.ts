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
    console.log('🔍 [useStudentGroupedSections] Starting fetch...');
    console.log('🔍 studentId:', studentId);
    console.log('🔍 groupId:', groupId);

    if (!studentId) {
      console.log('❌ No studentId provided, skipping fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Calling getStudentSectionsGrouped API...');
      const response = await getStudentSectionsGrouped(studentId, groupId);
      console.log('📡 API Response:', response);

      if (response.success && response.data) {
        console.log('✅ Success! Surahs count:', response.data.surahs?.length);
        console.log('✅ Surahs:', response.data.surahs);
        console.log('✅ Summary:', response.data.summary);
        setSurahs(response.data.surahs);
        setSummary(response.data.summary);
      } else {
        console.log('❌ API returned error:', response.error);
        setError(response.error || 'فشل في جلب المقاطع');
        setSurahs([]);
        setSummary(null);
      }
    } catch (err) {
      console.error('❌ Error in useStudentGroupedSections:', err);
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
