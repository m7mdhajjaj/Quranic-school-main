// ============================================================================
// useWeeklyGrid - منطق عرض الشبكة الأسبوعية
// ============================================================================

import { useMemo } from "react";
import type { Session } from "../../types/timetable.types";
import { generateHours, isSummerTime, getWeekDates, formatDateForAPI } from "../../utils";
import { useWeekFilter } from "./useWeekFilter";

interface UseWeeklyGridProps {
  sessions: Session[];
}

export const useWeeklyGrid = ({ sessions }: UseWeeklyGridProps) => {
  // التوقيت الحالي (صيفي/شتوي)
  const isSummer = useMemo(() => isSummerTime(), []);
  
  // ساعات العمل
  const hours = useMemo(() => generateHours(isSummer), [isSummer]);

  // فلترة الحصص حسب الأسبوع
  const { weekRange, weekRangeFormatted, filteredSessions } = useWeekFilter({ 
    sessions, 
    enableClientFilter: true 
  });

  // تواريخ الأسبوع الحالي
  const weekDates = useMemo(() => getWeekDates(weekRange.startOfWeek), [weekRange]);

  // شبكة الحصص (تاريخ -> ساعة -> حصص)
  const sessionGrid = useMemo(() => {
    const grid: Record<string, Record<string, { session: Session; rowSpan: number }[]>> = {};
    
    // تهيئة الشبكة
    weekDates.forEach((date) => {
      const dateKey = formatDateForAPI(date);
      grid[dateKey] = {};
      hours.forEach(hour => {
        grid[dateKey][hour] = [];
      });
    });

    // ترتيب الحصص
    const sortedSessions = [...filteredSessions].sort((a, b) => {
      const aIndex = hours.indexOf(a.startHour);
      const bIndex = hours.indexOf(b.startHour);
      if (aIndex !== bIndex) return aIndex - bIndex;
      return hours.indexOf(a.endHour) - hours.indexOf(b.endHour);
    });

    // ملء الشبكة
    sortedSessions.forEach(session => {
      if (!session.sessionDate) return;
      
      const sessionDateKey = session.sessionDate.split('T')[0];
      if (!grid[sessionDateKey]) return;
      
      const startIndex = hours.indexOf(session.startHour);
      const endIndex = hours.indexOf(session.endHour);
      
      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex && grid[sessionDateKey][session.startHour]) {
        grid[sessionDateKey][session.startHour].push({ 
          session, 
          rowSpan: endIndex - startIndex 
        });
      }
    });

    return grid;
  }, [filteredSessions, hours, weekDates]);

  // التحقق إذا كان السلوت مشغول بحصة ممتدة
  const isSlotOccupied = (dateKey: string, currentHour: string): boolean => {
    const currentIndex = hours.indexOf(currentHour);
    if (currentIndex === -1) return false;

    for (let i = 0; i < currentIndex; i++) {
      const prevHour = hours[i];
      const sessionsInPrevSlot = sessionGrid[dateKey]?.[prevHour] || [];
      
      for (const { session } of sessionsInPrevSlot) {
        const sessionStartIndex = hours.indexOf(session.startHour);
        const sessionEndIndex = hours.indexOf(session.endHour);
        
        if (sessionStartIndex !== -1 && sessionEndIndex !== -1) {
          if (currentIndex > sessionStartIndex && currentIndex < sessionEndIndex) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // الحصول على حصص يوم/ساعة معينة
  const getSessionsAt = (dateKey: string, hour: string) => {
    return sessionGrid[dateKey]?.[hour] || [];
  };

  return {
    // البيانات
    isSummer,
    hours,
    weekDates,
    weekRangeFormatted,
    sessionGrid,
    
    // الدوال المساعدة
    isSlotOccupied,
    getSessionsAt,
  };
};
