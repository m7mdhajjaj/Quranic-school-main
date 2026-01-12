// ============================================================================
// useWeekFilter - هوك لفلترة المواعيد حسب الأسبوع
// ============================================================================

import { useMemo, useState, useCallback } from "react";
import type { Session } from "../types/timetable.types";

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
  enableClientFilter?: boolean; // تفعيل الفلترة في الفرونت (fallback)
}

interface UseWeekFilterReturn {
  weekRange: WeekRange;
  weekRangeFormatted: string;
  filteredSessions: Session[];
  currentWeekStart: string; // ISO string لإرساله للـ API
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToCurrentWeek: () => void;
  isCurrentWeek: boolean;
}

export const useWeekFilter = ({ 
  sessions, 
  enableClientFilter = false 
}: UseWeekFilterOptions): UseWeekFilterReturn => {
  // التاريخ المرجعي للأسبوع (يمكن تغييره للتنقل بين الأسابيع)
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

  // حساب نطاق الأسبوع
  const weekRange = useMemo(() => getWeekRange(referenceDate), [referenceDate]);

  // تنسيق نطاق الأسبوع للعرض
  const weekRangeFormatted = useMemo(() => formatWeekRange(weekRange), [weekRange]);

  // ISO string لبداية الأسبوع (لإرساله للـ API)
  const currentWeekStart = useMemo(
    () => weekRange.startOfWeek.toISOString(),
    [weekRange]
  );

  // هل نحن في الأسبوع الحالي؟
  const isCurrentWeek = useMemo(() => {
    const todayWeek = getWeekRange(new Date());
    return weekRange.startOfWeek.getTime() === todayWeek.startOfWeek.getTime();
  }, [weekRange]);

  // فلترة المواعيد (client-side fallback)
  const filteredSessions = useMemo(() => {
    if (!enableClientFilter) {
      return sessions; // الباك إند يفلتر
    }

    return sessions.filter(session => {
      // المواعيد المحددة بتاريخ - تظهر فقط إذا كانت في الأسبوع المحدد
      if (session.sessionDate) {
        const sessionDate = new Date(session.sessionDate);
        return sessionDate >= weekRange.startOfWeek && sessionDate <= weekRange.endOfWeek;
      }
      
      // مواعيد قديمة بدون sessionDate - تظهر دائماً
      return true;
    });
  }, [sessions, weekRange, enableClientFilter]);

  // التنقل للأسبوع التالي
  const goToNextWeek = useCallback(() => {
    setReferenceDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }, []);

  // التنقل للأسبوع السابق
  const goToPrevWeek = useCallback(() => {
    setReferenceDate(prev => {
      const prev2 = new Date(prev);
      prev2.setDate(prev2.getDate() - 7);
      return prev2;
    });
  }, []);

  // العودة للأسبوع الحالي
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
