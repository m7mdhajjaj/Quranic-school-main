import { useState, useEffect, useCallback } from "react";
import { fetchAllDashboardData, type GroupData } from "../Api/dashboardApi";

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
  
  // للحصول على معلومات المستخدم من localStorage
  const getUserData = useCallback(() => {
    const user = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');
    if (user && userId) {
      const userData = JSON.parse(user);
      return {
        userId,
        role: userData.role || 'admin',
        firstName: userData.firstName || 'Admin',
      };
    }
    return null;
  }, []);

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

  // Socket.IO integration for real-time updates
  useEffect(() => {
    let socket: any = null;
    
    const connectSocket = async () => {
      try {
        // Dynamic import للـ socket.io-client
        const { io } = await import('socket.io-client');
        const { API_BASE_URL } = await import('../config');
        
        socket = io(API_BASE_URL, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
        });

        socket.on('connect', () => {
          console.log('✅ Socket.IO متصل للداشبورد');
          
          // تسجيل دخول المستخدم
          const userData = getUserData();
          if (userData) {
            socket.emit('login', userData);
          }
          
          // الانضمام لغرفة الداشبورد
          socket.emit('joinDashboard');
        });

        // الاستماع للتحديثات التلقائية
        socket.on('dashboardUpdate', (payload: any) => {
          console.log('🔄 تحديث الداشبورد:', payload);
          
          if (payload.type === 'stats' && payload.data) {
            setStats(prev => ({ ...prev, ...payload.data }));
            setLastUpdated(new Date());
          } else if (payload.type === 'groups' && payload.data) {
            const newGroupsDistribution = processGroupsDistribution(payload.data);
            setGroupsDistribution(newGroupsDistribution);
            setStats(prev => ({ ...prev, groupsDistribution: newGroupsDistribution }));
            setLastUpdated(new Date());
          } else if (payload.type === 'full') {
            // تحديث كامل - إعادة جلب البيانات
            fetchStats();
          }
        });

        socket.on('disconnect', (reason: string) => {
          console.log('🔌 انقطع اتصال Socket.IO للداشبورد:', reason);
        });

        socket.on('connect_error', (error: Error) => {
          console.error('❌ خطأ في اتصال Socket.IO:', error);
        });

      } catch (error) {
        console.error('❌ فشل تحميل Socket.IO:', error);
      }
    };

    // الاتصال بـ Socket.IO بعد التهيئة
    if (initialized) {
      connectSocket();
    }

    return () => {
      if (socket) {
        socket.emit('leaveDashboard');
        socket.disconnect();
      }
    };
  }, [initialized, getUserData, processGroupsDistribution, fetchStats]);

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
