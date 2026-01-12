import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { getMonthlyPlan } from '@/Api/TimeTable.Api';
import type { Session } from '../types/timetable.types';

// تهيئة Day.js للغة العربية
dayjs.locale('ar');

export const useMonthlyTimetable = (refreshTrigger?: any) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [monthlySessions, setMonthlySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  // جلب بيانات الشهر الحالي من الباك اند
  const fetchMonthlyData = useCallback(async () => {
    try {
      setLoading(true);
      const month = currentDate.month() + 1; // 1-12
      const year = currentDate.year();
      
      const response = await getMonthlyPlan(month, year);
      
      if (response.success) {
        setMonthlySessions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch monthly plan", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  // تحديث البيانات عند تغيير الشهر أو عندما يطلب الأب تحديث البيانات
  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData, refreshTrigger]);

  // التنقل بين الأشهر
  const nextMonth = useCallback(() => setCurrentDate(curr => curr.add(1, 'month')), []);
  const prevMonth = useCallback(() => setCurrentDate(curr => curr.subtract(1, 'month')), []);
  const goToToday = useCallback(() => setCurrentDate(dayjs()), []);

  // توليد أيام الشهر للعرض
  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const daysInMonth = currentDate.daysInMonth();
    
    // معادلة محاذاة بداية الأسبوع (السبت = 0)
    // dayjs.day(): Sunday(0) ... Saturday(6)
    // المطلوب: Saturday(0) ... Friday(6)
    // المعادلة: (day + 1) % 7
    const startDayIndex = (startOfMonth.day() + 1) % 7;

    const days = [];

    // أيام الشهر السابق
    for (let i = 0; i < startDayIndex; i++) {
        const d = startOfMonth.subtract(startDayIndex - i, 'day');
        days.push({ date: d, isCurrentMonth: false });
    }

    // أيام الشهر الحالي
    for (let i = 1; i <= daysInMonth; i++) {
        const d = startOfMonth.date(i);
        days.push({ date: d, isCurrentMonth: true });
    }

    // إكمال الشبكة بأيام الشهر التالي
    const remainingSlots = 42 - days.length; 
    if (remainingSlots > 0 && remainingSlots < 7) { 
         for (let i = 1; i <= remainingSlots; i++) {
            const d = endOfMonth.add(i, 'day');
            days.push({ date: d, isCurrentMonth: false });
         }
    }

    return days;
  }, [currentDate]);

  // دالة للحصول على حصص يوم معين
  const getDailySessions = useCallback((date: dayjs.Dayjs) => {
    return monthlySessions.filter(session => {
      // Replace 'date' with the correct property name, e.g., 'session.sessionType'
      if (!session.sessionType) return false;
      return dayjs(session.sessionType).isSame(date, 'day');
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
