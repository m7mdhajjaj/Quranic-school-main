// ============================================================================
// useTeachersStats - Hook لإحصائيات المعلمين
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { getTeacherStats } from "@/Api/teacherApi";
import type { TeachersStats } from "@/types/teacher.types";

export const useTeachersStats = () => {
  const [stats, setStats] = useState<TeachersStats>({
    totalTeachers: 0,
    activeTeachers: 0,
    inactiveTeachers: 0,
    maleTeachers: 0,
    femaleTeachers: 0,
    teachersWithGroups: 0,
    teachersWithoutGroups: 0,
    averageAge: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("📊 جلب إحصائيات المعلمين");
      const response = await getTeacherStats();

      if (response.success && response.data) {
        console.log("✅ إحصائيات المعلمين:", response.data);
        setStats({
          totalTeachers: response.data.total || 0,
          activeTeachers: response.data.active || 0,
          inactiveTeachers: response.data.inactive || 0,
          maleTeachers: response.data.male || 0,
          femaleTeachers: response.data.female || 0,
          teachersWithGroups: response.data.withGroups || 0,
          teachersWithoutGroups: response.data.withoutGroups || 0,
          averageAge:
            typeof response.data.avgAge === "string"
              ? parseFloat(response.data.avgAge)
              : response.data.avgAge || 0,
        });
      } else {
        console.error("❌ فشل جلب الإحصائيات:", response.message);
        setError(response.message || "فشل في جلب الإحصائيات");
      }
    } catch (err: any) {
      console.error("❌ خطأ في جلب الإحصائيات:", err);
      setError(err?.message || "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};
