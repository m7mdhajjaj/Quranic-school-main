// ============================================================================
// useSuspendedStudents - Hook لإدارة الطلاب المفصولين
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import * as warningApi from '@/Api/warningApi';
import type { SuspendedStudentsResponse, SuspendedStudent } from '../types/suspension';

export const useSuspendedStudents = (teacherId: string) => {
  const [suspendedStudents, setSuspendedStudents] = useState<SuspendedStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📥 جلب الطلاب المفصولين من حلقات المعلم
  const fetchSuspendedStudents = useCallback(async () => {
    if (!teacherId) return;

    setLoading(true);
    setError(null);

    try {
      const response: SuspendedStudentsResponse = await warningApi.getTeacherSuspendedStudents(teacherId);
      
      if (response.success) {
        setSuspendedStudents(response.all || []);
        console.log('✅ Suspended students loaded:', response.all?.length || 0);
      } else {
        setError('فشل في جلب الطلاب المفصولين');
      }
    } catch (err: any) {
      console.error('❌ Error fetching suspended students:', err);
      setError(err?.response?.data?.message || 'حدث خطأ أثناء جلب الطلاب المفصولين');
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  // 🔄 جلب البيانات عند تحميل المكون
  useEffect(() => {
    fetchSuspendedStudents();
  }, [fetchSuspendedStudents]);

  // 🔄 إعادة جلب البيانات (للاستخدام عند استقبال Socket events)
  const refetch = useCallback(() => {
    fetchSuspendedStudents();
  }, [fetchSuspendedStudents]);

  return {
    suspendedStudents,
    loading,
    error,
    refetch,
  };
};
