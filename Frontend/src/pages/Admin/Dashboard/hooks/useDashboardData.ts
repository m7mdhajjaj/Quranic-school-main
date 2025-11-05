import { useState, useCallback, useEffect } from "react";
import {
  fetchAllDashboardData,
  fetchDashboardCharts,
} from "@/Api/dashboardApi";
import type { DashboardStats, GroupDistribution } from "../types";

export interface ChartsData {
  groupDistribution: Array<{ _id: string; count: number }>;
  genderDistribution: Array<{ _id: string; count: number }>;
  marksDistribution: any[];
  attendanceByMonth: any[];
  monthlyAttendance?: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
  topStudents?: Array<{
    name: string;
    value: number;
    avgMark?: number;
    attendanceRate?: number;
  }>;
  topTeachers?: Array<{
    name: string;
    value: number;
    studentCount?: number;
    marksCount?: number;
    attendanceCount?: number;
    memorizedCount?: number;
    reviewCount?: number;
  }>;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalGroups: 0,
    totalExams: 0,
    averageExamMarks: 0,
    activeStudents: 0,
    attendanceRate: 0,
  });

  const [groupsDistribution, setGroupsDistribution] = useState<
    GroupDistribution[]
  >([]);
  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (force?: boolean) => {
    try {
      if (force) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log("🔄 جلب بيانات Dashboard...");

      // جلب البيانات بشكل متوازي
      const [statsResponse, chartsResponse] = await Promise.all([
        fetchAllDashboardData(),
        fetchDashboardCharts(),
      ]);

      // تحديث الإحصائيات
      setStats({
        totalStudents: statsResponse.stats.totalStudents || 0,
        totalTeachers: statsResponse.stats.totalTeachers || 0,
        totalGroups: statsResponse.stats.totalGroups || 0,
        totalExams: statsResponse.stats.totalExams || 0,
        averageExamMarks: Math.round(statsResponse.stats.averageExamMarks || 0),
        activeStudents: statsResponse.stats.activeStudents || 0,
        attendanceRate: Math.round(statsResponse.stats.attendanceRate || 0),
      });

      // تحويل بيانات الحلقات لتنسيق GroupDistribution
      const groupsData = statsResponse.groups.map((group) => ({
        groupName: group.name,
        studentCount: group.currentStudents || 0,
        capacity: group.capacity,
        percentage: group.capacity
          ? Math.round(((group.currentStudents || 0) / group.capacity) * 100)
          : 0,
      }));

      setGroupsDistribution(groupsData);

      // تحديث بيانات الرسوم البيانية
      setChartsData(chartsResponse);

      console.log("✅ تم جلب البيانات بنجاح");
      console.log("📊 Charts Data:", chartsResponse);
      console.log("📊 Group Distribution:", chartsResponse?.groupDistribution);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "فشل في جلب البيانات";
      console.error("❌ خطأ في جلب البيانات:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // جلب البيانات عند التحميل الأول
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refreshing,
    fetchStats,
    groupsDistribution,
    chartsData,
  };
};
