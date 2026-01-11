import { useState, useEffect, useCallback } from "react";
import { getGroupStats } from "@/Api/DailyMark/dailyMarksApi";

interface GroupStats {
  studentsCount: number;
  sectionsCount: number;
}

interface UseGroupStatsReturn {
  stats: GroupStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching group statistics
 * 
 * @description
 * - Fetches students count and sections count for a specific group
 * - Filters by month and year if provided
 * - Auto-updates when filters change
 * 
 * @param {string | null} groupName - Group name to fetch stats for
 * @param {number | null} month - Filter by month (1-12) or null for all
 * @param {number | null} year - Filter by year or null for all
 * @param {boolean} enabled - Whether to fetch data (default: true)
 * 
 * @returns {UseGroupStatsReturn} Group statistics and loading state
 */
export const useGroupStats = (
  groupName: string | null,
  month: number | null,
  year: number | null,
  enabled: boolean = true
): UseGroupStatsReturn => {
  const [stats, setStats] = useState<{
    studentsCount: number;
    sectionsCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    // لا تجلب إذا لم يكن enabled أو لا يوجد اسم حلقة أو "الكل"
    if (!enabled || !groupName || groupName === "all") {
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getGroupStats(
        groupName,
        month || undefined,
        year || undefined
      );

      if (response.success && response.data) {
        setStats({
          studentsCount: response.data.studentsCount,
          sectionsCount: response.data.sectionsCount,
        });
      } else {
        setError(response.message || "فشل جلب الإحصائيات");
      }
    } catch (err) {
      console.error("❌ Error fetching group stats:", err);
      setError("حدث خطأ أثناء جلب إحصائيات الحلقة");
    } finally {
      setLoading(false);
    }
  }, [groupName, month, year, enabled]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
