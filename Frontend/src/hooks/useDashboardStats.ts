import { useState, useEffect, useCallback } from "react";
import { fetchAllDashboardData, type GroupData } from "../Api/dashboardApi";
import { useSocket } from "./useSocket";
import type { DashboardUpdatePayload } from "../types/socket.types";

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
  // معالجة بيانات توزيع الحلقات
  const processGroupsDistribution = useCallback((groupsData: GroupData[]): GroupDistribution[] => {
    return groupsData.map((group) => ({
      groupName: group.name,
      studentCount: group.currentStudents || 0,
      capacity: group.capacity || 30,
      percentage: Math.round(
        ((group.currentStudents || 0) / (group.capacity || 30)) * 100
      ),
    }));
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      console.log("📊 جلب إحصائيات لوحة التحكم...");

      // استخدام API المحسن للجلب المتوازي
      const result = await fetchAllDashboardData();
      
      if (result.success) {
        const groupsDistributionData = processGroupsDistribution(result.groups);
        
        setStats({ 
          ...result.stats, 
          groupsDistribution: groupsDistributionData 
        });
        setGroupsDistribution(groupsDistributionData);
        setLastUpdated(new Date());
        setInitialized(true);

        console.log("✅ تم جلب الإحصائيات بنجاح:", result.stats);
        console.log("✅ تم جلب توزيع الحلقات:", groupsDistributionData);
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
  }, [initialized, processGroupsDistribution]);

  // Socket.IO integration using centralized SocketContext
  const { onDashboardUpdate, offDashboardUpdate, joinDashboard, leaveDashboard, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected || !initialized) return;

    console.log('✅ Dashboard متصل بـ Socket.IO من خلال SocketContext');
    
    // Join dashboard room
    joinDashboard();

    // Listen for dashboard updates
    const handleDashboardUpdate = (payload: DashboardUpdatePayload) => {
      console.log('🔄 تحديث الداشبورد:', payload);
      
      if (payload.type === 'stats' && payload.data && typeof payload.data === 'object') {
        setStats(prev => ({ ...prev, ...(payload.data as Partial<Stats>) }));
        setLastUpdated(new Date());
      } else if (payload.type === 'groups' && payload.data && Array.isArray(payload.data)) {
        const newGroupsDistribution = processGroupsDistribution(payload.data as GroupData[]);
        setGroupsDistribution(newGroupsDistribution);
        setStats(prev => ({ ...prev, groupsDistribution: newGroupsDistribution }));
        setLastUpdated(new Date());
      } else if (payload.type === 'full') {
        // تحديث كامل - إعادة جلب البيانات
        fetchStats();
      }
    };

    // Register event listener using SocketContext
    onDashboardUpdate(handleDashboardUpdate);

    // Cleanup function
    return () => {
      offDashboardUpdate(handleDashboardUpdate);
      leaveDashboard();
    };
  }, [isConnected, initialized, fetchStats, processGroupsDistribution, onDashboardUpdate, offDashboardUpdate, joinDashboard, leaveDashboard]);

  // تحميل البيانات عند أول استخدام فقط
  useEffect(() => {
    if (!initialized) {
      fetchStats();
    }
  }, [fetchStats, initialized]);

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
