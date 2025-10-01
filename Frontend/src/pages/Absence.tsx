// Absence.tsx
// =========================================
// شاشة الحضور والغياب (Teacher + Student)
// - واجهة المعلّم: تسجيل حضور/غياب يومي + فلترة حسب الحلقة + بحث
// - واجهة الطالب: إحصائيات الغياب شهرياً + إجمالي السنة
// - تحسينات: تحذير تغييرات غير محفوظة، فلترة شهر تعمل فعلياً
// =========================================

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/api";

// ================== الإعدادات العامة ==================
// API_URL is now handled by the api instance

// ---------- Types ----------
interface Student {
  _id: string;
  studentId: number;
  firstName: string;
  fatherName: string;
  lastName: string;
  group?: string;
}

interface LoggedInUser {
  _id: string;
  firstName: string;
  lastName?: string;
  fatherName?: string;
  group?: string;
  groups?: string[];
  role: "student" | "teacher" | "admin";
}

interface AttendanceStudent {
  _id: string;
  studentId: number;
  name: string;
  group?: string;
  isPresent: boolean;
}

interface MonthlyAbsence {
  month: string; // مثال: "يناير (01) 2025"
  absenceCount: number;
  totalDays: number;
  rate: number; // نسبة %
}

interface AttendanceRecordPayload {
  studentId: string;
  date: string; // "YYYY-MM-DD"
  isPresent: boolean;
}

// أسماء الشهور بالعربي + رقم الشهر
const AR_MONTHS = [
  "يناير (01)",
  "فبراير (02)",
  "مارس (03)",
  "أبريل (04)",
  "مايو (05)",
  "يونيو (06)",
  "يوليو (07)",
  "أغسطس (08)",
  "سبتمبر (09)",
  "أكتوبر (10)",
  "نوفمبر (11)",
  "ديسمبر (12)",
];

// مساعد: تاريخ اليوم بصيغة "YYYY-MM-DD"
const todayISO = () => new Date().toISOString().split("T")[0];

// ================== المكوّن الرئيسي ==================
const Absence = () => {
  const navigate = useNavigate();

  // --------- حالات عامة ---------
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------- حالات واجهة المعلّم ---------
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [date, setDate] = useState<string>(todayISO());
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // فلترة + بحث
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [nameQuery, setNameQuery] = useState<string>("");

  // --------- حالات واجهة الطالب ---------
  const [monthlyStats, setMonthlyStats] = useState<MonthlyAbsence[]>([]);
  const [yearMonth, setYearMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // "YYYY-MM"
  );
  const [showYearSummary, setShowYearSummary] = useState<boolean>(false);

  // لتجنّب التحذير على أول تحميل
  const initialLoadRef = useRef(true);

  // ================== جلب المستخدم وتحديد الواجهة ==================
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // إعادة الجلب للمعلّم عند تغيير التاريخ
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "teacher" || currentUser.role === "admin") {
      fetchStudentsForTeacher(date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // إعادة الجلب للطالب عند تغيير الشهر/السنة
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "student") {
      fetchStudentAbsenceStats(currentUser._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearMonth]);

  // تحذير تغييرات غير محفوظة عند إغلاق الصفحة
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [unsavedChanges]);

  // ================== طلبات المعلّم ==================
  const fetchStudentsForTeacher = async (forDate: string) => {
    try {
      setError(null);

      // 1) جلب جميع الطلاب
      const studentsRes = await api.get('/students');
      const rawStudents: Student[] = Array.isArray(studentsRes.data)
        ? studentsRes.data
        : [];

      // 2) تشكيل بيانات العرض
      let formatted: AttendanceStudent[] = rawStudents.map((s) => ({
        _id: s._id,
        studentId: s.studentId,
        name: `${s.firstName} ${s.fatherName ?? ""} ${s.lastName ?? ""}`.trim(),
        group: s.group,
        isPresent: true, // افتراضياً الكل حاضر
      }));

      // 3) جلب حضور اليوم المحدد (إن وجد)
      try {
        const attRes = await api.get(`/attendance/date/${forDate}`);
        if (Array.isArray(attRes.data) && attRes.data.length > 0) {
          const map = new Map<string, boolean>();
          attRes.data.forEach((rec: any) =>
            map.set(rec.studentId, rec.isPresent)
          );
          formatted = formatted.map((st) => ({
            ...st,
            isPresent: map.has(st._id) ? map.get(st._id)! : true,
          }));
        }
      } catch {
        // لا يوجد سجل لهذا التاريخ — ليس خطأ
      }

      setStudents(formatted);
      setIsEditing(false);
      setUnsavedChanges(false);
      setSelectedAll(formatted.every((s) => s.isPresent));
    } catch (e) {
      console.error(e);
      setError("تعذر جلب بيانات الطلاب");
    }
  };

  // ================== طلبات الطالب ==================
  const fetchStudentAbsenceStats = async (studentId: string) => {
    try {
      setError(null);
      const res = await api.get(`/attendance/student/${studentId}`);
      const data = Array.isArray(res.data) ? res.data : [];

      // تجميع حسب الشهر/السنة
      const grouped: Record<string, { absences: number; total: number }> = {};
      data.forEach((r: any) => {
        const d = new Date(r.date);
        if (isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${d.getMonth()}`; // year-monthIndex
        if (!grouped[key]) grouped[key] = { absences: 0, total: 0 };
        grouped[key].total++;
        if (!r.isPresent) grouped[key].absences++;
      });

      // تحويل إلى MonthlyAbsence[] (نستخدم AR_MONTHS بالمسمى + الرقم)
      const stats: MonthlyAbsence[] = Object.entries(grouped).map(([k, v]) => {
        const [yy, m] = k.split("-").map(Number);
        const label = AR_MONTHS[m]; // مثال: "يناير (01)"
        const rate =
          v.total > 0 ? Math.round((v.absences / v.total) * 1000) / 10 : 0;
        return {
          month: `${label} ${yy}`, // مثال: "يناير (01) 2025"
          absenceCount: v.absences,
          totalDays: v.total,
          rate,
        };
      });

      // ترتيب زمني
      stats.sort((a, b) => {
        // افصل آخر "مسافة" للحصول على السنة
        const aLastSpace = a.month.lastIndexOf(" ");
        const bLastSpace = b.month.lastIndexOf(" ");
        const aLabel = a.month.substring(0, aLastSpace); // "يناير (01)"
        const bLabel = b.month.substring(0, bLastSpace); // "فبراير (02)"
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

  // ================== منطق واجهة المعلّم ==================
  const presentCount = useMemo(
    () => students.filter((s) => s.isPresent).length,
    [students]
  );
  const absentCount = useMemo(
    () => students.length - presentCount,
    [students, presentCount]
  );
  const attendanceRate = useMemo(
    () =>
      students.length ? Math.round((presentCount / students.length) * 100) : 0,
    [students.length, presentCount]
  );

  // مجموعات (Groups) موجودة عند الطلاب
  const groupsAvailable = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.group && set.add(s.group));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b, "ar"))];
  }, [students]);

  // فلترة + بحث (Teacher)
  const visibleStudents = useMemo(() => {
    let list = [...students];
    if (groupFilter !== "all") {
      list = list.filter((s) => (s.group ?? "") === groupFilter);
    }
    if (nameQuery.trim()) {
      const q = nameQuery.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    // ترتيب أبجدي عربي
    return list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [students, groupFilter, nameQuery]);

  // قلب حالة طالب
  const toggleStudentPresence = (studentId: string) => {
    if (!isEditing) return;
    setStudents((prev) => {
      const next = prev.map((s) =>
        s._id === studentId ? { ...s, isPresent: !s.isPresent } : s
      );
      setUnsavedChanges(true);
      return next;
    });
  };

  // اختيار/إلغاء اختيار الكل
  const toggleAllStudents = () => {
    if (!isEditing) return;
    const newState = !selectedAll;
    setSelectedAll(newState);
    setStudents((prev) => {
      const next = prev.map((s) => ({ ...s, isPresent: newState }));
      setUnsavedChanges(true);
      return next;
    });
  };

  // بدء/إلغاء وضع التعديل
  const toggleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      initialLoadRef.current = false;
      return;
    }
    // إذا في تغييرات غير محفوظة
    if (unsavedChanges) {
      const ok = window.confirm("لديك تعديلات غير محفوظة، هل تريد تجاهلها؟");
      if (!ok) return;
      // أعد التحميل من السيرفر لإلغاء أي تعديل محلي
      fetchStudentsForTeacher(date);
    }
    setIsEditing(false);
    setUnsavedChanges(false);
  };

  // حفظ السجل
  const handleSave = async () => {
    try {
      const payload: AttendanceRecordPayload[] = students.map((s) => ({
        studentId: s._id,
        date,
        isPresent: s.isPresent,
      }));

      await api.post('/attendance', {
        date,
        records: payload,
      });

      setIsEditing(false);
      setUnsavedChanges(false);
      alert("تم حفظ سجل الحضور بنجاح ✅");
    } catch (e: any) {
      console.error(e);
      if (e.response) {
        alert(e.response?.data?.message ?? "تعذر حفظ السجل");
      } else {
        alert("تعذر حفظ السجل");
      }
    }
  };

  // منع تغيير التاريخ عند وجود تغييرات غير محفوظة
  const safeSetDate = (nextDate: string) => {
    if (isEditing && unsavedChanges) {
      const ok = window.confirm(
        "لديك تغييرات غير محفوظة. تغيير التاريخ سيلغيها. المتابعة؟"
      );
      if (!ok) return;
    }
    setDate(nextDate);
  };

  // ================== منطق واجهة الطالب ==================
  // السنة والشهر المختارين من input type="month"
  const selectedYear = useMemo(
    () => parseInt(yearMonth.split("-")[0], 10),
    [yearMonth]
  );
  const selectedMonthIndex = useMemo(
    () => Math.max(0, parseInt(yearMonth.split("-")[1], 10) - 1),
    [yearMonth]
  );

  // فلترة السجل ليعرض فقط الشهر المحدد
  const filteredMonthlyStats = useMemo(() => {
    return monthlyStats.filter((stat) => {
      // stat.month شكلها: "يناير (01) 2025"
      const lastSpace = stat.month.lastIndexOf(" ");
      if (lastSpace < 0) return false;
      const label = stat.month.substring(0, lastSpace); // "يناير (01)"
      const yy = parseInt(stat.month.substring(lastSpace + 1), 10);
      const mmIndex = AR_MONTHS.findIndex((x) => x === label);
      return yy === selectedYear && mmIndex === selectedMonthIndex;
    });
  }, [monthlyStats, selectedYear, selectedMonthIndex]);

  // إجمالي السنة للطالب (حسب السنة المختارة)
  const yearTotals = useMemo(() => {
    const statsForYear = monthlyStats.filter((stat) => {
      const lastSpace = stat.month.lastIndexOf(" ");
      const yy = parseInt(stat.month.substring(lastSpace + 1), 10);
      return yy === selectedYear;
    });
    const absenceCount = statsForYear.reduce((a, m) => a + m.absenceCount, 0);
    const totalDays = statsForYear.reduce((a, m) => a + m.totalDays, 0);
    const rate = totalDays
      ? Math.round((absenceCount / totalDays) * 1000) / 10
      : 0;
    return { absenceCount, totalDays, rate };
  }, [monthlyStats, selectedYear]);

  // صندوق صغير يبين رقم الغياب للشهر المحدد (اختياري)
  const selectedMonthSummary = useMemo(() => {
    if (filteredMonthlyStats.length === 0) {
      return { absenceCount: 0, totalDays: 0, rate: 0 };
    }
    return filteredMonthlyStats[0];
  }, [filteredMonthlyStats]);

  // ================== واجهة المستخدم ==================
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4"
      dir="rtl">
      <div className="container mx-auto max-w-6xl">
        {/* العنوان */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            سجل الحضور والغياب
          </h1>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {currentUser?.role === "student"
              ? "اطّلع على سجل غيابك الشهري وإجمالي السنة"
              : "سجّل حضور الطلاب يومياً مع أدوات فلترة وبحث"}
          </p>
        </div>

        {/* حالة التحميل/الخطأ */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">جاري تحميل البيانات...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : currentUser?.role === "student" ? (
          /* ================== واجهة الطالب ================== */
          <div className="grid grid-cols-1 gap-6">
            {/* شريط أدوات الطالب */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الشهر:
                  </label>
                  <div className="flex gap-3 items-center">
                    {/* اختيار بالشهر (input) */}
                    {/* <input
                      type="month"
                      value={yearMonth}
                      onChange={(e) => setYearMonth(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    /> */}

                    {/* اختيار من قائمة عربية */}
                    <select
                      value={selectedMonthIndex}
                      onChange={(e) => {
                        const newMonth = parseInt(e.target.value, 10);
                        const newYear = selectedYear;
                        setYearMonth(
                          `${newYear}-${String(newMonth + 1).padStart(2, "0")}`
                        );
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      {AR_MONTHS.map((label, idx) => (
                        <option key={idx} value={idx}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="ml-2"
                      checked={showYearSummary}
                      onChange={() => setShowYearSummary((v) => !v)}
                    />
                    عرض إجمالي السنة {selectedYear}
                  </label>
                </div>
              </div>
            </div>

            {/* نص توضيحي فوق بطاقات إجمالي السنة */}
            {showYearSummary && (
              <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
                <p className="text-sm text-gray-700 font-medium">
                  هذا عدد الغيابات في السنة المحددة ({selectedYear})، مع إجمالي
                  أيام الدراسة ونسبة الغياب العامة.
                </p>
              </div>
            )}

            {/* إجمالي السنة (اختياري) */}
            {showYearSummary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow text-center border-r-4 border-emerald-500">
                  <div className="text-sm text-gray-600 mb-1">
                    إجمالي الغياب
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {yearTotals.absenceCount}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow text-center border-r-4 border-blue-500">
                  <div className="text-sm text-gray-600 mb-1">
                    إجمالي الأيام
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {yearTotals.totalDays}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow text-center border-r-4 border-amber-500">
                  <div className="text-sm text-gray-600 mb-1">نسبة الغياب</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {yearTotals.rate}%
                  </div>
                </div>
              </div>
            )}

            {/* لمحة عن الشهر المحدد */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow text-center border-r-4 border-red-500">
                <div className="text-sm text-gray-600 mb-1">
                  غياب الشهر المحدد
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {selectedMonthSummary.absenceCount}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow text-center border-r-4 border-blue-500">
                <div className="text-sm text-gray-600 mb-1">
                  إجمالي أيام الشهر
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {selectedMonthSummary.totalDays}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow text-center border-r-4 border-amber-500">
                <div className="text-sm text-gray-600 mb-1">نسبة الشهر</div>
                <div className="text-2xl font-bold text-amber-600">
                  {selectedMonthSummary.rate}%
                </div>
              </div>
            </div> */}

            {/* جدول السجل (الشهر المحدد فقط) */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6">
                <h2 className="text-xl font-bold text-white">
                  سجل الغيابات للشهر المحدد
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                        الشهر
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                        أيام الغياب
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                        إجمالي الأيام
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                        نسبة الغياب
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMonthlyStats.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-6 text-gray-500">
                          لا توجد بيانات للعرض في هذا الشهر
                        </td>
                      </tr>
                    ) : (
                      filteredMonthlyStats.map((m) => (
                        <tr key={m.month} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {m.month}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                m.absenceCount === 0
                                  ? "bg-green-100 text-green-800"
                                  : m.absenceCount <= 2
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                              {m.absenceCount}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-500">
                            {m.totalDays}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 mx-auto max-w-[150px]">
                              <div
                                className={`h-2.5 rounded-full ${
                                  m.rate === 0
                                    ? "bg-green-500"
                                    : m.rate <= 10
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(m.rate * 3, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {m.rate}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ملاحظة للطالب */}
              <div className="p-4 bg-gray-50">
                <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2 text-blue-500 mt-0.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      ملاحظة مهمة
                    </p>
                    <p className="text-xs text-blue-700">
                      الحد المسموح للغياب هو 10% من أيام الدراسة. تجاوز هذه
                      النسبة قد يؤثر على التقييم النهائي.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================== واجهة المعلّم ================== */
          <div className="grid grid-cols-1 gap-6">
            {/* شريط أدوات */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* التاريخ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التاريخ:
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => safeSetDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                  />
                </div>

                {/* الفلترة بالمجموعة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحلقة:
                  </label>
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full">
                    {groupsAvailable.map((g) => (
                      <option key={g} value={g}>
                        {g === "all" ? "الكل" : g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* بحث */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    بحث بالاسم:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: أحمد..."
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                  />
                </div>

                {/* أزرار */}
                <div className="flex gap-2 items-end w-full">
                  <button
                    onClick={() => {
                      setSelectedAll(false);
                      toggleAllStudents();
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg ${
                      selectedAll
                        ? "bg-gray-200 text-gray-700"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                    disabled={!isEditing}>
                    {selectedAll ? "إلغاء تحديد الكل" : "تحديد الكل حاضر"}
                  </button>

                  <button
                    onClick={toggleEdit}
                    className={`px-3 py-2 rounded-lg ${
                      isEditing
                        ? "bg-red-100 text-red-700 "
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}>
                    {isEditing ? "إلغاء التعديل" : "تعديل السجل"}
                  </button>
                </div>
              </div>

              {/* إحصائيات اليوم */}
              <div className="grid grid-cols-3 gap-4 text-center mt-6">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">الحضور</p>
                  <p className="font-bold text-green-600 text-xl">
                    {presentCount}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">الغياب</p>
                  <p className="font-bold text-red-600 text-xl">
                    {absentCount}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">نسبة الحضور</p>
                  <p className="font-bold text-blue-600 text-xl">
                    {attendanceRate}%
                  </p>
                </div>
              </div>
            </div>

            {/* جدول الطلاب */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">قائمة الطلاب</h2>
                {unsavedChanges && (
                  <span className="text-yellow-100 text-sm font-medium">
                    لديك تغييرات غير محفوظة
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                        رقم الطالب
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                        اسم الطالب
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                        الحلقة
                      </th>
                      <th className="py-3 px-6 text-center text-sm font-medium text-gray-500">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedAll}
                            onChange={toggleAllStudents}
                            className={`w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 ${
                              !isEditing && "opacity-60 cursor-not-allowed"
                            }`}
                            disabled={!isEditing}
                          />
                          <span className="mr-2">الحضور</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {visibleStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-6 text-gray-500">
                          لا يوجد طلاب مطابقين للفلترة/البحث
                        </td>
                      </tr>
                    ) : (
                      visibleStudents.map((s) => (
                        <tr
                          key={s._id}
                          className={`hover:bg-gray-50 ${
                            isEditing ? "cursor-pointer" : ""
                          }`}
                          onClick={() => toggleStudentPresence(s._id)}>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {s.studentId}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {s.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {s.group ?? "-"}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={s.isPresent}
                              onChange={() => toggleStudentPresence(s._id)}
                              className={`w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 ${
                                !isEditing && "opacity-60 cursor-not-allowed"
                              }`}
                              disabled={!isEditing}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* أزرار حفظ */}
              <div className="p-4 bg-gray-50 flex justify-center">
                <button
                  onClick={handleSave}
                  disabled={!isEditing}
                  className={`bg-emerald-600 text-white px-8 py-2 rounded-lg shadow-md flex items-center ${
                    !isEditing
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-emerald-700"
                  }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  حفظ السجل
                </button>
              </div>
            </div>

            {/* تعليمات سريعة */}
            <div className="mt-2 bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-gray-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1 text-amber-500"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                تعليمات:
              </h3>
              <ul className="text-gray-600 text-sm mr-6 list-disc space-y-1">
                <li>اضغط "تعديل السجل" لتفعيل التعديل.</li>
                <li>انقر على صفّ الطالب لقلب حالته (حاضر/غائب).</li>
                <li>خانة التحديد العلوية لاختيار الكل بسرعة.</li>
                <li>سيتم تحذيرك عند وجود تغييرات غير محفوظة قبل الخروج.</li>
                <li>استخدم البحث والفلترة حسب الحلقة لتسريع العمل.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Absence;
