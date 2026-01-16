// ============================================================================
// useSecretaryStats Hook - جلب إحصائيات السكرتيرين
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { getSecretaryStats, type SecretaryStats } from "@/Api/secretaryApi";

interface UseSecretaryStatsReturn {
  stats: SecretaryStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultStats: SecretaryStats = {
  total: 0,
  male: 0,
  female: 0,
  avgAge: 0,
  malePercentage: 0,
  femalePercentage: 0,
};

export const useSecretaryStats = (): UseSecretaryStatsReturn => {
  const [stats, setStats] = useState<SecretaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSecretaryStats();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || "فشل في جلب الإحصائيات");
        setStats(defaultStats);
      }
    } catch (err) {
      console.error("Error fetching secretary stats:", err);
      setError("حدث خطأ أثناء جلب الإحصائيات");
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export default useSecretaryStats;
