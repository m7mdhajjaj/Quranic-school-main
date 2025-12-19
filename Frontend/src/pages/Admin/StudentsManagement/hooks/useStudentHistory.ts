// ============================================================================
// useStudentHistory - Hook لإدارة تاريخ الطالب
// ============================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getStudentHistory } from '@/Api/studentApi';
import type { StudentHistoryEvent } from '@/types/studentHistory';

interface UseStudentHistoryOptions {
  studentId: string | null;
  isOpen: boolean;
  limit?: number;
}

export const useStudentHistory = ({ studentId, isOpen, limit = 100 }: UseStudentHistoryOptions) => {
  const [history, setHistory] = useState<StudentHistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getStudentHistory(studentId, { limit });
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching student history:', err);
      setError('فشل تحميل التاريخ');
    } finally {
      setLoading(false);
    }
  }, [studentId, limit]);

  // جلب التاريخ عند الفتح
  useEffect(() => {
    if (isOpen && studentId) {
      fetchHistory();
    }
  }, [isOpen, studentId, fetchHistory]);

  // حساب حالة الفصل
  const isExpelled = useMemo(
    () =>
      history.some(
        (event) =>
          event.eventType === 'EXPULSION' &&
          !history.some((e) => e.eventType === 'RESTORATION' && new Date(e.createdAt) > new Date(event.createdAt))
      ),
    [history]
  );

  // جلب آخر حدث فصل
  const lastExpulsion = useMemo(
    () =>
      history
        .filter((e) => e.eventType === 'EXPULSION')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0],
    [history]
  );

  // إحصائيات سريعة
  const stats = useMemo(
    () => ({
      total: history.length,
      warnings: history.filter((e) => e.eventType === 'WARNING').length,
      groupChanges: history.filter((e) => e.eventType === 'GROUP_CHANGE').length,
      expulsions: history.filter((e) => e.eventType === 'EXPULSION').length,
      restorations: history.filter((e) => e.eventType === 'RESTORATION').length,
    }),
    [history]
  );

  return {
    history,
    loading,
    error,
    isExpelled,
    lastExpulsion,
    stats,
    refetch: fetchHistory,
  };
};
