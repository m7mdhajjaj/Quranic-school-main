import { useMemo } from 'react';
import { AR_MONTHS } from '../utils/dateHelpers';
import type { UseStudentStatsProps } from '../types/absence.types';

// WeeklyStats نوع مخصص يتوافق مع البيانات القادمة من Backend
interface WeeklyStatsData {
  totalDays: number;
  absenceCount: number;
  presenceCount: number;
  rate: number;
  attendanceRate: number;
  weekStart: string;
  weekEnd: string;
  absenceDates: (string | Date)[];
}

// CurrentMonthStats من Backend
interface CurrentMonthStatsData {
  totalDays: number;
  absenceCount: number;
  presenceCount: number;
  rate: number;
  attendanceRate: number;
  month: string;
  year: number;
  absenceDates: (string | Date)[];
}

interface ExtendedUseStudentStatsProps extends UseStudentStatsProps {
  weeklyStats?: WeeklyStatsData | null;
  currentMonthStats?: CurrentMonthStatsData | null;
  viewMode: 'weekly' | 'monthly';
}

// =====================================
// Helper Functions
// =====================================

/**
 * تنسيق التواريخ - تحويل Date objects إلى ISO strings
 */
const formatDates = (dates: (string | Date)[]): string[] => {
  return (dates || []).map(d => 
    typeof d === 'string' ? d : new Date(d).toISOString()
  );
};

/**
 * فلترة الإحصائيات الشهرية حسب السنة والشهر
 */
const filterMonthlyStatsByDate = (
  monthlyStats: any[],
  selectedYear: number,
  selectedMonthIndex: number
) => {
  return monthlyStats.filter((stat) => {
    const lastSpace = stat.month.lastIndexOf(' ');
    if (lastSpace < 0) return false;
    
    const label = stat.month.substring(0, lastSpace);
    const yy = parseInt(stat.month.substring(lastSpace + 1), 10);
    const mmIndex = AR_MONTHS.findIndex((x) => x === label);
    
    return yy === selectedYear && mmIndex === selectedMonthIndex;
  });
};

/**
 * الحصول على إحصائيات الأسبوع
 */
const getWeeklyViewStats = (weeklyStats: WeeklyStatsData | null | undefined) => {
  if (!weeklyStats) {
    return { totalDays: 0, absenceCount: 0, rate: 0, absenceDates: [] as string[] };
  }
  
  return {
    totalDays: weeklyStats.totalDays,
    absenceCount: weeklyStats.absenceCount,
    rate: weeklyStats.rate,
    absenceDates: formatDates(weeklyStats.absenceDates)
  };
};

/**
 * الحصول على إحصائيات الشهر
 */
const getMonthlyViewStats = (
  currentMonthStats: CurrentMonthStatsData | null | undefined,
  filteredMonthlyStats: any[],
  selectedYear: number,
  selectedMonthIndex: number
) => {
  const now = new Date();
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonthIndex === now.getMonth();
  
  // للشهر الحالي: استخدام البيانات من Backend
  if (isCurrentMonth && currentMonthStats) {
    return {
      totalDays: currentMonthStats.totalDays,
      absenceCount: currentMonthStats.absenceCount,
      rate: currentMonthStats.rate,
      absenceDates: formatDates(currentMonthStats.absenceDates)
    };
  }
  
  // للأشهر السابقة: استخدام البيانات التاريخية
  if (filteredMonthlyStats.length === 0) {
    return { totalDays: 0, absenceCount: 0, rate: 0, absenceDates: [] as string[] };
  }
  
  const monthData = filteredMonthlyStats[0];
  return {
    totalDays: monthData.totalDays,
    absenceCount: monthData.absenceCount,
    rate: monthData.rate,
    absenceDates: monthData.absenceDates || []
  };
};

// =====================================
// Main Hook
// =====================================

/**
 * Hook لحساب إحصائيات الطالب
 * يحسب البيانات الشهرية والأسبوعية بناءً على وضع العرض
 */
export const useStudentStats = ({
  monthlyStats,
  weeklyStats,
  currentMonthStats,
  selectedYear,
  selectedMonthIndex,
  viewMode
}: ExtendedUseStudentStatsProps) => {
  
  // فلترة السجل للشهر المحدد
  const filteredMonthlyStats = useMemo(
    () => filterMonthlyStatsByDate(monthlyStats, selectedYear, selectedMonthIndex),
    [monthlyStats, selectedYear, selectedMonthIndex]
  );

  // حساب الإحصائيات الحالية بناءً على وضع العرض
  const currentViewStats = useMemo(() => {
    return viewMode === 'weekly'
      ? getWeeklyViewStats(weeklyStats)
      : getMonthlyViewStats(currentMonthStats, filteredMonthlyStats, selectedYear, selectedMonthIndex);
  }, [viewMode, weeklyStats, currentMonthStats, filteredMonthlyStats, selectedYear, selectedMonthIndex]);

  return {
    filteredMonthlyStats,
    currentViewStats
  };
};
