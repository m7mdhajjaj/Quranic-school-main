import { useState, useEffect, useCallback } from "react";
import { getTeacherAssistantStats } from "@/Api/teacherAssistantApi";
import type { TeacherAssistantStats } from "../types";

const initialStats: TeacherAssistantStats = {
  total: 0,
  male: 0,
  female: 0,
  avgAge: 0,
  malePercentage: 0,
  femalePercentage: 0,
};

export const useTeacherAssistantsStats = () => {
  const [stats, setStats] = useState<TeacherAssistantStats>(initialStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getTeacherAssistantStats();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.message || "فشل في جلب الإحصائيات");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(errorMessage);
      // Set default stats on error
      setStats(initialStats);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...stats,
    isLoading,
    error,
    refetch,
  };
};
