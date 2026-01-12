// ============================================================================
// useMonthlyTimetable - هوك لجلب المواعيد الشهرية
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)

import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { getMonthlyPlan } from '@/Api/TimeTable.Api';
import type { Timetable } from '@/Api/TimeTable.Api';
import type { Session } from '../types/timetable.types';

dayjs.locale('ar');

// تحويل Timetable من API إلى Session
const mapTimetableToSession = (timetable: Timetable): Session => {
  const teacherInfo = typeof timetable.teacherId === 'object' && timetable.teacherId
    ? timetable.teacherId
    : undefined;
  
  const groupInfo = typeof timetable.groupId === 'object' && timetable.groupId
    ? timetable.groupId
    : null;

  return {
    _id: timetable._id || '',
    day: timetable.day,
    startHour: timetable.startHour,
    endHour: timetable.endHour,
    note: timetable.note,
    description: timetable.description,
    groupId: typeof timetable.groupId === 'string' ? timetable.groupId : timetable.groupId?._id,
    teacherId: teacherInfo,
    sectionId: typeof timetable.sectionId === 'string' ? timetable.sectionId : timetable.sectionId?._id,
    sessionDate: timetable.sessionDate,
    sessionType: timetable.sessionType,
    sectionInfo: timetable.sectionInfo,
    teacherGroups: groupInfo ? [{ _id: groupInfo._id, name: groupInfo.name }] : [],
  };
};

export const useMonthlyTimetable = (refreshTrigger?: any) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [monthlySessions, setMonthlySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  // جلب بيانات الشهر الحالي من الباك اند
  const fetchMonthlyData = useCallback(async () => {
    try {
      setLoading(true);
      const month = currentDate.month() + 1;
      const year = currentDate.year();
      
      const response = await getMonthlyPlan(month, year);
      
      if (response.success && response.data) {
        // تحويل Timetable[] إلى Session[]
        const sessions = response.data.map(mapTimetableToSession);
        setMonthlySessions(sessions);
      }
    } catch (error) {
      console.error("Failed to fetch monthly plan", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData, refreshTrigger]);

  const nextMonth = useCallback(() => setCurrentDate(curr => curr.add(1, 'month')), []);
  const prevMonth = useCallback(() => setCurrentDate(curr => curr.subtract(1, 'month')), []);
  const goToToday = useCallback(() => setCurrentDate(dayjs()), []);

  // توليد أيام الشهر للعرض
  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const daysInMonth = currentDate.daysInMonth();
    const startDayIndex = (startOfMonth.day() + 1) % 7;

    const days = [];

    for (let i = 0; i < startDayIndex; i++) {
        const d = startOfMonth.subtract(startDayIndex - i, 'day');
        days.push({ date: d, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const d = startOfMonth.date(i);
        days.push({ date: d, isCurrentMonth: true });
    }

    const remainingSlots = 42 - days.length; 
    if (remainingSlots > 0 && remainingSlots < 7) { 
         for (let i = 1; i <= remainingSlots; i++) {
            const d = endOfMonth.add(i, 'day');
            days.push({ date: d, isCurrentMonth: false });
         }
    }

    return days;
  }, [currentDate]);

  // ⚠️ دالة للحصول على حصص يوم معين (باستخدام sessionDate)
  const getDailySessions = useCallback((date: dayjs.Dayjs) => {
    return monthlySessions.filter(session => {
      // ⚠️ النظام الجديد: نقارن sessionDate
      if (!session.sessionDate) return false;
      return dayjs(session.sessionDate).isSame(date, 'day');
    });
  }, [monthlySessions]);

  return {
    currentDate,
    monthlySessions,
    loading,
    calendarDays,
    nextMonth,
    prevMonth,
    goToToday,
    getDailySessions,
    refresh: fetchMonthlyData
  };
};
