// hooks/useAbsenceData.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  LoggedInUser,
  AttendanceStudent,
  MonthlyAbsence,
} from "../types/absence.types";
import { getAttendanceByDate } from "@/Api/attendanceApi";
import { todayISO } from "../utils/dateHelpers";

export const useAbsenceData = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [date, setDate] = useState<string>(todayISO());
  const [monthlyStats, setMonthlyStats] = useState<MonthlyAbsence[]>([]);

  // Fetch students for teacher
  const fetchStudentsForTeacher = async (forDate: string) => {
    try {
      setError(null);
      console.log("⚡ [OPTIMIZED] بدء جلب الطلاب مع إحصائيات الغياب...");
      const startTime = Date.now();

      const { getStudentsWithAbsenceStats } = await import(
        "../../../Api/studentApi"
      );

      const teacherName =
        currentUser?.role === "teacher"
          ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
          : undefined;

      const studentsWithStats = await getStudentsWithAbsenceStats(teacherName);

      let formatted: AttendanceStudent[] = studentsWithStats.map((s) => ({
        _id: s._id,
        studentId: s.studentId,
        name: s.name,
        group: s.group,
        teacher: s.teacher,
        isPresent: true,
        totalAbsences: s.totalAbsences,
        absenceDates: s.absenceDates
          .map((date: any) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
          })
          .sort((a, b) => {
            const [dayA, monthA, yearA] = a.split("/").map(Number);
            const [dayB, monthB, yearB] = b.split("/").map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateB.getTime() - dateA.getTime();
          }),
      }));

      const duration = Date.now() - startTime;
      console.log(
        `✅ [OPTIMIZED] تم جلب ${formatted.length} طالب مع الإحصائيات في ${duration}ms`
      );

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
      console.error(e);
      setError("تعذر جلب بيانات الطلاب");
    }
  };

  // Fetch student absence stats
  const fetchStudentAbsenceStats = async (studentId: string) => {
    try {
      setError(null);
      const { getStudentAttendance } = await import(
        "../../../Api/attendanceApi"
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

      const { AR_MONTHS } = await import("../utils/dateHelpers");
      const stats: MonthlyAbsence[] = Object.entries(grouped).map(([k, v]) => {
        const [yy, m] = k.split("-").map(Number);
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
        const aLastSpace = a.month.lastIndexOf(" ");
        const bLastSpace = b.month.lastIndexOf(" ");
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
      setError("تعذر جلب إحصائيات الغياب");
    }
  };

  // Initialize user
  useEffect(() => {
    const run = async () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) {
          navigate("/login");
          return;
        }
        const user: LoggedInUser = JSON.parse(raw);
        setCurrentUser(user);

        if (user.role === "teacher" || user.role === "admin") {
          await fetchStudentsForTeacher(date);
        } else {
          await fetchStudentAbsenceStats(user._id);
        }
      } catch (e) {
        console.error(e);
        setError("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [navigate]);

  return {
    currentUser,
    loading,
    error,
    students,
    setStudents,
    date,
    setDate,
    monthlyStats,
    fetchStudentsForTeacher,
    fetchStudentAbsenceStats,
  };
};
