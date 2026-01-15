import { useState, useEffect, useCallback } from "react";
import type { SecretaryStats } from "../types";
import { getSecretaryStats } from "@/Api/secretaryApi";

/**
 * Hook لجلب إحصائيات السكرتيرين من الباك إند
 * جميع العمليات الحسابية تتم في الباك إند
 */
export const useSecretariesStats = (): SecretaryStats & { isLoading: boolean; refetch: () => void } => {
  const [stats, setStats] = useState<SecretaryStats>({
    total: 0,
    male: 0,
    female: 0,
    avgAge: 0,
    malePercentage: 0,
    femalePercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getSecretaryStats();
      if (response.success && response.data) {
        setStats({
          total: response.data.total,
          male: response.data.male,
          female: response.data.female,
          avgAge: response.data.avgAge,
          malePercentage: response.data.malePercentage,
          femalePercentage: response.data.femalePercentage,
        });
      }
    } catch (error) {
      console.error("Error fetching secretary stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...stats,
    isLoading,
    refetch: fetchStats,
  };
};
