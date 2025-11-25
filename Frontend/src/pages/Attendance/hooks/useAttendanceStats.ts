import { useMemo, useRef, useEffect } from 'react';
import type { UseAttendanceStatsProps, AttendanceStats } from '../types/absence.types';

/**
 * Hook لحساب إحصائيات الحضور مع حماية ضد الـ flicker
 * يحسب الأرقام ويحتفظ بآخر قيم مستقرة
 */
export const useAttendanceStats = ({
  allStudents,
  visibleStudents,
  isLoadingDate,
}: UseAttendanceStatsProps) => {
  // مرجع لآخر إحصائيات مستقرة (بعد اكتمال التحميل)
  const lastStableStats = useRef<AttendanceStats>({
    totalStudents: 0,
    presentCount: 0,
    absentCount: 0,
    attendanceRate: 0,
  });

  // حساب الإحصائيات الحالية
  const currentStats = useMemo(() => {
    // إجمالي الطلاب = كل الطلاب (بدون فلترة)
    const totalStudents = allStudents.length;
    // الحاضرون والغائبون = من الطلاب المرئيين (بعد الفلترة)
    const presentCount = visibleStudents.filter((s) => s.isPresent).length;
    const absentCount = visibleStudents.length - presentCount;
    const attendanceRate =
      visibleStudents.length > 0
        ? Math.round((presentCount / visibleStudents.length) * 100)
        : 0;

    return {
      totalStudents,
      presentCount,
      absentCount,
      attendanceRate,
    };
  }, [allStudents, visibleStudents]);

  // تحديث آخر قيم مستقرة عندما يكتمل التحميل
  // استخدام deep comparison لتجنب updates غير ضرورية
  useEffect(() => {
    if (!isLoadingDate) {
      const { totalStudents, presentCount, absentCount, attendanceRate } = currentStats;
      const lastStats = lastStableStats.current;
      
      // تحديث فقط إذا تغيرت القيم فعلياً
      if (
        lastStats.totalStudents !== totalStudents ||
        lastStats.presentCount !== presentCount ||
        lastStats.absentCount !== absentCount ||
        lastStats.attendanceRate !== attendanceRate
      ) {
        lastStableStats.current = currentStats;
      }
    }
  }, [isLoadingDate, currentStats]);

  // الإحصائيات المعروضة: أثناء التحميل نستخدم آخر قيم مستقرة
  const displayStats = useMemo(() => {
    if (isLoadingDate) {
      return lastStableStats.current;
    }
    return currentStats;
  }, [isLoadingDate, currentStats]);

  return {
    // الإحصائيات المعروضة في الكاردات (مستقرة)
    displayStats,
    // الأرقام الحقيقية الحالية
    realStats: currentStats,
  };
};
