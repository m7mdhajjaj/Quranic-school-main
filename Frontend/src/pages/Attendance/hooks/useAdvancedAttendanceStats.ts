import { useState, useCallback } from 'react';
import { getAdvancedAttendanceStats, getFilteredAttendanceStats } from '@/Api/attendanceApi';
import type { 
  AdvancedStatsRequest, 
  AdvancedStatsResponse,
  FilteredStatsRequest,
  FilteredStatsResponse 
} from '@/Api/attendanceApi';

/**
 * Hook لحساب الإحصائيات المتقدمة من الـ Backend
 * يستبدل الحسابات التي كانت تتم في Frontend
 */
export const useAdvancedAttendanceStats = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * حساب إحصائيات متقدمة لمجموعة من الطلاب
   */
  const calculateAdvancedStats = useCallback(
    async (request: AdvancedStatsRequest): Promise<AdvancedStatsResponse['data'] | null> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('📊 [Advanced Stats Hook] جلب الإحصائيات من Backend...');
        const response = await getAdvancedAttendanceStats(request);

        if (!response.success) {
          throw new Error(response.message || 'فشل في حساب الإحصائيات');
        }

        console.log('✅ [Advanced Stats Hook] تم الحصول على الإحصائيات:', {
          totalStudents: response.data.totalStudents,
          presentCount: response.data.presentCount,
          absentCount: response.data.absentCount,
          attendanceRate: response.data.attendanceRate,
        });

        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ';
        console.error('❌ [Advanced Stats Hook] خطأ:', errorMessage);
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * حساب إحصائيات مفلترة مع Pagination
   */
  const calculateFilteredStats = useCallback(
    async (request: FilteredStatsRequest): Promise<FilteredStatsResponse['data'] | null> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔍 [Filtered Stats Hook] جلب الإحصائيات المفلترة من Backend...');
        const response = await getFilteredAttendanceStats(request);

        if (!response.success) {
          throw new Error(response.message || 'فشل في حساب الإحصائيات المفلترة');
        }

        console.log('✅ [Filtered Stats Hook] تم الحصول على الإحصائيات:', {
          totalStudents: response.data.totalStudents,
          visibleStudents: response.data.visibleStudents,
          presentCount: response.data.presentCount,
          absentCount: response.data.absentCount,
          attendanceRate: response.data.attendanceRate,
          page: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
        });

        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ';
        console.error('❌ [Filtered Stats Hook] خطأ:', errorMessage);
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    calculateAdvancedStats,
    calculateFilteredStats,
  };
};
