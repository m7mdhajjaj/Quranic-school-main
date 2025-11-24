// AbsencePage.tsx
import { useState, useEffect, useMemo } from "react";
import { useAbsenceSocket } from "../../Socket";
import { useAbsenceData, useAttendanceStats, useUnsavedChanges, useStudentFilters, useStudentSelection, useAttendanceSave } from "./hooks";
import { TeacherToolbar, StudentView, StudentsTable } from "./components";
import { isDateTooOld, getDaysAgo } from "./utils/dateHelpers";
import { Card } from "@/components/UI/Card";
import PageHeader from "@/components/UI/PageHeader";
import ResponsivePagination from "@/components/UI/ResponsivePagination";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

const AbsencePage = () => {
  const {
    lastUpdate: socketLastUpdate,
  } = useAbsenceSocket();

  const {
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
  } = useAbsenceData();

  const [isLoadingDate, setIsLoadingDate] = useState(true); // Start with true for initial load
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // استخدام hook للتحذير من التغييرات غير المحفوظة
  useUnsavedChanges({ hasUnsavedChanges});

  // Initial load and re-fetch on date change
  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      if (currentUser.role === "teacher" || currentUser.role === "admin") {
        setIsLoadingDate(true);
        try {
          await fetchStudentsForTeacher(date);
          setHasUnsavedChanges(false);
        } finally {
          setIsLoadingDate(false);
        }
      } else if (currentUser.role === "student") {
        await fetchStudentAbsenceStats(currentUser._id);
      }
    };
    
    loadData();
  }, [date, currentUser, fetchStudentsForTeacher, fetchStudentAbsenceStats]);

  // Re-fetch on socket update (فقط إذا كان هناك تحديث جديد)
  useEffect(() => {
    if (!socketLastUpdate || !currentUser || isLoadingDate) return;
    
    // منع re-fetch إذا كان آخر تحديث قبل أقل من 2 ثانية
    const timeSinceLastUpdate = Date.now() - socketLastUpdate.getTime();
    if (timeSinceLastUpdate < 2000) return;
    
    const refetchData = async () => {
      try {
        console.log('🔄 Re-fetching data due to socket update...');
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
  }, [socketLastUpdate]);  // فقط socketLastUpdate للتجنب من re-renders غير ضرورية

  // Groups available - استخدام جميع حلقات المعلم (سواء فيها طلاب أو فارغة)
  const groupsAvailable = useMemo(() => {
    // إذا كان المعلم لديه حلقات محددة من API، استخدمها
    if (currentUser?.role === 'teacher' && teacherGroups.length > 0) {
      const groupNames = teacherGroups.map(g => g.name).sort((a, b) => a.localeCompare(b, "ar"));
      
      // تحقق من وجود طلاب بدون حلقة
      const hasStudentsWithoutGroup = students.some(s => !s.group);
      
      // إضافة "all" في البداية
      const result = ["all", ...groupNames];
      
      // إضافة "بدون حلقة" إذا وُجد طلاب بدون حلقة
      if (hasStudentsWithoutGroup) {
        result.push("");
      }
      
      console.log(`📋 الحلقات المتاحة في الفلتر:`);
      teacherGroups.forEach(g => {
        console.log(`   • ${g.name}: ${g.totalStudents || 0} طالب`);
      });
      
      return result;
    }
    
    // في حالة الأدمن أو عدم وجود حلقات من API، احسبها من الطلاب الموجودين
    const set = new Set<string>();
    let hasStudentsWithoutGroup = false;
    
    students.forEach((s) => {
      if (s.group) {
        set.add(s.group);
      } else {
        hasStudentsWithoutGroup = true;
      }
    });
    
    const groups = Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
    
    // إضافة "all" في البداية
    const result = ["all", ...groups];
    
    // إضافة "بدون حلقة" في النهاية إذا وُجد طلاب بدون حلقة
    if (hasStudentsWithoutGroup) {
      result.push("");
    }
    
    return result;
  }, [students, teacherGroups, currentUser]);







  // استخدام hook للفلترة والبحث والصفحات
  const {
    groupFilter,
    setGroupFilter,
    nameQuery,
    setNameQuery,
    currentPage,
    setCurrentPage,
    visibleStudents,
    paginatedStudents,
    totalPages,
    itemsPerPage,
  } = useStudentFilters({
    students,
    groupsAvailable,
    itemsPerPage: 10,
  });

  // استخدام hook لإدارة اختيار الطلاب
  const { selectedAll, toggleStudentPresence, toggleAllStudents } =
    useStudentSelection({
      visibleStudents,
      setStudents,
      onChangeDetected: () => setHasUnsavedChanges(true),
    });

  // استخدام hook منفصل لحساب الإحصائيات
  const { displayStats, realStats } = useAttendanceStats({
    allStudents: students,
    visibleStudents,
    isLoadingDate,
  });

  // استخراج الأرقام الحقيقية للاستخدام الداخلي
  const { presentCount, absentCount, attendanceRate } = realStats;

  const dateTooOld = useMemo(() => isDateTooOld(date), [date]);
  const daysAgo = useMemo(() => getDaysAgo(date), [date]);

  // استخدام hook لحفظ الحضور
  const { isSaving, handleSave } = useAttendanceSave({
    visibleStudents,
    date,
    presentCount,
    absentCount,
    attendanceRate,
    onSaveSuccess: () => setHasUnsavedChanges(false),
    isDateTooOld: dateTooOld,
    daysAgo,
  });

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
                  teacherGroups={teacherGroups}
                  nameQuery={nameQuery}
                  onNameQueryChange={setNameQuery}
                  totalStudents={displayStats.totalStudents}
                  presentCount={displayStats.presentCount}
                  absentCount={displayStats.absentCount}
                  attendanceRate={displayStats.attendanceRate}
                  isDateTooOld={dateTooOld}
                  daysAgo={daysAgo}
                  onSave={handleSave}
                  isSaving={isSaving}
                  isLoading={isLoadingDate}
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
