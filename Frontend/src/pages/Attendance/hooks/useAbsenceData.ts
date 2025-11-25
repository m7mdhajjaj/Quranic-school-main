// hooks/useAbsenceData.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  LoggedInUser,
  AttendanceStudent,
  MonthlyAbsence,
} from '../types/absence.types';
import { getAttendanceByDate } from '@/Api/attendanceApi';
import { todayISO } from '../utils/dateHelpers';

export const useAbsenceData = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [date, setDate] = useState<string>(todayISO());
  const [monthlyStats, setMonthlyStats] = useState<MonthlyAbsence[]>([]);
  const [teacherGroups, setTeacherGroups] = useState<Array<{ 
    _id: string; 
    name: string; 
    totalStudents?: number;
  }>>([]);

  // Fetch students for teacher
  const fetchStudentsForTeacher = useCallback(async (forDate: string) => {
    try {
      setError(null);
      console.log('⚡ [OPTIMIZED V2] بدء جلب الطلاب عن طريق ID المعلم...');
      const startTime = Date.now();

      if (!currentUser?._id) {
        console.error('❌ معرف المعلم غير موجود');
        setError('معرف المعلم غير موجود');
        return;
      }

      // 🆕 استخدام API الجديد المحسّن - جلب الحلقات مع الطلاب
      const { getGroupsByTeacherIdWithFilters } = await import(
        '../../../Api/groupApi'
      );

      // جلب جميع الحلقات مع الطلاب
      const groupsResult = await getGroupsByTeacherIdWithFilters(
        currentUser._id,
        'all', // جميع الحلقات (فيها طلاب + فارغة)
        true   // جلب معلومات الطلاب
      );

      if (!groupsResult.success || !groupsResult.data) {
        console.error('❌ فشل جلب حلقات المعلم:', groupsResult.message);
        setError(groupsResult.message || 'تعذر جلب بيانات الحلقات');
        return;
      }

      const { teacher, groups, summary } = groupsResult.data;
      
      console.log(`📊 تم استلام بيانات المعلم: ${teacher.name}`);
      console.log(`📚 ملخص الحلقات:`, summary);
      
      // عرض تفاصيل كل حلقة مع عدد طلابها
      groups.forEach(group => {
        console.log(`   📖 ${group.name}: ${group.totalStudents || 0} طالب`);
      });

      // حفظ جميع الحلقات (سواء فيها طلاب أو فارغة)
      setTeacherGroups(groups.map(g => ({ 
        _id: g._id, 
        name: g.name,
        totalStudents: g.totalStudents || 0
      })));
      console.log(`💾 تم حفظ ${groups.length} حلقة في state`);

      // استخراج الطلاب من جميع الحلقات
      const allStudents = groups.flatMap(group => 
        (group.students || []).map(student => ({
          ...student,
          group: group.name,
          teacher: teacher.name,
        }))
      );

      console.log(`👥 إجمالي الطلاب: ${allStudents.length}`);

      if (allStudents.length === 0) {
        console.warn('⚠️ لم يتم العثور على طلاب لهذا المعلم');
        console.warn(`   المعلم: ${teacher.name} (ID: ${teacher._id})`);
        console.warn(`   عدد الحلقات: ${groups.length}`);
        console.warn(`   الحلقات: ${groups.map(g => g.name).join(', ') || 'لا توجد حلقات'}`);
      }

      // جلب إحصائيات الغياب للطلاب
      const { getStudentsWithAbsenceStats } = await import(
        '../../../Api/studentApi'
      );
      
      const studentsWithAbsenceData = await getStudentsWithAbsenceStats(teacher.name);

      // دمج بيانات الطلاب مع إحصائيات الغياب
      const absenceMap = new Map(
        studentsWithAbsenceData.map(s => [s._id, {
          totalAbsences: s.totalAbsences,
          absenceDates: s.absenceDates
        }])
      );

      let formatted: AttendanceStudent[] = allStudents.map((s) => {
        const absenceData = absenceMap.get(s._id);
        return {
          _id: s._id,
          studentId: s.studentId,
          name: s.name,
          group: s.group || 'بدون حلقة',
          teacher: s.teacher,
          isPresent: true,
          totalAbsences: absenceData?.totalAbsences || 0,
          absenceDates: (absenceData?.absenceDates || [])
            .map((date: any) => {
              const d = new Date(date);
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = d.getFullYear();
              return `${day}/${month}/${year}`;
            })
            .sort((a, b) => {
              const [dayA, monthA, yearA] = a.split('/').map(Number);
              const [dayB, monthB, yearB] = b.split('/').map(Number);
              const dateA = new Date(yearA, monthA - 1, dayA);
              const dateB = new Date(yearB, monthB - 1, dayB);
              return dateB.getTime() - dateA.getTime();
            }),
        };
      });

      const duration = Date.now() - startTime;
      console.log(
        `✅ [OPTIMIZED V2] تم جلب ${formatted.length} طالب مع الإحصائيات في ${duration}ms`
      );

      // جلب بيانات الحضور للتاريخ المحدد
      try {
        const attData = await getAttendanceByDate(forDate);
        if (Array.isArray(attData) && attData.length > 0) {
          const map = new Map<string, boolean>();
          attData.forEach((rec: any) => map.set(rec.studentId, rec.isPresent));
          formatted = formatted.map((st) => ({
            ...st,
            isPresent: map.has(st._id) ? map.get(st._id)! : true,
          }));
        }
      } catch {
        // لا يوجد سجل لهذا التاريخ
      }

      setStudents(formatted);
    } catch (e) {
      console.error('❌ خطأ في جلب بيانات الطلاب:', e);
      setError('تعذر جلب بيانات الطلاب');
    }
  }, [currentUser]);

  // Fetch student absence stats
  const fetchStudentAbsenceStats = useCallback(async (studentId: string) => {
    try {
      setError(null);
      const { getStudentAttendance } = await import(
        '../../../Api/attendanceApi'
      );
      const data = await getStudentAttendance(studentId);

      const grouped: Record<string, { absences: number; total: number }> = {};
      data.forEach((r: any) => {
        const d = new Date(r.date);
        if (isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!grouped[key]) grouped[key] = { absences: 0, total: 0 };
        grouped[key].total++;
        if (!r.isPresent) grouped[key].absences++;
      });

      const { AR_MONTHS } = await import('../utils/dateHelpers');
      const stats: MonthlyAbsence[] = Object.entries(grouped).map(([k, v]) => {
        const [yy, m] = k.split('-').map(Number);
        const label = AR_MONTHS[m];
        const rate =
          v.total > 0 ? Math.round((v.absences / v.total) * 1000) / 10 : 0;
        return {
          month: `${label} ${yy}`,
          absenceCount: v.absences,
          totalDays: v.total,
          rate,
        };
      });

      stats.sort((a, b) => {
        const aLastSpace = a.month.lastIndexOf(' ');
        const bLastSpace = b.month.lastIndexOf(' ');
        const aLabel = a.month.substring(0, aLastSpace);
        const bLabel = b.month.substring(0, bLastSpace);
        const aYear = parseInt(a.month.substring(aLastSpace + 1), 10);
        const bYear = parseInt(b.month.substring(bLastSpace + 1), 10);

        if (aYear !== bYear) return aYear - bYear;
        const aIdx = AR_MONTHS.findIndex((x) => x === aLabel);
        const bIdx = AR_MONTHS.findIndex((x) => x === bLabel);
        return aIdx - bIdx;
      });

      setMonthlyStats(stats);
    } catch (e) {
      console.error(e);
      setMonthlyStats([]);
      setError('تعذر جلب إحصائيات الغياب');
    }
  }, []);

  // Initialize user (مرة واحدة فقط عند التحميل)
  useEffect(() => {
    const run = async () => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) {
          navigate('/login');
          return;
        }
        const user: LoggedInUser = JSON.parse(raw);
        setCurrentUser(user);
      } catch (e) {
        console.error(e);
        setError('حدث خطأ أثناء جلب البيانات');
      }
    };
    run();
  }, [navigate]);

  return {
    currentUser,
    error,
    students,
    setStudents,
    date,
    setDate,
    monthlyStats,
    teacherGroups,
    fetchStudentsForTeacher,
    fetchStudentAbsenceStats,
  };
};
