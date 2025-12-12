import { useState, useEffect, useCallback, useMemo } from "react";
import { getGroupsStats } from "@/Api/groupApi";
import type { GroupStats } from "../types";

export const useGroupsStats = () => {
  const [stats, setStats] = useState<GroupStats>({
    totalGroups: 0,
    totalStudents: 0,
    fullGroups: 0,
    emptyGroups: 0,
    totalCapacity: 0,
    availableSeats: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getGroupsStats();

      if (result.success && result.data) {
        setStats(result.data);
      } else {
        throw new Error(result.message || "فشل جلب الإحصائيات");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return useMemo(() => ({
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  }), [stats, isLoading, error, fetchStats]);
};
