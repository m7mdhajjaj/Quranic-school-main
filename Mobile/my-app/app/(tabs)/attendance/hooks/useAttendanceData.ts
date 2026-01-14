/**
 * Hook لإدارة بيانات الحضور والغياب
 * يتعامل مع جلب البيانات وإدارة الحالة للطالب والمعلم
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getTeacherGroupsForAttendance,
  getStudentAttendanceStats,
  bulkSaveAttendance,
  type AttendanceStudent,
} from "@/Api/attendanceApi";

// ============================================================================
// Types
// ============================================================================

export interface TeacherGroup {
  _id: string;
  name: string;
  status?: string;
  totalStudents?: number;
}

export interface MonthlyAbsence {
  month: string;
  absenceCount: number;
  totalDays: number;
  rate: number;
  absenceDates: string[];
}

export interface WeeklyStats {
  totalDays: number;
  absenceCount: number;
  presenceCount: number;
  rate: number;
  attendanceRate: number;
  weekStart: string;
  weekEnd: string;
  absenceDates: string[];
}

export interface CurrentMonthStats {
  totalDays: number;
  absenceCount: number;
  presenceCount: number;
  rate: number;
  attendanceRate: number;
  month: string;
  year: number;
  absenceDates: string[];
}

export interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

const todayISO = () => new Date().toISOString().split("T")[0];

const isDateTooOld = (date: string): boolean => {
  const selectedDate = new Date(date);
  const now = new Date();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  const timeDiff = now.getTime() - selectedDate.getTime();
  return timeDiff > ONE_WEEK;
};

const getDaysAgo = (date: string): number => {
  const selectedDate = new Date(date);
  const now = new Date();
  const timeDiff = now.getTime() - selectedDate.getTime();
  return Math.round(timeDiff / (1000 * 60 * 60 * 24));
};

// ============================================================================
// Main Hook
// ============================================================================

export const useAttendanceData = () => {
  const { user: currentUser } = useAuth();

  // State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [date, setDate] = useState<string>(todayISO());
  const [isAttendanceTaken, setIsAttendanceTaken] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Teacher-specific state
  const [teacherGroups, setTeacherGroups] = useState<TeacherGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<TeacherGroup | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Student-specific state
  const [monthlyStats, setMonthlyStats] = useState<MonthlyAbsence[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [currentMonthStats, setCurrentMonthStats] =
    useState<CurrentMonthStats | null>(null);

  // ============================================================================
  // Teacher Functions
  // ============================================================================

  /**
   * جلب بيانات الحلقات والطلاب للمعلم
   */
  const fetchStudentsForTeacher = useCallback(
    async (forDate: string) => {
      if (!currentUser?._id) {
        setError("معرف المعلم غير موجود");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getTeacherGroupsForAttendance(
          currentUser._id,
          forDate,
          "all",
          true
        );

        if (!result.success || !result.data) {
          if (result.noSection) {
            setError(`⚠️ ${result.message}`);
          } else {
            setError(result.message || "تعذر جلب بيانات الحضور");
          }
          setStudents([]);
          setIsAttendanceTaken(false);
          return;
        }

        const { groups, students: studentsData, attendanceInfo } = result.data;

        // حفظ حالة الحضور
        setIsAttendanceTaken(attendanceInfo?.isAttendanceTaken ?? false);

        // حفظ الحلقات
        setTeacherGroups(
          groups.map((g) => ({
            _id: g._id,
            name: g.name,
            status: "active",
            totalStudents: g.totalStudents || 0,
          }))
        );

        // تنسيق بيانات الطلاب
        const formatted: AttendanceStudent[] = studentsData.map((s) => ({
          _id: s._id,
          studentId: s.studentId,
          name: s.name,
          gender: s.gender,
          phoneNumber: s.phoneNumber,
          group: s.group || "بدون حلقة",
          teacher: s.teacher,
          isPresent: s.isPresent,
          totalAbsences: s.totalAbsences,
          absenceDates: s.absenceDates,
        }));

        setStudents(formatted);
      } catch (e) {
        console.error("❌ خطأ في جلب بيانات الطلاب:", e);
        setError("تعذر جلب بيانات الطلاب");
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  /**
   * حفظ الحضور
   */
  const saveAttendance = useCallback(async () => {
    if (!students.length) return { success: false, message: "لا يوجد طلاب" };

    const dateTooOld = isDateTooOld(date);
    if (dateTooOld) {
      return {
        success: false,
        message: `التاريخ قديم (${getDaysAgo(date)} يوم) - لا يمكن التعديل`,
      };
    }

    try {
      setIsSaving(true);

      // تصفية الطلاب حسب الحلقة المحددة
      const studentsToSave = selectedGroup
        ? students.filter((s) => s.group === selectedGroup.name)
        : students;

      const records = studentsToSave.map((s) => ({
        studentId: s._id,
        isPresent: s.isPresent,
      }));

      await bulkSaveAttendance({ date, records });

      setHasUnsavedChanges(false);
      setIsAttendanceTaken(true);

      return { success: true, message: "تم حفظ الحضور بنجاح" };
    } catch (e) {
      console.error("❌ خطأ في حفظ الحضور:", e);
      return { success: false, message: "تعذر حفظ الحضور" };
    } finally {
      setIsSaving(false);
    }
  }, [students, date, selectedGroup]);

  /**
   * تبديل حالة حضور طالب
   */
  const toggleStudentPresence = useCallback((studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId ? { ...s, isPresent: !s.isPresent } : s
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  /**
   * تبديل حالة جميع الطلاب
   */
  const toggleAllStudents = useCallback(
    (isPresent: boolean) => {
      setStudents((prev) => {
        // إذا كانت هناك حلقة محددة، نغير فقط طلاب تلك الحلقة
        if (selectedGroup) {
          return prev.map((s) =>
            s.group === selectedGroup.name ? { ...s, isPresent } : s
          );
        }
        return prev.map((s) => ({ ...s, isPresent }));
      });
      setHasUnsavedChanges(true);
    },
    [selectedGroup]
  );

  // ============================================================================
  // Student Functions
  // ============================================================================

  /**
   * جلب إحصائيات الغياب للطالب
   */
  const fetchStudentAbsenceStats = useCallback(
    async (month?: number, year?: number) => {
      if (!currentUser?._id) return;

      try {
        setLoading(true);
        setError(null);

        const result = await getStudentAttendanceStats(
          currentUser._id,
          month,
          year
        );

        if (result.success && result.data) {
          setMonthlyStats(result.data);
          if (result.weeklyStats) {
            setWeeklyStats(result.weeklyStats);
          }
          if (result.monthlyStats) {
            setCurrentMonthStats(result.monthlyStats);
          }
        } else {
          setMonthlyStats([]);
          setWeeklyStats(null);
          setCurrentMonthStats(null);
          setError("تعذر جلب إحصائيات الغياب");
        }
      } catch (e) {
        console.error("❌ خطأ في جلب إحصائيات الطالب:", e);
        setMonthlyStats([]);
        setWeeklyStats(null);
        setCurrentMonthStats(null);
        setError("تعذر جلب إحصائيات الغياب");
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // ============================================================================
  // Effects
  // ============================================================================

  // تحميل البيانات الأولية
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === "student") {
      fetchStudentAbsenceStats();
    } else if (currentUser.role === "teacher" || currentUser.role === "admin") {
      fetchStudentsForTeacher(date);
    }
  }, [currentUser?._id, currentUser?.role]);

  // تحديث بيانات الطلاب عند تغيير التاريخ (للمعلم)
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== "teacher" && currentUser.role !== "admin") return;

    fetchStudentsForTeacher(date);
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // Computed Values
  // ============================================================================

  // الطلاب المرئيين (حسب الحلقة المحددة)
  const visibleStudents = selectedGroup
    ? students.filter((s) => s.group === selectedGroup.name)
    : students;

  // إحصائيات الحضور
  const attendanceStats: AttendanceStats = {
    totalStudents: visibleStudents.length,
    presentCount: visibleStudents.filter((s) => s.isPresent).length,
    absentCount: visibleStudents.filter((s) => !s.isPresent).length,
    attendanceRate:
      visibleStudents.length > 0
        ? Math.round(
            (visibleStudents.filter((s) => s.isPresent).length /
              visibleStudents.length) *
              100
          )
        : 0,
  };

  // حالة التاريخ
  const dateTooOld = isDateTooOld(date);
  const daysAgo = getDaysAgo(date);

  // هل زر الحفظ معطل؟
  const isSaveDisabled =
    dateTooOld || (isAttendanceTaken && !hasUnsavedChanges);

  return {
    // User
    currentUser,

    // Loading & Error
    loading,
    error,

    // Students
    students,
    visibleStudents,
    setStudents,

    // Date
    date,
    setDate,
    dateTooOld,
    daysAgo,
    availableDates,

    // Attendance State
    isAttendanceTaken,
    hasUnsavedChanges,
    isSaving,
    isSaveDisabled,

    // Stats
    attendanceStats,

    // Teacher
    teacherGroups,
    selectedGroup,
    setSelectedGroup,

    // Student Stats
    monthlyStats,
    weeklyStats,
    currentMonthStats,

    // Actions
    fetchStudentsForTeacher,
    fetchStudentAbsenceStats,
    saveAttendance,
    toggleStudentPresence,
    toggleAllStudents,
  };
};
