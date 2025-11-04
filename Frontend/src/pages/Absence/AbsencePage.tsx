// AbsencePage.tsx
import { useState, useEffect, useMemo } from "react";
import { useAbsenceSocket } from "../../Socket";
import { useAbsenceData, useTeacherGroups } from "./hooks";
import { SocketIndicator, TeacherToolbar, StudentView } from "./components";
import { isDateTooOld, getDaysAgo } from "./utils/dateHelpers";
import { bulkSaveAttendance } from "@/Api/attendanceApi";
import {
  showSuccessMessage,
  showErrorMessage,
} from "@/components/utils/sweetalertUtils";
import { Card } from "@/components/UI/Card";
import { EmptyState } from "@/components/UI/EmptyState";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

const AbsencePage = () => {
  const {
    isConnected: socketConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useAbsenceSocket();

  const {
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
  } = useAbsenceData();

  const teacherGroups = useTeacherGroups(currentUser);

  const [showSocketIndicator, setShowSocketIndicator] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [nameQuery, setNameQuery] = useState<string>("");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    null
  );

  // Socket indicator toggle
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "d" || event.key === "D") {
        setShowSocketIndicator((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Re-fetch on date change
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "teacher" || currentUser.role === "admin") {
      fetchStudentsForTeacher(date);
    }
  }, [date]);

  // Re-fetch on socket update
  useEffect(() => {
    if (!socketLastUpdate || !currentUser) return;
    const refetchData = async () => {
      try {
        if (currentUser.role === "teacher" || currentUser.role === "admin") {
          await fetchStudentsForTeacher(date);
        } else if (currentUser.role === "student") {
          await fetchStudentAbsenceStats(currentUser._id);
        }
      } catch (err) {
        console.error("Error refetching attendance after socket update:", err);
      }
    };
    refetchData();
  }, [socketLastUpdate, currentUser, date]);

  // Groups available
  const groupsAvailable = useMemo(() => {
    if (currentUser?.role === "teacher") {
      return teacherGroups;
    } else {
      const set = new Set<string>();
      students.forEach((s) => s.group && set.add(s.group));
      return [
        "all",
        ...Array.from(set).sort((a, b) => a.localeCompare(b, "ar")),
      ];
    }
  }, [currentUser, teacherGroups, students]);

  // Auto-select first group for teacher
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "teacher" && groupsAvailable.length > 0) {
      if (groupFilter === "all" || !groupsAvailable.includes(groupFilter)) {
        setGroupFilter(groupsAvailable[0]);
      }
    }
  }, [currentUser, groupsAvailable, groupFilter]);

  // Visible students (filtered)
  const visibleStudents = useMemo(() => {
    let list = [...students];
    if (groupFilter !== "all") {
      list = list.filter((s) => (s.group ?? "") === groupFilter);
    }
    if (nameQuery.trim()) {
      const q = nameQuery.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [students, groupFilter, nameQuery]);

  // Update selectedAll based on visible students
  useEffect(() => {
    if (visibleStudents.length > 0) {
      setSelectedAll(visibleStudents.every((s) => s.isPresent));
    } else {
      setSelectedAll(false);
    }
  }, [visibleStudents]);

  // Toggle student presence
  const toggleStudentPresence = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId ? { ...s, isPresent: !s.isPresent } : s
      )
    );
  };

  // Toggle all students
  const toggleAllStudents = () => {
    const newState = !selectedAll;
    setSelectedAll(newState);
    const visibleIds = visibleStudents.map((s) => s._id);
    setStudents((prev) =>
      prev.map((s) =>
        visibleIds.includes(s._id) ? { ...s, isPresent: newState } : s
      )
    );
  };

  // Stats
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

  const dateTooOld = useMemo(() => isDateTooOld(date), [date]);
  const daysAgo = useMemo(() => getDaysAgo(date), [date]);

  // Save attendance
  const handleSave = async () => {
    try {
      if (dateTooOld) {
        await showErrorMessage(
          "لا يمكن التعديل",
          `هذا التاريخ قديم (مضى عليه ${daysAgo} يوم). لا يمكن تعديل الحضور بعد مرور أسبوع.`
        );
        return;
      }

      const payload = visibleStudents
        .filter((s) => s._id)
        .map((s) => ({
          studentId: s._id,
          date,
          isPresent: s.isPresent,
        }));

      await bulkSaveAttendance({ date, records: payload });

      await showSuccessMessage(
        "تم رصد الحضور بنجاح",
        `حاضر: ${presentCount} | غائب: ${absentCount} | نسبة الحضور: ${attendanceRate}%`,
        undefined,
        "center",
        false
      );
    } catch (e: any) {
      console.error("❌ خطأ في حفظ الحضور:", e);
      let errorMsg =
        e.response?.data?.message ||
        e.response?.data?.details ||
        "تعذر حفظ السجل";
      await showErrorMessage("خطأ في الحفظ", errorMsg);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner fullScreen size="xl" text="جاري تحميل البيانات..." />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md">
          <EmptyState icon="❌" title="حدث خطأ" description={error} />
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4"
      dir="rtl">
      <div className="container mx-auto max-w-7xl">
        {/* العنوان */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              سجل الحضور والغياب
            </h1>
            {showSocketIndicator && socketId && (
              <SocketIndicator
                socketConnected={socketConnected}
                socketId={socketId}
                socketLastUpdate={socketLastUpdate?.getTime() || null}
              />
            )}
          </div>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {currentUser?.role === "student"
              ? "اطّلع على سجل غيابك الشهري وإجمالي السنة"
              : "سجّل حضور الطلاب يومياً مع أدوات فلترة وبحث"}
          </p>
        </div>

        {currentUser?.role === "student" ? (
          <StudentView monthlyStats={monthlyStats} />
        ) : (
          <div className="space-y-6">
            {currentUser?.role === "teacher" && groupsAvailable.length === 0 ? (
              <Card variant="elevated">
                <EmptyState
                  icon="👥"
                  title="لا توجد حلقات"
                  description="لم يتم تعيين أي حلقات لك بعد. يرجى التواصل مع الإدارة."
                />
              </Card>
            ) : (
              <>
                <TeacherToolbar
                  date={date}
                  onDateChange={setDate}
                  groupFilter={groupFilter}
                  onGroupFilterChange={setGroupFilter}
                  groupsAvailable={groupsAvailable}
                  nameQuery={nameQuery}
                  onNameQueryChange={setNameQuery}
                  selectedAll={selectedAll}
                  onToggleAll={toggleAllStudents}
                  presentCount={presentCount}
                  absentCount={absentCount}
                  attendanceRate={attendanceRate}
                  isDateTooOld={dateTooOld}
                  daysAgo={daysAgo}
                />

                {/* جدول الطلاب - التصميم القديم */}
                <Card variant="elevated" className="overflow-hidden">
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
                              <td
                                className="px-4 py-3 text-center"
                                onClick={(e) => e.stopPropagation()}>
                                {(s.absenceDates ?? []).length === 0 ? (
                                  <span className="text-xs text-gray-400 italic">
                                    لا يوجد غيابات
                                  </span>
                                ) : (
                                  <div className="relative inline-block">
                                    <button
                                      onClick={() =>
                                        setExpandedStudentId(
                                          expandedStudentId === s._id
                                            ? null
                                            : s._id
                                        )
                                      }
                                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium transition-colors">
                                      {expandedStudentId === s._id
                                        ? "إخفاء"
                                        : `عرض (${s.absenceDates?.length})`}
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
                                            {s.absenceDates?.map(
                                              (date, idx) => (
                                                <li
                                                  key={idx}
                                                  className="flex items-center gap-2 text-sm bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors">
                                                  <span className="text-red-500 font-bold">
                                                    📅
                                                  </span>
                                                  <span className="text-gray-700 font-medium">
                                                    {date}
                                                  </span>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>

                                        {/* Footer */}
                                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-center">
                                          <span className="text-xs text-gray-600">
                                            إجمالي:{" "}
                                            <span className="font-bold text-red-600">
                                              {s.absenceDates?.length}
                                            </span>{" "}
                                            غياب
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
                      disabled={dateTooOld}
                      className={`px-8 py-2 rounded-lg shadow-md flex items-center transition-all ${
                        dateTooOld
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed opacity-60"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                      title={
                        dateTooOld
                          ? "لا يمكن الحفظ - التاريخ أقدم من أسبوع"
                          : "حفظ السجل"
                      }>
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
                      {dateTooOld
                        ? "لا يمكن الحفظ (التاريخ قديم)"
                        : "حفظ السجل"}
                    </button>
                  </div>
                </Card>

                {/* تعليمات سريعة */}
                <Card>
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
                    <li>
                      سيتم تحذيرك عند وجود تغييرات غير محفوظة قبل الخروج.
                    </li>
                    <li>استخدم البحث والفلترة حسب الحلقة لتسريع العمل.</li>
                  </ul>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsencePage;
