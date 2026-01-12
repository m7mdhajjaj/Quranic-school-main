// ============================================================================
// useWeekFilter - هوك لفلترة المواعيد حسب الأسبوع
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)

import { useMemo, useState, useCallback } from "react";
import type { Session } from "../../types/timetable.types";

export interface WeekRange {
  startOfWeek: Date;
  endOfWeek: Date;
}

/**
 * حساب بداية ونهاية الأسبوع (السبت - الجمعة)
 */
export const getWeekRange = (referenceDate: Date = new Date()): WeekRange => {
  const today = new Date(referenceDate);
  const currentDay = today.getDay(); // 0 = الأحد، 6 = السبت
  
  // حساب بداية الأسبوع (السبت)
  const daysToSaturday = currentDay === 6 ? 0 : currentDay + 1;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - daysToSaturday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // نهاية الأسبوع (الجمعة)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

/**
 * تنسيق نطاق الأسبوع للعرض
 */
export const formatWeekRange = (weekRange: WeekRange): string => {
  const startStr = weekRange.startOfWeek.toLocaleDateString('ar-SA', { 
    day: 'numeric', 
    month: 'short' 
  });
  const endStr = weekRange.endOfWeek.toLocaleDateString('ar-SA', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  return `${startStr} - ${endStr}`;
};

interface UseWeekFilterOptions {
  sessions: Session[];
  enableClientFilter?: boolean;
}

interface UseWeekFilterReturn {
  weekRange: WeekRange;
  weekRangeFormatted: string;
  filteredSessions: Session[];
  currentWeekStart: string;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToCurrentWeek: () => void;
  isCurrentWeek: boolean;
}

export const useWeekFilter = ({ 
  sessions, 
  enableClientFilter = false 
}: UseWeekFilterOptions): UseWeekFilterReturn => {
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

  const weekRange = useMemo(() => getWeekRange(referenceDate), [referenceDate]);
  const weekRangeFormatted = useMemo(() => formatWeekRange(weekRange), [weekRange]);
  const currentWeekStart = useMemo(
    () => weekRange.startOfWeek.toISOString(),
    [weekRange]
  );

  const isCurrentWeek = useMemo(() => {
    const todayWeek = getWeekRange(new Date());
    return weekRange.startOfWeek.getTime() === todayWeek.startOfWeek.getTime();
  }, [weekRange]);

  // ⚠️ الفلترة بناءً على sessionDate
  const filteredSessions = useMemo(() => {
    if (!enableClientFilter) {
      return sessions;
    }

    return sessions.filter(session => {
      // ⚠️ sessionDate مطلوب في النظام الجديد
      if (!session.sessionDate) {
        console.warn('⚠️ Session without sessionDate:', session._id);
        return false;
      }
      
      const sessionDate = new Date(session.sessionDate);
      return sessionDate >= weekRange.startOfWeek && sessionDate <= weekRange.endOfWeek;
    });
  }, [sessions, weekRange, enableClientFilter]);

  const goToNextWeek = useCallback(() => {
    setReferenceDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }, []);

  const goToPrevWeek = useCallback(() => {
    setReferenceDate(prev => {
      const prev2 = new Date(prev);
      prev2.setDate(prev2.getDate() - 7);
      return prev2;
    });
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setReferenceDate(new Date());
  }, []);

  return {
    weekRange,
    weekRangeFormatted,
    filteredSessions,
    currentWeekStart,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    isCurrentWeek,
  };
};
