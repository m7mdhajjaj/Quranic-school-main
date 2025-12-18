// ============================================================================
// useMonthlyStatsProcessor - معالج إحصائيات الغياب الشهرية
// ============================================================================
// Hook منفصل لمعالجة بيانات الحضور وتحويلها لإحصائيات شهرية
// تحسين الأداء بفصل المنطق المعقد

import { useMemo } from 'react';
import { AR_MONTHS } from '../utils/dateHelpers';
import type { MonthlyAbsence } from '../types/absence.types';

interface AttendanceRecord {
  date: string;
  isPresent: boolean;
}

interface GroupedData {
  absences: number;
  total: number;
  dates: string[];
}

/**
 * تجميع سجلات الحضور حسب الشهر
 */
const groupRecordsByMonth = (records: AttendanceRecord[]): Record<string, GroupedData> => {
  const grouped: Record<string, GroupedData> = {};
  
  for (const record of records) {
    const date = new Date(record.date);
    if (isNaN(date.getTime())) continue;
    
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!grouped[key]) {
      grouped[key] = { absences: 0, total: 0, dates: [] };
    }
    
    grouped[key].total++;
    if (!record.isPresent) {
      grouped[key].absences++;
      grouped[key].dates.push(record.date);
    }
  }
  
  return grouped;
};

/**
 * تحويل البيانات المجمعة لإحصائيات شهرية
 */
const convertToMonthlyStats = (
  grouped: Record<string, GroupedData>
): MonthlyAbsence[] => {
  return Object.entries(grouped).map(([key, value]) => {
    const [year, month] = key.split('-').map(Number);
    const label = AR_MONTHS[month];
    const rate = value.total > 0 
      ? Math.round((value.absences / value.total) * 1000) / 10 
      : 0;
    
    return {
      month: `${label} ${year}`,
      absenceCount: value.absences,
      totalDays: value.total,
      rate,
      absenceDates: value.dates.sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      ),
    };
  });
};

/**
 * ترتيب الإحصائيات حسب السنة والشهر
 */
const sortMonthlyStats = (stats: MonthlyAbsence[]): MonthlyAbsence[] => {
  return [...stats].sort((a, b) => {
    const aLastSpace = a.month.lastIndexOf(' ');
    const bLastSpace = b.month.lastIndexOf(' ');
    const aLabel = a.month.substring(0, aLastSpace);
    const bLabel = b.month.substring(0, bLastSpace);
    const aYear = parseInt(a.month.substring(aLastSpace + 1), 10);
    const bYear = parseInt(b.month.substring(bLastSpace + 1), 10);

    // ترتيب حسب السنة أولاً
    if (aYear !== bYear) return aYear - bYear;
    
    // ثم حسب الشهر
    const aIdx = AR_MONTHS.findIndex((x) => x === aLabel);
    const bIdx = AR_MONTHS.findIndex((x) => x === bLabel);
    return aIdx - bIdx;
  });
};

/**
 * Hook لمعالجة سجلات الحضور وتحويلها لإحصائيات شهرية
 */
export const useMonthlyStatsProcessor = (records: AttendanceRecord[]) => {
  return useMemo(() => {
    if (!records || records.length === 0) {
      return [];
    }
    
    const grouped = groupRecordsByMonth(records);
    const stats = convertToMonthlyStats(grouped);
    return sortMonthlyStats(stats);
  }, [records]);
};

// Export helper functions للاستخدام المباشر إذا احتجت
export const monthlyStatsHelpers = {
  groupRecordsByMonth,
  convertToMonthlyStats,
  sortMonthlyStats,
};
