import { useMemo } from 'react';
import { AR_MONTHS } from '../utils/dateHelpers';
import type {
  UseStudentStatsProps,
  YearTotals
} from '../types/absence.types';

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

interface ExtendedUseStudentStatsProps extends UseStudentStatsProps {
  weeklyStats?: WeeklyStatsData | null;
  viewMode: 'weekly' | 'monthly';
}

/**
 * Hook لحساب إحصائيات الطالب
 * يحسب البيانات الشهرية والأسبوعية بناءً على وضع العرض
 */
export const useStudentStats = ({
  monthlyStats,
  weeklyStats,
  selectedYear,
  selectedMonthIndex,
  viewMode
}: ExtendedUseStudentStatsProps) => {
  
  // 1. فلترة السجل للشهر المحدد (للعرض الشهري)
  const filteredMonthlyStats = useMemo(() => {
    return monthlyStats.filter((stat) => {
      const lastSpace = stat.month.lastIndexOf(' ');
      if (lastSpace < 0) return false;
      
      const label = stat.month.substring(0, lastSpace);
      const yy = parseInt(stat.month.substring(lastSpace + 1), 10);
      const mmIndex = AR_MONTHS.findIndex((x) => x === label);
      
      return yy === selectedYear && mmIndex === selectedMonthIndex;
    });
  }, [monthlyStats, selectedYear, selectedMonthIndex]);

  // 2. حساب الإحصائيات الحالية بناءً على وضع العرض (أسبوعي / شهري)
  const currentViewStats = useMemo(() => {
    if (viewMode === 'weekly') {
      if (!weeklyStats) return { totalDays: 0, absenceCount: 0, rate: 0, absenceDates: [] as string[] };
      
      // تحويل التواريخ لـ strings إذا كانت Date objects
      const formattedDates = (weeklyStats.absenceDates || []).map(d => 
        typeof d === 'string' ? d : new Date(d).toISOString()
      );
      
      return {
        totalDays: weeklyStats.totalDays,
        absenceCount: weeklyStats.absenceCount,
        rate: weeklyStats.rate,
        absenceDates: formattedDates
      };
    } else {
      // وضع العرض الشهري: تجميع بيانات الشهر المختار
      if (filteredMonthlyStats.length === 0) return { totalDays: 0, absenceCount: 0, rate: 0, absenceDates: [] as string[] };
      
      const monthData = filteredMonthlyStats[0]; // يفترض أن هناك سجل واحد لكل شهر
      return {
        totalDays: monthData.totalDays,
        absenceCount: monthData.absenceCount,
        rate: monthData.rate,
        absenceDates: monthData.absenceDates || []
      };
    }
  }, [viewMode, weeklyStats, filteredMonthlyStats]);

  // 3. حساب إجمالي السنة (للاستخدام العام إذا لزم الأمر)
  const yearTotals: YearTotals = useMemo(() => {
    const statsForYear = monthlyStats.filter((stat) => {
      const lastSpace = stat.month.lastIndexOf(' ');
      const yy = parseInt(stat.month.substring(lastSpace + 1), 10);
      return yy === selectedYear;
    });

    const absenceCount = statsForYear.reduce((sum, m) => sum + m.absenceCount, 0);
    const totalDays = statsForYear.reduce((sum, m) => sum + m.totalDays, 0);
    const rate = totalDays > 0
      ? Math.round((absenceCount / totalDays) * 1000) / 10
      : 0;

    return { absenceCount, totalDays, rate };
  }, [monthlyStats, selectedYear]);

  return {
    filteredMonthlyStats,
    yearTotals,
    currentViewStats
  };
};

