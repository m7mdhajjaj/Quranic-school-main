import { useMemo, useRef, useEffect } from 'react';
import type { UseAttendanceStatsProps, AttendanceStats } from '../types/absence.types';

/**
 * Hook لحساب إحصائيات الحضور مع حماية ضد الـ flicker
 * 
 * ملاحظة: الحسابات تتم في Frontend للسرعة والاستجابة الفورية.
 * البيانات الأساسية (totalAbsences, absenceDates) تأتي من Backend محسوبة مسبقاً.
 * 
 * الإحصائيات المحسوبة هنا هي:
 * - presentCount: عدد الحاضرين (من الطلاب المرئيين بعد الفلترة)
 * - absentCount: عدد الغائبين (من الطلاب المرئيين بعد الفلترة)
 * - attendanceRate: نسبة الحضور (للطلاب المرئيين)
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

  // حساب الإحصائيات الحالية في Frontend (للاستجابة الفورية)
  const currentStats = useMemo(() => {
    // إجمالي الطلاب = الطلاب المرئيين (بعد الفلترة بالحلقة)
    const totalStudents = visibleStudents.length;
    // الحاضرون والغائبون = من الطلاب المرئيين
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
  }, [visibleStudents]);

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
