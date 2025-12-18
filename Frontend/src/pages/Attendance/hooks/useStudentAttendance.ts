// ============================================================================
// useStudentAttendance - Hook موحد لإدارة حضور الطالب
// ============================================================================
// دمج fetchStudentAbsenceStats + processing

import { useState, useCallback } from 'react';
import { getStudentAttendance } from '@/Api/attendanceApi';
import { useMonthlyStatsProcessor } from './useMonthlyStatsProcessor';
import type { MonthlyAbsence } from '../types/absence.types';

export const useStudentAttendance = () => {
  const [records, setRecords] = useState<Array<{ date: string; isPresent: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // معالجة السجلات لإحصائيات شهرية (مع memoization)
  const monthlyStats = useMonthlyStatsProcessor(records);

  const fetchStats = useCallback(async (studentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getStudentAttendance(studentId);
      
      // تحويل البيانات للشكل المطلوب
      const formattedRecords = data.map((r: any) => ({
        date: r.date,
        isPresent: r.isPresent,
      }));

      setRecords(formattedRecords);
    } catch (err) {
      console.error('❌ خطأ في جلب إحصائيات الغياب:', err);
      setError('تعذر جلب إحصائيات الغياب');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    monthlyStats,
    isLoading,
    error,
    fetchStats,
  };
};
