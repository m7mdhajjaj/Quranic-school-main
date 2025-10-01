import { useState, useEffect, useCallback } from 'react';
import api from '../api';

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalExams: number;
  totalGroups: number;
  totalActivities: number;
  totalNews: number;
  averageMarks: number;
  activeStudents: number;
  attendanceRate: number;
  upcomingExams: number;
  recentMarksCount: number;
}

interface UseDashboardStatsReturn {
  stats: Stats;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshing: boolean;
  fetchStats: (force?: boolean) => Promise<void>;
}

const INITIAL_STATS: Stats = {
  totalStudents: 0,
  totalTeachers: 0,
  totalExams: 0,
  totalGroups: 0,
  totalActivities: 0,
  totalNews: 0,
  averageMarks: 0,
  activeStudents: 0,
  attendanceRate: 0,
  upcomingExams: 0,
  recentMarksCount: 0,
};

const CACHE_KEY = 'dashboard_stats_cache';
const CACHE_TIMESTAMP = 'dashboard_stats_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (force = false) => {
    try {
      // تحقق من cache إذا لم يكن force refresh
      if (!force) {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIMESTAMP);
        
        if (cachedData && cachedTime) {
          const timeDiff = Date.now() - parseInt(cachedTime);
          if (timeDiff < CACHE_DURATION) {
            console.log('🚀 استخدام البيانات المحفوظة');
            const parsedData = JSON.parse(cachedData);
            setStats(parsedData);
            setLastUpdated(new Date(parseInt(cachedTime)));
            setIsLoading(false);
            return;
          }
        }
      }
      
      setRefreshing(true);
      if (!lastUpdated) {
        setIsLoading(true);
      }
      setError(null);
      
      console.log('📊 جلب إحصائيات لوحة التحكم...');
      
      const response = await api.get('/dashboard/stats');
      
      if (response.data.success) {
        const statsData = response.data.data;
        const now = Date.now();
        
        // حفظ في cache
        localStorage.setItem(CACHE_KEY, JSON.stringify(statsData));
        localStorage.setItem(CACHE_TIMESTAMP, now.toString());
        
        setStats(statsData);
        setLastUpdated(new Date(now));
        console.log('✅ تم جلب الإحصائيات بنجاح:', statsData);
      } else {
        throw new Error(response.data.message || 'فشل في جلب الإحصائيات');
      }
      
    } catch (error) {
      console.error('❌ خطأ في جلب الإحصائيات:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ في جلب الإحصائيات';
      setError(errorMessage);
      
      // استخدام البيانات الافتراضية عند الخطأ إذا لم تكن هناك بيانات محفوظة
      if (!lastUpdated) {
        setStats(INITIAL_STATS);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [lastUpdated]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto refresh كل 10 دقائق
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing && !isLoading) {
        fetchStats();
      }
    }, 10 * 60 * 1000); // 10 دقائق

    return () => clearInterval(interval);
  }, [fetchStats, refreshing, isLoading]);

  return {
    stats,
    isLoading,
    error,
    lastUpdated,
    refreshing,
    fetchStats,
  };
};