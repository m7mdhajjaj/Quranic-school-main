// ============================================================================
// useWeeklyGrid - منطق عرض الشبكة الأسبوعية
// ============================================================================
// ✅ يستخدم توقيت فلسطين (Asia/Jerusalem) الموحد
// ✅ أوقات العمل الموحدة: 11:00 AM - 8:00 PM

import { useMemo, useCallback } from "react";
import type { Session } from "../../types/timetable.types";
import { generateHours, findTimeIndex } from "../../utils";
import { useWeekFilter } from "./useWeekFilter";
import { 
  getWeekDates, 
  formatDateForAPI, 
  toDateKey 
} from "@/utils/timezone";

interface UseWeeklyGridProps {
  sessions: Session[];
}

export const useWeeklyGrid = ({ sessions }: UseWeeklyGridProps) => {
  // ساعات العمل الموحدة
  const hours = useMemo(() => generateHours(), []);

  // فلترة الحصص حسب الأسبوع
  // ✅ البيانات جاهزة من الـ Backend
  const { weekRange, weekRangeFormatted, filteredSessions } = useWeekFilter({ 
    sessions
  });

  // تواريخ الأسبوع الحالي
  const weekDates = useMemo(() => getWeekDates(weekRange.startOfWeek), [weekRange]);

  // شبكة الحصص (تاريخ -> ساعة -> حصص)
  const sessionGrid = useMemo(() => {
    const grid: Record<string, Record<string, { session: Session; rowSpan: number }[]>> = {};
    
    // تهيئة الشبكة
    const gridKeys: string[] = [];
    weekDates.forEach((date) => {
      const dateKey = formatDateForAPI(date);
      gridKeys.push(dateKey);
      grid[dateKey] = {};
      hours.forEach(hour => {
        grid[dateKey][hour] = [];
      });
    });

    // ترتيب الحصص
    const sortedSessions = [...filteredSessions].sort((a, b) => {
      const aIndex = findTimeIndex(hours, a.startHour);
      const bIndex = findTimeIndex(hours, b.startHour);
      if (aIndex !== bIndex) return aIndex - bIndex;
      return findTimeIndex(hours, a.endHour) - findTimeIndex(hours, b.endHour);
    });

    // ملء الشبكة
    sortedSessions.forEach(session => {
      if (!session.sessionDate) {
        return;
      }
      
      // ✅ استخدام toDateKey لضمان التوافق مع timezone فلسطين
      const sessionDateKey = toDateKey(new Date(session.sessionDate));
      
      if (!grid[sessionDateKey]) {
        return;
      }
      
      const startIndex = findTimeIndex(hours, session.startHour);
      const endIndex = findTimeIndex(hours, session.endHour);
      
      // ✅ استخدام findTimeIndex للحصول على الـ key الصحيح
      const gridHourKey = startIndex !== -1 ? hours[startIndex] : null;
      
      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex && gridHourKey && grid[sessionDateKey][gridHourKey]) {
        grid[sessionDateKey][gridHourKey].push({ 
          session, 
          rowSpan: endIndex - startIndex 
        });
      }
    });

    return grid;
  }, [filteredSessions, hours, weekDates]);

  // التحقق إذا كان السلوت مشغول بحصة ممتدة - memoized
  const isSlotOccupied = useCallback((dateKey: string, currentHour: string): boolean => {
    const currentIndex = findTimeIndex(hours, currentHour);
    if (currentIndex === -1) return false;

    for (let i = 0; i < currentIndex; i++) {
      const prevHour = hours[i];
      const sessionsInPrevSlot = sessionGrid[dateKey]?.[prevHour] || [];
      
      for (const { session } of sessionsInPrevSlot) {
        const sessionStartIndex = findTimeIndex(hours, session.startHour);
        const sessionEndIndex = findTimeIndex(hours, session.endHour);
        
        if (sessionStartIndex !== -1 && sessionEndIndex !== -1) {
          if (currentIndex > sessionStartIndex && currentIndex < sessionEndIndex) {
            return true;
          }
        }
      }
    }
    
    return false;
  }, [hours, sessionGrid]);

  // الحصول على حصص يوم/ساعة معينة - memoized
  const getSessionsAt = useCallback((dateKey: string, hour: string) => {
    return sessionGrid[dateKey]?.[hour] || [];
  }, [sessionGrid]);

  return {
    // البيانات
    hours,
    weekDates,
    weekRangeFormatted,
    sessionGrid,
    
    // الدوال المساعدة
    isSlotOccupied,
    getSessionsAt,
  };
};
