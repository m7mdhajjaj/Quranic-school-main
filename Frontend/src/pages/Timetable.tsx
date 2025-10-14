import { useState, useEffect, useCallback, useMemo, type JSX } from "react";
import {
  getAllSessions,
  createSession,
  updateSession,
  deleteSession,
  type Session,
} from "../Api/sessionApi";
import Swal from "sweetalert2";

const Timetable = () => {
  const days = [
    "السبت",
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
  ];

  // 12:00 -> 9:00 مساءً، كل خانة 30 دقيقة
  const hours = useMemo(() => {
    const hoursArray: string[] = [];
    for (let h = 12; h <= 21; h++) {
      const display = h > 12 ? h - 12 : h;
      hoursArray.push(`${display}:00`);
      if (h < 21) hoursArray.push(`${display}:30`);
    }
    return hoursArray;
  }, []);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حالات الحلقات
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [selectedGroupForForm, setSelectedGroupForForm] = useState<string>("");

  // Fix role comparison issue
  const user = localStorage.getItem("user");
  let role: "student" | "teacher" | "admin" = "student";
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      role = parsedUser.role as "student" | "teacher" | "admin";
    } catch {
      console.error("Error parsing user role");
    }
  }

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllSessions();
      let filteredData = Array.isArray(data) ? data : [];

      // للطالب: عرض مواعيد حلقته فقط
      if (role === "student" && user) {
        try {
          const currentUser = JSON.parse(user);
          const studentGroup = currentUser.group; // اسم الحلقة الخاصة بالطالب

          console.log("👨‍🎓 طالب - حلقة الطالب:", studentGroup);

          if (studentGroup) {
            filteredData = filteredData.filter((session) => {
              const match = session.note === studentGroup;
              if (match) {
                console.log("✅ موعد مطابق:", session);
              }
              return match;
            });
            console.log(`📋 عدد المواعيد للطالب: ${filteredData.length}`);
          } else {
            console.warn("⚠️ الطالب ليس لديه حلقة محددة");
            filteredData = []; // إذا لم يكن للطالب حلقة، لا يعرض أي مواعيد
          }
        } catch (e) {
          console.error("خطأ في تحليل بيانات المستخدم:", e);
        }
      }

      // للمعلم: عرض مواعيد حلقاته فقط
      if (role === "teacher" && user) {
        try {
          const currentUser = JSON.parse(user);

          console.log("👨‍🏫 معلم - جلب حلقات المعلم...");

          // جلب الحلقات من Groups API
          const { getAllGroups } = await import("../Api/groupApi");
          const groupsRes = await getAllGroups();

          if (groupsRes.success && Array.isArray(groupsRes.data)) {
            const possibleNames = getTeacherPossibleNames(currentUser);
            console.log("📋 أسماء المعلم المحتملة:", possibleNames);

            // فلترة الحلقات التي تخص هذا المعلم
            const teacherGroupsData = groupsRes.data.filter((group: any) => {
              if (!group.teacher) return false;
              return isTeacherMatch(group.teacher, possibleNames);
            });

            const teacherGroupNames = teacherGroupsData.map((g: any) => g.name);
            console.log(`📋 حلقات المعلم:`, teacherGroupNames);

            if (teacherGroupNames.length > 0) {
              // فلترة المواعيد لتظهر فقط مواعيد حلقات هذا المعلم
              filteredData = filteredData.filter((session) => {
                const match = teacherGroupNames.includes(session.note);
                if (match) {
                  console.log("✅ موعد مطابق للمعلم:", session);
                }
                return match;
              });
              console.log(`📋 عدد المواعيد للمعلم: ${filteredData.length}`);
            } else {
              console.warn("⚠️ المعلم ليس لديه حلقات محددة");
              filteredData = [];
            }
          } else {
            console.error("❌ فشل في جلب الحلقات");
            filteredData = [];
          }
        } catch (e) {
          console.error("خطأ في تحليل بيانات المعلم:", e);
        }
      }

      setSessions(filteredData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError("حدث خطأ في تحميل الحصص");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // helper function للحصول على أسماء المعلم المحتملة
  const getTeacherPossibleNames = (user: any) => {
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

  // جلب حلقات المعلم من Groups API
  useEffect(() => {
    const fetchTeacherGroups = async () => {
      if (role !== "teacher") {
        setTeacherGroups([]);
        return;
      }

      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const currentUser = JSON.parse(userStr);

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

        // تحديد أول حلقة تلقائياً للفورم
        if (groupNames.length > 0 && !selectedGroupForForm) {
          setSelectedGroupForForm(groupNames[0]);
        }
      } catch (error) {
        console.error("خطأ في جلب حلقات المعلم:", error);
        setTeacherGroups([]);
      }
    };

    fetchTeacherGroups();
  }, [role, selectedGroupForForm]); // eslint-disable-line react-hooks/exhaustive-deps

  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [startHour, setStartHour] = useState(hours[0]);
  const [endHour, setEndHour] = useState(hours[1]);
  const [note, setNote] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const hourIndex = useCallback((h: string) => hours.indexOf(h), [hours]);

  const handleAddSession = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const si = hourIndex(startHour);
      const ei = hourIndex(endHour);
      if (si === -1 || ei === -1 || ei <= si) {
        await Swal.fire({
          icon: "warning",
          title: "تنبيه",
          text: "يجب أن تكون ساعة الانتهاء بعد ساعة الابتداء.",
          confirmButtonText: "حسناً",
          confirmButtonColor: "#10b981",
        });
        return;
      }

      // استخدم الحلقة المختارة كـ note
      const sessionNote =
        role === "teacher" && selectedGroupForForm
          ? selectedGroupForForm
          : note;

      // فحص التعارض مع مواعيد أخرى لنفس المعلم في نفس اليوم
      const hasConflict = sessions.some((session, idx) => {
        // تجاهل الموعد الحالي عند التعديل
        if (editIdx !== null && idx === editIdx) {
          return false;
        }

        // تحقق فقط من مواعيد نفس اليوم
        if (session.day !== selectedDay) {
          return false;
        }

        // للمعلم: تحقق من كل مواعيده (كل الحلقات)
        // للإداري: تحقق فقط إذا كان نفس اسم الحلقة
        if (role === "admin" && session.note !== sessionNote) {
          return false;
        }

        const existingSi = hourIndex(session.startHour);
        const existingEi = hourIndex(session.endHour);

        // تحقق من التعارض:
        // 1. الموعد الجديد يبدأ قبل انتهاء موعد موجود
        // 2. الموعد الجديد ينتهي بعد بداية موعد موجود
        const overlaps = si < existingEi && ei > existingSi;

        return overlaps;
      });

      if (hasConflict) {
        const conflictTitle =
          role === "teacher" ? "تعارض في مواعيد الحلقات!" : "تعارض في الموعد!";

        const conflictMsg =
          role === "teacher"
            ? `يوجد موعد آخر لإحدى حلقاتك في نفس الوقت يوم ${selectedDay} من ${startHour} إلى ${endHour}.<br><br>يرجى اختيار وقت آخر.`
            : `يوجد موعد آخر لنفس الحلقة <strong>(${sessionNote})</strong> في نفس الوقت يوم ${selectedDay}.<br><br>يرجى اختيار وقت آخر.`;

        await Swal.fire({
          icon: "error",
          title: conflictTitle,
          html: conflictMsg,
          confirmButtonText: "حسناً",
          confirmButtonColor: "#10b981",
          iconColor: "#ef4444",
        });
        return;
      }

      const payload = {
        day: selectedDay,
        startHour,
        endHour,
        note: sessionNote,
      };

      console.log("📤 إرسال البيانات:", payload);
      console.log("📋 التفاصيل:", {
        role,
        selectedGroupForForm,
        note,
        sessionNote,
      });

      try {
        if (editIdx !== null && sessions[editIdx]?._id) {
          const id = sessions[editIdx]._id!;
          console.log("✏️ تحديث موعد:", id);
          const updated = await updateSession(id, payload);
          setSessions((prev) =>
            prev.map((s, i) => (i === editIdx ? updated : s))
          );
          await Swal.fire({
            icon: "success",
            title: "نجح التحديث!",
            text: "تم تحديث موعد الحلقة بنجاح",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        } else {
          console.log("➕ إضافة موعد جديد");
          const added = await createSession(payload);
          console.log("✅ تمت الإضافة:", added);
          setSessions((prev) => [...prev, added]);
          await Swal.fire({
            icon: "success",
            title: "تمت الإضافة بنجاح!",
            text: `تم إضافة موعد ${sessionNote} يوم ${selectedDay}`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        }
      } catch (error: any) {
        console.error("❌ خطأ في حفظ الموعد:", error);
        console.error("📋 تفاصيل الخطأ:", error?.response?.data);
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "حدث خطأ أثناء حفظ الحلقة";

        await Swal.fire({
          icon: "error",
          title: "حدث خطأ!",
          text: errorMsg,
          confirmButtonText: "حسناً",
          confirmButtonColor: "#10b981",
        });
        return;
      }

      setShowForm(false);
      setNote("");
      setSelectedGroupForForm(teacherGroups[0] || "");
      setEditIdx(null);
    },
    [
      startHour,
      endHour,
      selectedDay,
      note,
      editIdx,
      sessions,
      hourIndex,
      role,
      selectedGroupForForm,
      teacherGroups,
    ]
  );

  const handleDeleteSession = useCallback(
    async (idx: number) => {
      const session = sessions[idx];
      const result = await Swal.fire({
        title: "تأكيد الحذف",
        html: `هل أنت متأكد من حذف موعد <strong>${
          session.note || "الحلقة"
        }</strong>؟<br>يوم ${session.day} من ${session.startHour} إلى ${
          session.endHour
        }`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "نعم، احذف",
        cancelButtonText: "إلغاء",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      const id = sessions[idx]?._id;
      if (id) {
        try {
          await deleteSession(id);
          setSessions((prev) => prev.filter((_, i) => i !== idx));
          await Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: "تم حذف الموعد بنجاح",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        } catch (error) {
          console.error("Error deleting session:", error);
          await Swal.fire({
            icon: "error",
            title: "حدث خطأ!",
            text: "حدث خطأ أثناء حذف الحلقة",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#10b981",
          });
        }
      } else {
        setSessions((prev) => prev.filter((_, i) => i !== idx));
      }
    },
    [sessions]
  );

  const handleEditSession = useCallback(
    (idx: number) => {
      const s = sessions[idx];
      setSelectedDay(s.day);
      setStartHour(s.startHour);
      setEndHour(s.endHour);
      setNote(s.note);
      setEditIdx(idx);
      setShowForm(true);
    },
    [sessions]
  );

  // يبني خلايا الصف مع دمج الأعمدة
  const renderDayRowCells = (day: string) => {
    const tds: JSX.Element[] = [];
    let i = 0;

    while (i < hours.length) {
      const idx = sessions.findIndex(
        (s) => s.day === day && hourIndex(s.startHour) === i
      );

      if (idx !== -1) {
        const s = sessions[idx];
        const si = hourIndex(s.startHour);
        const ei = hourIndex(s.endHour);
        const span = Math.max(1, ei - si);

        tds.push(
          <td
            key={`${day}-${s.startHour}-${s.endHour}`}
            colSpan={span}
            className="border border-emerald-100/70 bg-gradient-to-b from-yellow-200 via-yellow-200/90 to-yellow-100 text-yellow-900 font-semibold text-center align-middle relative rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="flex flex-col items-center justify-center py-2">
              <div className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 shadow" />
                <span className="tracking-wide">
                  {s.note
                    ? `${s.note} (${s.startHour} - ${s.endHour})`
                    : `حلقة (${s.startHour} - ${s.endHour})`}
                </span>
              </div>

              {(role === "teacher" || role === "admin") && (
                <div className="mt-2 flex gap-2">
                  <button
                    className="px-2.5 py-1 text-xs rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                    onClick={() => handleEditSession(idx)}>
                    تعديل
                  </button>
                  <button
                    className="px-2.5 py-1 text-xs rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    onClick={() => handleDeleteSession(idx)}>
                    حذف
                  </button>
                </div>
              )}
            </div>
          </td>
        );

        i = ei; // نتخطى الأعمدة المدموجة
      } else {
        tds.push(
          <td
            key={`${day}-${hours[i]}`}
            className="border border-emerald-100/60 bg-white h-12 min-w-[54px] hover:bg-emerald-50/30 transition-colors"
          />
        );
        i += 1;
      }
    }
    return tds;
  };

  return (
    <div className="p-2 md:p-6" dir="rtl" lang="ar">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-700">
            جدول الحصص الأسبوعي
          </h2>
          <p className="text-emerald-900/70 text-sm mt-1">
            كل خانة تمثل نصف ساعة — الحلقات مدموجة بين البداية والنهاية.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {error}
            <button
              onClick={fetchSessions}
              className="mr-2 underline hover:no-underline">
              إعادة المحاولة
            </button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center mb-4">
            <div className="text-emerald-600">جاري تحميل الحصص...</div>
          </div>
        )}

        {(role === "teacher" || role === "admin") && (
          <div className="flex justify-center mb-4">
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm hover:shadow transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
              onClick={() => setShowForm(true)}>
              إضافة موعد حلقة
            </button>
          </div>
        )}

        {/* بطاقة الجدول */}
        <div className="bg-white/90 backdrop-blur rounded-2xl border border-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.08)] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-max w-full text-center border-separate border-spacing-0 text-[13px] md:text-base">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-l from-emerald-600 to-emerald-500 text-white">
                  <th className="sticky right-0 bg-emerald-600/95 px-2 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold border-l border-emerald-500">
                    اليوم / الوقت
                  </th>
                  {hours.map((h) => (
                    <th
                      key={`h-${h}`}
                      className="px-2 md:px-3 py-2 md:py-3 text-[10px] md:text-xs font-semibold border-l border-emerald-500/30 whitespace-nowrap"
                      title={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {days.map((day, r) => (
                  <tr
                    key={day}
                    className={r % 2 ? "bg-emerald-50/20" : "bg-white"}>
                    <td className="sticky right-0 bg-emerald-50/90 backdrop-blur px-2 md:px-4 py-2 md:py-3 font-bold text-emerald-800 border-t border-b border-emerald-100 text-[13px] md:text-base">
                      {day}
                    </td>
                    {renderDayRowCells(day)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* نموذج الإضافة / التعديل */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          aria-modal="true"
          role="dialog">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {editIdx !== null ? "تعديل موعد حلقة" : "إضافة موعد حلقة"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditIdx(null);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddSession} className="p-6 space-y-5">
              {/* Day Selection */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  اليوم
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none bg-white"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  aria-label="اختر اليوم">
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    ساعة الابتداء
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none bg-white"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    aria-label="اختر ساعة البداية">
                    {hours.map((h) => (
                      <option key={`s-${h}`} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    ساعة الانتهاء
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none bg-white"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    aria-label="اختر ساعة النهاية">
                    {hours.map((h) => (
                      <option key={`e-${h}`} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* اختيار الحلقة للمعلم */}
              {role === "teacher" && teacherGroups.length > 0 && (
                <div>
                  <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    اختر الحلقة
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none bg-white"
                    value={selectedGroupForForm}
                    onChange={(e) => setSelectedGroupForForm(e.target.value)}
                    required>
                    {teacherGroups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ملاحظة للإداري */}
              {role === "admin" && (
                <div>
                  <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    اسم الحلقة
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="مثلاً حلقة تثبيت لنجاح..."
                    required
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditIdx(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200 border-2 border-gray-200">
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                  {editIdx !== null ? "حفظ التعديل" : "إضافة الموعد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
