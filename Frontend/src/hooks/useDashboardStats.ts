import { useState, useEffect, useCallback } from "react";
import api from "../Api/api";

export interface GroupDistribution {
  groupName: string;
  studentCount: number;
  capacity: number;
  percentage: number;
}

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalExams: number;
  totalGroups: number;
  totalActivities: number;
  totalNews: number;
  averageMarks: number;
  averageExamMarks: number;
  activeStudents: number;
  attendanceRate: number;
  upcomingExams: number;
  recentMarksCount: number;
  groupsDistribution?: GroupDistribution[];
}

interface UseDashboardStatsReturn {
  stats: Stats;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshing: boolean;
  fetchStats: (force?: boolean) => Promise<void>;
  groupsDistribution: GroupDistribution[];
}

const INITIAL_STATS: Stats = {
  totalStudents: 0,
  totalTeachers: 0,
  totalExams: 0,
  totalGroups: 0,
  totalActivities: 0,
  totalNews: 0,
  averageMarks: 0,
  averageExamMarks: 0,
  activeStudents: 0,
  attendanceRate: 0,
  upcomingExams: 0,
  recentMarksCount: 0,
  groupsDistribution: [],
};

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [groupsDistribution, setGroupsDistribution] = useState<
    GroupDistribution[]
  >([]);

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      console.log("📊 جلب إحصائيات لوحة التحكم...");

      // جلب الإحصائيات الأساسية
      const statsResponse = await api.get("/dashboard/stats");

      // جلب بيانات الحلقات لحساب التوزيع
      const groupsResponse = await api.get("/groups");

      if (statsResponse.data.success) {
        const statsData = statsResponse.data.data;
        const now = Date.now();

        // معالجة بيانات توزيع الحلقات
        let groupsDistributionData: GroupDistribution[] = [];

        if (groupsResponse.data.success && groupsResponse.data.data) {
          groupsDistributionData = groupsResponse.data.data.map(
            (group: any) => ({
              groupName: group.name,
              studentCount: group.currentStudents || 0,
              capacity: group.capacity || 30,
              percentage: Math.round(
                ((group.currentStudents || 0) / (group.capacity || 30)) * 100
              ),
            })
          );
        }

        setStats({ ...statsData, groupsDistribution: groupsDistributionData });
        setGroupsDistribution(groupsDistributionData);
        setLastUpdated(new Date(now));
        setInitialized(true);

        console.log("✅ تم جلب الإحصائيات بنجاح:", statsData);
        console.log("✅ تم جلب توزيع الحلقات:", groupsDistributionData);
      } else {
        throw new Error(statsResponse.data.message || "فشل في جلب الإحصائيات");
      }
    } catch (error) {
      console.error("❌ خطأ في جلب الإحصائيات:", error);
      const errorMessage =
        error instanceof Error ? error.message : "خطأ في جلب الإحصائيات";
      setError(errorMessage);

      // استخدام البيانات الافتراضية عند الخطأ
      if (!initialized) {
        setStats(INITIAL_STATS);
        setGroupsDistribution([]);
        setInitialized(true);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [initialized]);

  // تحميل البيانات عند أول استخدام فقط
  useEffect(() => {
    if (!initialized) {
      fetchStats();
    }
  }, [fetchStats, initialized]);

  // Auto refresh كل 10 دقائق
  useEffect(() => {
    if (!initialized) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 10 * 60 * 1000); // 10 دقائق

    return () => clearInterval(interval);
  }, [initialized, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    lastUpdated,
    refreshing,
    fetchStats,
    groupsDistribution,
  };
};
