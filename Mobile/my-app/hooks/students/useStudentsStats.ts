// ============================================================================
// useStudentsStats - Hook لجلب إحصائيات الطلاب
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { getStudentStats } from "@/Api/studentApi";
import type { StudentsStats } from "@/types/student.types";

export const useStudentsStats = (autoRefresh = true) => {
  const [stats, setStats] = useState<StudentsStats>({
    total: 0,
    active: 0,
    inactive: 0,
    male: 0,
    female: 0,
    avgAge: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getStudentStats();

      if (result.success && result.data) {
        const apiStats = result.data;
        setStats({
          total: apiStats.totalStudents || 0,
          active: apiStats.activeStudents || 0,
          inactive:
            (apiStats.totalStudents || 0) - (apiStats.activeStudents || 0),
          male: apiStats.maleStudents || 0,
          female: apiStats.femaleStudents || 0,
          avgAge: 0, // ليس موجود في API الحالي
        });
      } else {
        setError(result.message || "فشل في جلب الإحصائيات");
      }
    } catch (err: any) {
      setError(err?.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
