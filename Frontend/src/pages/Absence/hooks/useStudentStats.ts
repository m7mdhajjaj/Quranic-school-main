import { useMemo } from 'react';
import { AR_MONTHS } from '../utils/dateHelpers';
import type {
  UseStudentStatsProps,
  YearTotals,
} from '../types/absence.types';

/**
 * Hook لحساب إحصائيات الطالب
 * يحسب البيانات الشهرية والسنوية مسبقاً
 */
export const useStudentStats = ({
  monthlyStats,
  selectedYear,
  selectedMonthIndex,
}: UseStudentStatsProps) => {
  // فلترة السجل للشهر المحدد
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

  // حساب إجمالي السنة
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
  };
};
