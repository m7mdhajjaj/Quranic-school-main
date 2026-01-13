// hooks/useAbsenceData.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  LoggedInUser,
  AttendanceStudent,
  MonthlyAbsence,
} from '../types/absence.types';
import { todayISO } from '../utils/dateHelpers';

export const useAbsenceData = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [date, setDate] = useState<string>(todayISO());
  const [startDate, setStartDate] = useState<string | null>(todayISO());
  const [endDate, setEndDate] = useState<string | null>(todayISO());

  const setDateRange = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
    // Use end date as the primary date for fetching/displaying current status
    if (end) setDate(end);
    else if (start) setDate(start);
  };

  const [monthlyStats, setMonthlyStats] = useState<MonthlyAbsence[]>([]);
  const [teacherGroups, setTeacherGroups] = useState<Array<{ 
    _id: string; 
    name: string; 
    status?: string;
    totalStudents?: number;
  }>>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Fetch students for teacher
  const fetchStudentsForTeacher = useCallback(async (forDate: string) => {
    try {
      setError(null);

      if (!currentUser?._id) {
        console.error('❌ معرف المعلم غير موجود');
        setError('معرف المعلم غير موجود');
        return;
      }

      // 🆕 استخدام API المحسّن - يرجع كل شي مدموج!
      const { getTeacherGroupsForAttendance } = await import(
        '../../../Api/attendanceApi'
      );

      // جلب كل البيانات (حلقات + طلاب + حضور + إحصائيات) من طلب واحد!
      const result = await getTeacherGroupsForAttendance(
        currentUser._id,
        forDate, // التاريخ المطلوب
        'all',   // جميع الحلقات
        true     // تضمين إحصائيات الغياب
      );

      if (!result.success || !result.data) {
        console.error('❌ فشل جلب البيانات:', result.message);
        
        // 🆕 رسالة خاصة إذا لم يكن هناك مقطع في التاريخ المحدد
        if (result.noSection) {
          setError(`⚠️ ${result.message}`);
        } else {
          setError(result.message || 'تعذر جلب بيانات الحضور');
        }
        
        // مسح بيانات الطلاب عند الفشل
        setStudents([]);
        return;
      }

      const { groups, students } = result.data;
      
      // حفظ الحلقات
      setTeacherGroups(groups.map(g => ({ 
        _id: g._id, 
        name: g.name,
        status: g.status || 'active', // Default to active if not provided
        totalStudents: g.totalStudents || 0,
        overallAttendanceRate: g.overallAttendanceRate || 0 // 🆕 Added
      })));

      // البيانات جاهزة للاستخدام مباشرة! 🎉
      // كل شي مدموج من الباك اند:
      // ✅ الطلاب مع الحلقات
      // ✅ حضور التاريخ المحدد (isPresent)
      // ✅ إحصائيات الغياب (totalAbsences, absenceDates)
      // ✅ التواريخ منسقة DD/MM/YYYY ومرتبة
      const formatted: AttendanceStudent[] = students.map(s => ({
        _id: s._id,
        studentId: s.studentId,
        name: s.name,
        gender: s.gender,           // 🆕 إضافة الجنس
        phoneNumber: s.phoneNumber, // 🆕 إضافة رقم الهاتف
        group: s.group || 'بدون حلقة',
        teacher: s.teacher,
        isPresent: s.isPresent,
        totalAbsences: s.totalAbsences,
        absenceDates: s.absenceDates,
        attendanceRate: s.attendanceRate // 🆕 Added
      }));

      setStudents(formatted);
    } catch (e) {
      console.error('❌ خطأ في جلب بيانات الطلاب:', e);
      setError('تعذر جلب بيانات الطلاب');
    }
  }, [currentUser]);

  // Fetch student absence stats (Backend يحسب كل شي!)
  const fetchStudentAbsenceStats = useCallback(async (studentId: string) => {
    try {
      setError(null);
      const { getStudentAttendanceStats } = await import(
        '../../../Api/attendanceApi'
      );
      
      // Backend يرجع البيانات جاهزة! 🚀
      const result = await getStudentAttendanceStats(studentId);
      
      if (result.success && result.data) {
        setMonthlyStats(result.data);
      } else {
        setMonthlyStats([]);
        setError('تعذر جلب إحصائيات الغياب');
      }
    } catch (e) {
      console.error(e);
      setMonthlyStats([]);
      setError('تعذر جلب إحصائيات الغياب');
    }
  }, []);

  // Fetch available dates (sections dates) for a group
  const fetchAvailableDates = useCallback(async (groupId?: string) => {
    try {
      if (!currentUser?._id) return;

      const { getAvailableDates } = await import('../../../Api/attendanceApi');
      const result = await getAvailableDates(currentUser._id, groupId);

      if (result.success && result.data) {
        setAvailableDates(result.data.dates);
      } else {
        setAvailableDates([]);
      }
    } catch (e) {
      console.error('❌ خطأ في جلب التواريخ المتاحة:', e);
      setAvailableDates([]);
    }
  }, [currentUser]);

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
    startDate,
    endDate,
    setDateRange,
    monthlyStats,
    teacherGroups,
    availableDates,
    fetchStudentsForTeacher,
    fetchStudentAbsenceStats,
    fetchAvailableDates,
  };
};
