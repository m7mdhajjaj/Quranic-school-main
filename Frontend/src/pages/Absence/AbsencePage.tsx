// AbsencePage.tsx
import { useState, useEffect, useMemo } from "react";
import { useBlocker } from "react-router-dom";
import { useAbsenceSocket } from "../../Socket";
import { useAbsenceData, useTeacherGroups } from "./hooks";
import { TeacherToolbar, StudentView, StudentsTable } from "./components";
import { isDateTooOld, getDaysAgo } from "./utils/dateHelpers";
import { bulkSaveAttendance } from "@/Api/attendanceApi";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/utils/toastUtils";
import { Card } from "@/components/UI/Card";
import PageHeader from "@/components/UI/PageHeader";
import ResponsivePagination from "@/components/UI/ResponsivePagination";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

const AbsencePage = () => {
  const {
    isConnected: socketConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useAbsenceSocket();

  const {
    currentUser,
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

  const [selectedAll, setSelectedAll] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [nameQuery, setNameQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDate, setIsLoadingDate] = useState(true); // Start with true for initial load
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initial load and re-fetch on date change
  useEffect(() => {
    if (!currentUser) return;
    const loadData = async () => {
      if (currentUser.role === "teacher" || currentUser.role === "admin") {
        setIsLoadingDate(true);
        try {
          await fetchStudentsForTeacher(date);
          setHasUnsavedChanges(false); // Reset unsaved changes after loading
        } finally {
          setIsLoadingDate(false);
        }
      }
    };
    loadData();
  }, [date, currentUser]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "لديك تغييرات غير محفوظة. هل أنت متأكد من الخروج?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle navigation blocker
  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(
        "⚠️ لديك تغييرات غير محفوظة!\n\nهل أنت متأكد من مغادرة الصفحة؟\nسيتم فقدان جميع التغييرات غير المحفوظة."
      );
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

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
      return ["all", ...teacherGroups];
    } else {
      const set = new Set<string>();
      students.forEach((s) => s.group && set.add(s.group));
      return [
        "all",
        ...Array.from(set).sort((a, b) => a.localeCompare(b, "ar")),
      ];
    }
  }, [currentUser, teacherGroups, students]);

  // Auto-select "all" for teacher by default
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "teacher" && groupsAvailable.length > 0) {
      if (!groupsAvailable.includes(groupFilter)) {
        setGroupFilter("all");
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

  // Paginated students
  const paginatedStudents = useMemo(() => {
    if (visibleStudents.length <= itemsPerPage) {
      return visibleStudents;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return visibleStudents.slice(startIndex, endIndex);
  }, [visibleStudents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(visibleStudents.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [groupFilter, nameQuery]);

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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
        showErrorToast(
          `⚠️ لا يمكن التعديل - التاريخ قديم (مضى عليه ${daysAgo} يوم). لا يمكن تعديل الحضور بعد مرور أسبوع.`
        );
        return;
      }

      setIsSaving(true);

      const payload = visibleStudents
        .filter((s) => s._id)
        .map((s) => ({
          studentId: s._id,
          date,
          isPresent: s.isPresent,
        }));

      await bulkSaveAttendance({ date, records: payload });

      setHasUnsavedChanges(false); // Clear unsaved changes flag after successful save

      showSuccessToast(
        `✓ تم رصد الحضور بنجاح - حاضر: ${presentCount} | غائب: ${absentCount} | نسبة الحضور: ${attendanceRate}%`
      );
    } catch (e: any) {
      console.error("❌ خطأ في حفظ الحضور:", e);
      let errorMsg =
        e.response?.data?.message ||
        e.response?.data?.details ||
        "تعذر حفظ السجل";
      showErrorToast(`✗ خطأ في الحفظ - ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">حدث خطأ</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4"
      dir="rtl">
      <div className="container mx-auto max-w-[1800px]">
        {/* العنوان */}
        <PageHeader
          title="سجل الحضور والغياب"
          subtitle={
            currentUser?.role === "student"
              ? "اطّلع على سجل غيابك الشهري وإجمالي السنة"
              : "سجّل حضور الطلاب يومياً مع أدوات فلترة وبحث"
          }
          icon={
            <div className="text-6xl">
              {currentUser?.role === "student" ? "📊" : "📝"}
            </div>
          }
        />

        {currentUser?.role === "student" ? (
          <StudentView monthlyStats={monthlyStats} />
        ) : (
          <div className="space-y-6">
            <TeacherToolbar
                  date={date}
                  onDateChange={setDate}
                  groupFilter={groupFilter}
                  onGroupFilterChange={setGroupFilter}
                  groupsAvailable={groupsAvailable}
                  nameQuery={nameQuery}
                  onNameQueryChange={setNameQuery}
                  presentCount={presentCount}
                  absentCount={absentCount}
                  attendanceRate={attendanceRate}
                  isDateTooOld={dateTooOld}
                  daysAgo={daysAgo}
                  onSave={handleSave}
                  isSaving={isSaving}
                />

                {/* جدول الطلاب */}
                {isLoadingDate || isSaving ? (
                  <Card variant="elevated" className="overflow-hidden">
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                      <LoadingSpinner size="lg" />
                      <p className="text-lg text-gray-600 font-semibold">
                        {isSaving ? "جاري حفظ الحضور..." : "جاري تحميل البيانات..."}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <>
                    <StudentsTable
                      students={paginatedStudents}
                      selectedAll={selectedAll}
                      onToggleAll={toggleAllStudents}
                      onTogglePresence={toggleStudentPresence}
                    />

                    {/* Pagination */}
                    {visibleStudents.length > itemsPerPage && (
                      <div className="px-6">
                        <ResponsivePagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={visibleStudents.length}
                          itemsPerPage={itemsPerPage}
                          onPageChange={setCurrentPage}
                          itemName="طالب"
                          showQuickJump={true}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* تعليمات سريعة */}
                <Card className="min-h-[200px]">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsencePage;
