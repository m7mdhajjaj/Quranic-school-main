// ============================================================================
// useWeekFilter - هوك لحساب نطاق الأسبوع فقط
// ============================================================================
// ✅ يستخدم توقيت فلسطين (Asia/Jerusalem) الموحد

import { useMemo, useState, useCallback } from "react";
import type { Session } from "../../types/timetable.types";
import { 
  getWeekRange, 
  formatWeekRange,
  type WeekRange 
} from "@/utils/timezone";

// Re-export للتوافق مع الاستخدامات الحالية
export { getWeekRange, formatWeekRange };
export type { WeekRange };

interface UseWeekFilterOptions {
  sessions: Session[];
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
  sessions
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

  // ✅ البيانات جاهزة من الـ Backend - لا فلترة هنا
  const filteredSessions = sessions;

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
