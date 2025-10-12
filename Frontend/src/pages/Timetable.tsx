import { useState, useEffect, useCallback, useMemo, type JSX } from "react";
import {
  getAllSessions,
  createSession,
  updateSession,
  deleteSession,
  type Session,
} from "../Api/sessionApi";

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

  // حالات الفلتر
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);

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
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError("حدث خطأ في تحميل الحصص");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

        // تحديد أول حلقة تلقائياً
        if (groupNames.length > 0 && groupFilter === "all") {
          setGroupFilter(groupNames[0]);
        }
      } catch (error) {
        console.error("خطأ في جلب حلقات المعلم:", error);
        setTeacherGroups([]);
      }
    };

    fetchTeacherGroups();
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [startHour, setStartHour] = useState(hours[0]);
  const [endHour, setEndHour] = useState(hours[1]);
  const [note, setNote] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const hourIndex = useCallback((h: string) => hours.indexOf(h), [hours]);

  // مجموعات (Groups) موجودة عند الحلقات
  const groupsAvailable = useMemo(() => {
    if (role === "teacher") {
      // للمعلم: استخدم الحلقات المجلبة مسبقاً
      return teacherGroups;
    } else {
      // للأدمن: عرض كل الحلقات مع خيار "الكل"
      const set = new Set<string>();
      sessions.forEach((s) => s.note && set.add(s.note));
      return [
        "all",
        ...Array.from(set).sort((a, b) => a.localeCompare(b, "ar")),
      ];
    }
  }, [role, teacherGroups, sessions]);

  // فلترة الحصص بناءً على الحلقة المختارة
  const filteredSessions = useMemo(() => {
    if (role === "teacher" && groupFilter !== "all") {
      return sessions.filter((s) => s.note === groupFilter);
    }
    if (role === "admin" && groupFilter !== "all") {
      return sessions.filter((s) => s.note === groupFilter);
    }
    return sessions;
  }, [sessions, groupFilter, role]);

  const handleAddSession = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const si = hourIndex(startHour);
      const ei = hourIndex(endHour);
      if (si === -1 || ei === -1 || ei <= si) {
        alert("يجب أن تكون ساعة الانتهاء بعد ساعة الابتداء.");
        return;
      }

      // استخدم الحلقة المختارة كـ note إذا كان المعلم قد اختار حلقة، أو استخدم note المدخل
      const sessionNote =
        role === "teacher" && groupFilter !== "all" ? groupFilter : note;
      const payload = {
        day: selectedDay,
        startHour,
        endHour,
        note: sessionNote,
      };

      console.log("📤 إرسال البيانات:", payload);
      console.log("📋 التفاصيل:", { role, groupFilter, note, sessionNote });

      try {
        if (editIdx !== null && sessions[editIdx]?._id) {
          const id = sessions[editIdx]._id!;
          console.log("✏️ تحديث موعد:", id);
          const updated = await updateSession(id, payload);
          setSessions((prev) =>
            prev.map((s, i) => (i === editIdx ? updated : s))
          );
          alert("تم تحديث الموعد بنجاح ✅");
        } else {
          console.log("➕ إضافة موعد جديد");
          const added = await createSession(payload);
          console.log("✅ تمت الإضافة:", added);
          setSessions((prev) => [...prev, added]);
          alert("تم إضافة الموعد بنجاح ✅");
        }
      } catch (error: any) {
        console.error("❌ خطأ في حفظ الموعد:", error);
        console.error("📋 تفاصيل الخطأ:", error?.response?.data);
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "حدث خطأ أثناء حفظ الحلقة";
        alert(`خطأ: ${errorMsg}`);
        return;
      }

      setShowForm(false);
      setNote("");
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
      groupFilter,
    ]
  );

  const handleDeleteSession = useCallback(
    async (idx: number) => {
      if (!confirm("هل أنت متأكد من حذف هذه الحلقة؟")) return;
      const id = sessions[idx]?._id;
      if (id) {
        try {
          await deleteSession(id);
          setSessions((prev) => prev.filter((_, i) => i !== idx));
        } catch (error) {
          console.error("Error deleting session:", error);
          alert("حدث خطأ أثناء حذف الحلقة");
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
      const idx = filteredSessions.findIndex(
        (s) => s.day === day && hourIndex(s.startHour) === i
      );

      if (idx !== -1) {
        const s = filteredSessions[idx];
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
          <>
            {/* شريط الفلترة */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* الفلترة بالحلقة */}
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    الحلقة:
                  </label>
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="w-full border border-emerald-300 rounded-lg px-4 py-2 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {groupsAvailable.length === 0 ? (
                      <option value="all">لا توجد حلقات</option>
                    ) : (
                      groupsAvailable.map((g) => (
                        <option key={g} value={g}>
                          {g === "all" ? "الكل" : g}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* زر إضافة موعد */}
                <div className="flex items-end">
                  <button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm hover:shadow transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    onClick={() => setShowForm(true)}>
                    إضافة موعد حلقة
                  </button>
                </div>
              </div>
            </div>
          </>
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
          className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
          aria-modal="true"
          role="dialog">
          <div className="bg-white/95 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-emerald-200">
            <h3 className="text-xl font-bold mb-4 text-center text-emerald-700">
              {editIdx !== null ? "تعديل موعد حلقة" : "إضافة موعد حلقة"}
            </h3>
            <form onSubmit={handleAddSession} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold text-emerald-700">
                  اليوم
                </label>
                <select
                  className="w-full border border-emerald-300 rounded-lg px-3 py-2 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-emerald-700">
                    ساعة الابتداء
                  </label>
                  <select
                    className="w-full border border-emerald-300 rounded-lg px-3 py-2 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
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
                  <label className="block mb-1 font-bold text-emerald-700">
                    ساعة الانتهاء
                  </label>
                  <select
                    className="w-full border border-emerald-300 rounded-lg px-3 py-2 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
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

              <div>
                <label className="block mb-1 font-bold text-emerald-700">
                  {role === "teacher" && groupFilter !== "all"
                    ? "اسم الحلقة"
                    : "ملاحظة"}
                </label>
                {role === "teacher" && groupFilter !== "all" ? (
                  <input
                    className="w-full border border-emerald-300 rounded-lg px-3 py-2 bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    type="text"
                    value={groupFilter}
                    disabled
                    readOnly
                  />
                ) : (
                  <input
                    className="w-full border border-emerald-300 rounded-lg px-3 py-2 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="مثلاً اسم الحلقة أو ملاحظة…"
                  />
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                  حفظ
                </button>
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-emerald-700 font-bold py-2 px-4 rounded-xl shadow-sm"
                  onClick={() => {
                    setShowForm(false);
                    setEditIdx(null);
                  }}>
                  إلغاء
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
