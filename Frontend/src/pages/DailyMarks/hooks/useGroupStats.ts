import { useState, useEffect } from "react";
import { getGroupStats } from "@/Api/dailyMarksApi";

interface GroupStats {
  studentsCount: number;
  sectionsCount: number;
}

interface UseGroupStatsReturn {
  stats: GroupStats | null;
  loading: boolean;
  error: string | null;
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

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
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

        if (!isMounted) return;

        if (response.success && response.data) {
          setStats({
            studentsCount: response.data.studentsCount,
            sectionsCount: response.data.sectionsCount,
          });
        } else {
          setError(response.message || "فشل جلب الإحصائيات");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("❌ Error fetching group stats:", err);
        setError("حدث خطأ أثناء جلب إحصائيات الحلقة");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [groupName, month, year, enabled]);

  return { stats, loading, error };
};
