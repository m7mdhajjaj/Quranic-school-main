

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AbsenceSkeleton } from "../components/Loading/LoadingSkeleton";
import { getAllStudents } from "../Api/studentApi";
import {
  getAttendanceByDate,
  getStudentAttendance,
  bulkSaveAttendance,
} from "../Api/attendanceApi";
import { useAbsenceSocket } from "../Socket";
import { showSuccessMessage, showErrorMessage } from "../utils/sweetalertUtils";

// ================== الإعدادات العامة ==================

// ---------- Types ----------
interface Student {
  _id: string;
  studentId: number;
  firstName: string;
  fatherName: string;
  lastName: string;
  group?: string;
  teacher?: string;
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
  teacher?: string;
  isPresent: boolean;
  totalAbsences?: number; // عدد مرات الغياب الإجمالي
  absenceDates?: string[]; // تواريخ الغيابات
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

  // استخدام نظام Socket الجديد مع Heartbeat تلقائي كل 30 ثانية
  const {
    isConnected: socketConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useAbsenceSocket();

  // --------- حالات عامة ---------
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حالة لإظهار/إخفاء مؤشر السوكيت (للمطورين فقط)
  const [showSocketIndicator, setShowSocketIndicator] = useState(false);

  // مستمع للوحة المفاتيح: الضغط على 'd' لإظهار/إخفاء مؤشر السوكيت
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'd' || event.key === 'D') {
        setShowSocketIndicator((prev) => {
          const newValue = !prev;
          console.log(`🔧 Socket Indicator ${newValue ? 'shown' : 'hidden'} (Debug Mode)`);
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // --------- حالات واجهة المعلّم ---------
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [date, setDate] = useState<string>(todayISO());
  const [selectedAll, setSelectedAll] = useState(false);

  // فلترة + بحث
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [nameQuery, setNameQuery] = useState<string>("");

  // حالة لتتبع الطالب المفتوحة قائمة غياباته
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // --------- حالات واجهة الطالب ---------
  const [monthlyStats, setMonthlyStats] = useState<MonthlyAbsence[]>([]);
  const [yearMonth, setYearMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // "YYYY-MM"
  );
  const [showYearSummary, setShowYearSummary] = useState<boolean>(false);

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

  // إعادة جلب البيانات عند تحديث Socket
  useEffect(() => {
    if (!socketLastUpdate || !currentUser) return;

    console.log('🔄 Socket update detected in Absence, refetching attendance...');
    
    const refetchData = async () => {
      try {
        if (currentUser.role === "teacher" || currentUser.role === "admin") {
          // إعادة جلب بيانات الحضور للمعلم
          await fetchStudentsForTeacher(date);
        } else if (currentUser.role === "student") {
          // إعادة جلب إحصائيات الغياب للطالب
          await fetchStudentAbsenceStats(currentUser._id);
        }
      } catch (err) {
        console.error("Error refetching attendance after socket update:", err);
      }
    };

    refetchData();
  }, [socketLastUpdate, currentUser, date]);

  // ================== طلبات المعلّم ==================
  const fetchStudentsForTeacher = async (forDate: string) => {
    try {
      setError(null);

      // 1) جلب جميع الطلاب
      const studentsRes = await getAllStudents();
      const rawStudents: Student[] =
        studentsRes.success && Array.isArray(studentsRes.data)
          ? studentsRes.data
          : [];

      // 2) فلترة الطلاب حسب المعلم الحالي
      let filteredStudents = rawStudents;

      if (currentUser?.role === "teacher") {
        // تجهيز أسماء مختلفة للمقارنة (لأن الاسم قد يكون مخزن بطرق مختلفة)
        const firstLast =
          `${currentUser.firstName} ${currentUser.lastName}`.trim();
        const firstFatherLast = `${currentUser.firstName} ${
          currentUser.fatherName || ""
        } ${currentUser.lastName || ""}`
          .trim()
          .replace(/\s+/g, " ");
        const possibleNames = [
          firstLast, // محمد حجاج
          firstFatherLast, // محمد سعد حجاج
          currentUser.firstName, // محمد (اسم أول فقط)
        ].filter((name) => name.length > 0);

        console.log("🔍 أسماء المعلم المحتملة للمقارنة:", possibleNames);

        console.log(" إجمالي الطلاب في النظام:", rawStudents.length);

        // جمع كل أسماء المعلمين الموجودة للتشخيص
        const allTeachers = new Set<string>();
        rawStudents.forEach((s) => {
          if (s.teacher) {
            allTeachers.add(s.teacher.trim());
          }
        });
        console.log("👥 جميع المعلمين في النظام:", Array.from(allTeachers));

        // فلترة الطلاب الذين يتبعون هذا المعلم فقط
        filteredStudents = rawStudents.filter((s) => {
          if (!s.teacher) {
            return false;
          }

          const studentTeacher = s.teacher
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();

          // مقارنة مع كل الأسماء المحتملة
          let isMatch = false;
          let matchedName = "";

          for (const possibleName of possibleNames) {
            const normalizedPossible = possibleName.toLowerCase();
            if (
              studentTeacher === normalizedPossible ||
              studentTeacher.includes(normalizedPossible) ||
              normalizedPossible.includes(studentTeacher)
            ) {
              isMatch = true;
              matchedName = possibleName;
              break;
            }
          }

          // طباعة معلومات للتشخيص (أول 5 طلاب)
          if (rawStudents.indexOf(s) < 5) {
            console.log(`🔎 الطالب: ${s.firstName}`);
            console.log(`   معلم الطالب: "${s.teacher}"`);
            console.log(`   معلم الطالب (منسق): "${studentTeacher}"`);
            console.log(`   الأسماء المحتملة: ${possibleNames.join(", ")}`);
            console.log(`   اسم المطابق: "${matchedName}"`);
            console.log(`   النتيجة: ${isMatch ? "✅ يطابق" : "❌ لا يطابق"}`);
            console.log("---");
          }

          return isMatch;
        });

        console.log(
          `✅ تم تصفية الطلاب: ${filteredStudents.length} من أصل ${rawStudents.length}`
        );
        console.log(`📋 الأسماء المستخدمة للمقارنة:`, possibleNames);

        if (filteredStudents.length === 0) {
          console.warn("⚠️ تحذير: لا يوجد طلاب لهذا المعلم!");
          console.log(
            "💡 تحقق من أن اسم المعلم في بيانات الطلاب يطابق أحد هذه الأسماء:",
            possibleNames
          );
        }
      }

      // 3) تشكيل بيانات العرض مع جلب إحصائيات الغياب
      let formatted: AttendanceStudent[] = await Promise.all(
        filteredStudents.map(async (s) => {
          // جلب سجل حضور الطالب لحساب الغيابات
          let totalAbsences = 0;
          let absenceDates: string[] = [];
          
          try {
            const studentAttendance = await getStudentAttendance(s._id);
            if (Array.isArray(studentAttendance)) {
              // تصفية الغيابات فقط
              const absences = studentAttendance.filter((record: any) => !record.isPresent);
              totalAbsences = absences.length;
              
              // استخراج التواريخ وترتيبها بتنسيق DD/MM/YYYY
              absenceDates = absences
                .map((record: any) => {
                  const date = new Date(record.date);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();
                  return `${day}/${month}/${year}`;
                })
                .sort((a, b) => {
                  // ترتيب من الأحدث للأقدم
                  const [dayA, monthA, yearA] = a.split('/').map(Number);
                  const [dayB, monthB, yearB] = b.split('/').map(Number);
                  const dateA = new Date(yearA, monthA - 1, dayA);
                  const dateB = new Date(yearB, monthB - 1, dayB);
                  return dateB.getTime() - dateA.getTime();
                });
            }
          } catch (err) {
            console.warn(`⚠️ Could not fetch absence data for student ${s._id}:`, err);
          }

          return {
            _id: s._id,
            studentId: s.studentId,
            name: `${s.firstName} ${s.fatherName ?? ""} ${s.lastName ?? ""}`.trim(),
            group: s.group,
            teacher: s.teacher,
            isPresent: true, // افتراضياً الكل حاضر
            totalAbsences,
            absenceDates,
          };
        })
      );

      console.log(`📊 تم جلب إحصائيات الغياب لـ ${formatted.length} طالب`);

      // 4) جلب حضور اليوم المحدد (إن وجد)
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
        // لا يوجد سجل لهذا التاريخ — ليس خطأ
      }

      setStudents(formatted);
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
      const data = await getStudentAttendance(studentId);

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

  // helper function للحصول على أسماء المعلم المحتملة
  const getTeacherPossibleNames = (user: LoggedInUser) => {
    const firstLast = `${user.firstName} ${user.lastName}`.trim();
    const firstFatherLast = `${user.firstName} ${user.fatherName || ""} ${
      user.lastName || ""
    }`
      .trim()
      .replace(/\s+/g, " ");
    return [firstLast, firstFatherLast, user.firstName].filter(
      (name) => name.length > 0
    );
  };

  // helper function للتحقق من تطابق المعلم
  const isTeacherMatch = (studentTeacher: string, possibleNames: string[]) => {
    const studentTeacherNormalized = studentTeacher
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
    return possibleNames.some((possibleName) => {
      const normalizedPossible = possibleName.toLowerCase();
      return (
        studentTeacherNormalized === normalizedPossible ||
        studentTeacherNormalized.includes(normalizedPossible) ||
        normalizedPossible.includes(studentTeacherNormalized)
      );
    });
  };

  // ================== منطق واجهة المعلّم ==================

  // حالة منفصلة لحلقات المعلم
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);

  // جلب حلقات المعلم من Groups API مباشرة
  useEffect(() => {
    const fetchTeacherGroups = async () => {
      if (!currentUser || currentUser.role !== "teacher") {
        setTeacherGroups([]);
        return;
      }

      try {
        console.log("🔍 جلب حلقات المعلم من Groups API...");

        // جلب الحلقات مباشرة من Groups API
        const { getAllGroups } = await import("../Api/groupApi");
        const groupsRes = await getAllGroups();

        if (!groupsRes.success || !Array.isArray(groupsRes.data)) {
          console.error("❌ فشل في جلب الحلقات");
          setTeacherGroups([]);
          return;
        }

        const possibleNames = getTeacherPossibleNames(currentUser);
        console.log("📋 أسماء المعلم المحتملة:", possibleNames);
        console.log("📊 إجمالي الحلقات في النظام:", groupsRes.data.length);

        // فلترة الحلقات التي تخص هذا المعلم
        const teacherGroupsData = groupsRes.data.filter((group: any) => {
          if (!group.teacher) {
            return false;
          }

          const isMatch = isTeacherMatch(group.teacher, possibleNames);
          if (isMatch) {
            console.log(
              `✅ حلقة مطابقة: ${group.name} - معلمها: ${group.teacher}`
            );
          }
          return isMatch;
        });

        const groupNames = teacherGroupsData
          .map((g: any) => g.name)
          .sort((a: string, b: string) => a.localeCompare(b, "ar"));
        console.log(`📋 حلقات المعلم النهائية:`, groupNames);
        setTeacherGroups(groupNames);
      } catch (error) {
        console.error("خطأ في جلب حلقات المعلم:", error);
        setTeacherGroups([]);
      }
    };

    fetchTeacherGroups();
  }, [currentUser]);

  // مجموعات (Groups) موجودة عند الطلاب
  const groupsAvailable = useMemo(() => {
    if (currentUser?.role === "teacher") {
      // للمعلم: استخدم الحلقات المجلبة مسبقاً
      return teacherGroups;
    } else {
      // للأدمن: عرض كل الحلقات مع خيار "الكل"
      const set = new Set<string>();
      students.forEach((s) => s.group && set.add(s.group));
      return [
        "all",
        ...Array.from(set).sort((a, b) => a.localeCompare(b, "ar")),
      ];
    }
  }, [currentUser, teacherGroups, students]);

  // تحديد أول حلقة تلقائياً للمعلم
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "teacher" && groupsAvailable.length > 0) {
      // إذا كان الفلتر على "all" أو فارغ، حدد أول حلقة
      if (groupFilter === "all" || !groupsAvailable.includes(groupFilter)) {
        const firstGroup = groupsAvailable[0];
        console.log(`📌 تحديد الحلقة الأولى تلقائياً: ${firstGroup}`);
        setGroupFilter(firstGroup);
      }
    }
  }, [currentUser, groupsAvailable, groupFilter]);

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

  // تحديث حالة "تحديد الكل" حسب الطلاب المرئيين فقط
  useEffect(() => {
    if (visibleStudents.length > 0) {
      const allVisible = visibleStudents.every((s) => s.isPresent);
      setSelectedAll(allVisible);
    } else {
      setSelectedAll(false);
    }
  }, [visibleStudents]);

  // قلب حالة طالب
  const toggleStudentPresence = (studentId: string) => {
    console.log("🔄 تغيير حالة الطالب:", studentId);
    setStudents((prev) => {
      const next = prev.map((s) => {
        if (s._id === studentId) {
          const newState = !s.isPresent;
          console.log(
            "✅ تم العثور على الطالب:",
            s.name,
            "الحالة الحالية:",
            s.isPresent,
            "→ الحالة الجديدة:",
            newState
          );
          return { ...s, isPresent: newState };
        }
        return s;
      });
      
      // حساب الإحصائيات بعد التغيير مباشرة
      const visibleIds = visibleStudents.map(v => v._id);
      const updatedVisible = next.filter(s => visibleIds.includes(s._id));
      const newPresentCount = updatedVisible.filter(s => s.isPresent).length;
      const newAbsentCount = updatedVisible.length - newPresentCount;
      
      console.log(`📊 الإحصائيات المحدثة للحلقة "${groupFilter}":`);
      console.log(`   ✅ الحاضرين: ${newPresentCount}`);
      console.log(`   ❌ الغائبين: ${newAbsentCount}`);
      console.log(`   👥 المجموع: ${updatedVisible.length}`);
      
      return next;
    });
  };

  // اختيار/إلغاء اختيار الكل (للطلاب المرئيين فقط)
  const toggleAllStudents = () => {
    const newState = !selectedAll;
    setSelectedAll(newState);

    // تحديث فقط الطلاب المرئيين في الحلقة المختارة
    const visibleStudentIds = visibleStudents.map((s) => s._id);

    console.log(
      `🔄 تغيير حالة ${visibleStudents.length} طالب في الحلقة "${groupFilter}" إلى: ${
        newState ? "حاضر" : "غائب"
      }`
    );

    setStudents((prev) => {
      const next = prev.map((s) => {
        // تحديث فقط الطلاب المرئيين
        if (visibleStudentIds.includes(s._id)) {
          return { ...s, isPresent: newState };
        }
        return s; // باقي الطلاب ما يتغيروا
      });
      
      // حساب الإحصائيات بعد التغيير
      const updatedVisible = next.filter(s => visibleStudentIds.includes(s._id));
      const newPresentCount = updatedVisible.filter(s => s.isPresent).length;
      const newAbsentCount = updatedVisible.length - newPresentCount;
      
      console.log(`📊 الإحصائيات بعد التحديد الجماعي:`);
      console.log(`   ✅ الحاضرين: ${newPresentCount}`);
      console.log(`   ❌ الغائبين: ${newAbsentCount}`);
      console.log(`   👥 المجموع: ${updatedVisible.length}`);
      
      return next;
    });
  };

  // إحصائيات الحضور للطلاب المرئيين فقط
  const presentCount = useMemo(
    () => visibleStudents.filter((s) => s.isPresent).length,
    [visibleStudents]
  );
  const absentCount = useMemo(
    () => visibleStudents.length - presentCount,
    [visibleStudents, presentCount]
  );
  const attendanceRate = useMemo(
    () =>
      visibleStudents.length
        ? Math.round((presentCount / visibleStudents.length) * 100)
        : 0,
    [visibleStudents.length, presentCount]
  );

  // ⏰ التحقق من أن التاريخ ليس أقدم من أسبوع (7 أيام)
  const isDateTooOld = useMemo(() => {
    const selectedDate = new Date(date);
    const now = new Date();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 7 أيام
    const timeDiff = now.getTime() - selectedDate.getTime();
    return timeDiff > ONE_WEEK;
  }, [date]);

  const daysAgo = useMemo(() => {
    const selectedDate = new Date(date);
    const now = new Date();
    const timeDiff = now.getTime() - selectedDate.getTime();
    return Math.round(timeDiff / (1000 * 60 * 60 * 24));
  }, [date]);

  // حفظ السجل
  const handleSave = async () => {
    try {
      // ⏰ التحقق من أن التاريخ ليس أقدم من أسبوع
      if (isDateTooOld) {
        await showErrorMessage(
          "لا يمكن التعديل",
          `هذا التاريخ قديم (مضى عليه ${daysAgo} ${daysAgo === 1 ? 'يوم' : 'أيام'}). لا يمكن تعديل الحضور بعد مرور أسبوع.`
        );
        return;
      }

      // استخدام فقط الطلاب المرئيين في الحلقة المختارة
      const payload: AttendanceRecordPayload[] = visibleStudents
        .filter((s) => s._id)
        .map((s) => ({
          studentId: s._id,
          date,
          isPresent: s.isPresent,
        }));

      // حساب عدد الحاضرين والغائبين الفعلي قبل الحفظ
      const actualPresentCount = payload.filter((s) => s.isPresent).length;
      const actualAbsentCount = payload.length - actualPresentCount;
      const actualAttendanceRate = payload.length > 0
        ? Math.round((actualPresentCount / payload.length) * 100)
        : 0;

      console.log(
        `💾 حفظ الحضور لـ ${payload.length} طالب من الحلقة "${groupFilter}"`
      );
      console.log("📋 التاريخ:", date);
      console.log(`📊 الإحصائيات الفعلية:`);
      console.log(`   ✅ الحاضرين: ${actualPresentCount}`);
      console.log(`   ❌ الغائبين: ${actualAbsentCount}`);
      console.log(`   📈 نسبة الحضور: ${actualAttendanceRate}%`);
      console.log(
        "📋 البيانات المرسلة:",
        JSON.stringify({ date, records: payload }, null, 2)
      );

      await bulkSaveAttendance({
        date,
        records: payload,
      });

      // ✅ عرض رسالة النجاح مع الصوت
      await showSuccessMessage(
        "تم رصد الحضور بنجاح",
        `حاضر: ${actualPresentCount} | غائب: ${actualAbsentCount} | نسبة الحضور: ${actualAttendanceRate}%`,
        undefined,
        "center",
        false
      );
    } catch (e: any) {
      console.error("❌ خطأ في حفظ الحضور:", e);
      console.error("📋 تفاصيل الخطأ:", e.response?.data);
      
      // ❌ عرض رسالة الخطأ مع الصوت
      let errorMsg = e.response?.data?.message || e.response?.data?.details || "تعذر حفظ السجل";
      
      // معالجة خاصة لخطأ التاريخ القديم
      if (e.response?.status === 403 && e.response?.data?.daysAgo) {
        const daysAgo = e.response.data.daysAgo;
        errorMsg = `لا يمكن تعديل الحضور بعد مرور أسبوع. هذا التاريخ قديم (مضى عليه ${daysAgo} ${daysAgo === 1 ? 'يوم' : 'أيام'}).`;
      }
      
      await showErrorMessage("خطأ في الحفظ", errorMsg);
    }
  };

  // تغيير التاريخ مباشرة
  const safeSetDate = (nextDate: string) => {
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

  // ================== واجهة المستخدم ==================
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4"
      dir="rtl">
      <div className="container mx-auto max-w-6xl">
        {/* العنوان */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              سجل الحضور والغياب
            </h1>
            {/* Socket Connection Indicator - للمطورين فقط (اضغط 'd' لإظهار/إخفاء) */}
            {showSocketIndicator && (
              <div className="relative group">
                <div
                  className={`w-3 h-3 rounded-full ${
                    socketConnected ? "bg-green-500" : "bg-yellow-500"
                  } animate-pulse`}
                  title={socketConnected ? "متصل" : "غير متصل"}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  <div className="text-center">
                    <div className="font-semibold mb-1">
                      {socketConnected ? "✓ متصل بالسوكت" : "⚠ غير متصل"}
                    </div>
                    {socketId && (
                      <div className="text-gray-300 text-xs">ID: {socketId.substring(0, 8)}...</div>
                    )}
                    {socketLastUpdate && (
                      <div className="text-gray-300 text-xs mt-1">
                        آخر تحديث: {new Date(socketLastUpdate).toLocaleTimeString('ar-EG')}
                      </div>
                    )}
                    <div className="text-gray-400 text-xs mt-1 border-t border-gray-600 pt-1">
                      اضغط 'd' للإخفاء
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            )}
          </div>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {currentUser?.role === "student"
              ? "اطّلع على سجل غيابك الشهري وإجمالي السنة"
              : "سجّل حضور الطلاب يومياً مع أدوات فلترة وبحث"}
          </p>
        </div>

        {/* حالة التحميل/الخطأ */}
        {loading ? (
          <AbsenceSkeleton />
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
                                className={`h-2.5 rounded-full ${m.rate === 0
                                  ? "bg-green-500"
                                  : m.rate <= 10
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                                } custom-width-bar`}
                                data-rate={m.rate}
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
            {/* تحقق من وجود حلقات للمعلم */}
            {currentUser?.role === "teacher" && groupsAvailable.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <svg
                    className="w-24 h-24 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    لا توجد حلقات
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    لم يتم تعيين أي حلقات لك بعد. يرجى التواصل مع الإدارة لإضافة
                    حلقات إلى حسابك.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                    <p className="text-sm text-blue-800">
                      💡 عند تعيين حلقات لك، ستظهر هنا مباشرة وستتمكن من تسجيل
                      الحضور والغياب للطلاب.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                        }`}>
                        {selectedAll ? "إلغاء تحديد الكل" : "تحديد الكل حاضر"}
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

                  {/* ⚠️ تحذير: التاريخ أقدم من أسبوع */}
                  {isDateTooOld && (
                    <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 border-r-4 border-red-500 rounded-lg p-4 shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-red-600 animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-red-800 font-bold text-lg mb-1">
                            ⏰ لا يمكن تعديل الحضور
                          </h3>
                          <p className="text-red-700 text-sm leading-relaxed">
                            هذا التاريخ قديم (مضى عليه <span className="font-bold">{daysAgo} {daysAgo === 1 ? 'يوم' : 'أيام'}</span>). 
                            لا يمكن تعديل الحضور بعد مرور <span className="font-bold">أسبوع (7 أيام)</span>.
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>الرجاء اختيار تاريخ خلال الأسبوع الماضي فقط</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* جدول الطلاب */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                      قائمة الطلاب
                    </h2>
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
                          <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                            عدد الغيابات
                          </th>
                          <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                            تواريخ الغيابات
                          </th>
                          <th className="py-3 px-6 text-center text-sm font-medium text-gray-500">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={selectedAll}
                                onChange={toggleAllStudents}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
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
                              colSpan={6}
                              className="text-center py-6 text-gray-500">
                              لا يوجد طلاب مطابقين للفلترة/البحث
                            </td>
                          </tr>
                        ) : (
                          visibleStudents.map((s) => (
                            <tr
                              key={s._id}
                              className="hover:bg-gray-50 cursor-pointer"
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
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                    (s.totalAbsences ?? 0) === 0
                                      ? "bg-green-100 text-green-700"
                                      : (s.totalAbsences ?? 0) <= 3
                                      ? "bg-yellow-100 text-yellow-700"
                                      : (s.totalAbsences ?? 0) <= 7
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-red-100 text-red-700"
                                  }`}>
                                  {s.totalAbsences ?? 0}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                {(s.absenceDates ?? []).length === 0 ? (
                                  <span className="text-xs text-gray-400 italic">لا يوجد غيابات</span>
                                ) : (
                                  <div className="relative inline-block">
                                    <button 
                                      onClick={() => setExpandedStudentId(
                                        expandedStudentId === s._id ? null : s._id
                                      )}
                                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium transition-colors">
                                      {expandedStudentId === s._id ? 'إخفاء' : `عرض (${s.absenceDates?.length})`}
                                    </button>
                                    
                                    {/* قائمة التواريخ المنسدلة */}
                                    {expandedStudentId === s._id && (
                                      <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-56 bg-white border-2 border-blue-200 rounded-lg shadow-2xl z-50 max-h-64 overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 font-bold text-sm flex items-center justify-between">
                                          <span>تواريخ الغيابات</span>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedStudentId(null);
                                            }}
                                            className="hover:bg-blue-700 rounded-full w-6 h-6 flex items-center justify-center transition-colors">
                                            ✕
                                          </button>
                                        </div>
                                        
                                        {/* Content with scroll */}
                                        <div className="max-h-48 overflow-y-auto p-3">
                                          <ul className="space-y-2">
                                            {s.absenceDates?.map((date, idx) => (
                                              <li key={idx} className="flex items-center gap-2 text-sm bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors">
                                                <span className="text-red-500 font-bold">📅</span>
                                                <span className="text-gray-700 font-medium">{date}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                        
                                        {/* Footer */}
                                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-center">
                                          <span className="text-xs text-gray-600">
                                            إجمالي: <span className="font-bold text-red-600">{s.absenceDates?.length}</span> غياب
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td
                                className="px-6 py-3 text-center"
                                onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={s.isPresent}
                                  onChange={() => toggleStudentPresence(s._id)}
                                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
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
                      disabled={isDateTooOld}
                      className={`px-8 py-2 rounded-lg shadow-md flex items-center transition-all ${
                        isDateTooOld
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed opacity-60"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                      title={isDateTooOld ? "لا يمكن الحفظ - التاريخ أقدم من أسبوع" : "حفظ السجل"}>
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
                      {isDateTooOld ? "لا يمكن الحفظ (التاريخ قديم)" : "حفظ السجل"}
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
                    <li>انقر على صفّ الطالب لقلب حالته (حاضر/غائب).</li>
                    <li>خانة التحديد العلوية لاختيار الكل بسرعة.</li>
                    <li>اضغط "حفظ السجل" لحفظ التغييرات.</li>
                    <li>سيتم تحذيرك عند وجود تغييرات غير محفوظة قبل الخروج.</li>
                    <li>استخدم البحث والفلترة حسب الحلقة لتسريع العمل.</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Absence;
