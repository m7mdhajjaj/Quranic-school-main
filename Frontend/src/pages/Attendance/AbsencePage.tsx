// AbsencePage.tsx
import { useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  useAbsenceData, 
  useAttendanceStats, 
  useStudentFilters, 
  useStudentSelection, 
  useAttendanceSave,
  useAttendancePageState 
} from "./hooks";
import { 
  StudentView, 
  TeacherGroupsGrid, 
  TeacherAttendanceView,
  AdminView
} from "./components";
import { 
  StudentAttendanceSkeleton,
  GroupsGridSkeleton,
  TeacherAttendanceViewSkeleton,
  AdminAttendanceSkeleton
} from "@/components/skeletons";
import { isDateTooOld, getDaysAgo } from "./utils/dateHelpers";
import { Card } from "@/components/UI/Card";
import { ClipboardList } from "lucide-react";

const AbsencePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentUser,
    error,
    students,
    setStudents,
    date,
    startDate,
    endDate,
    setDateRange,
    monthlyStats,
    weeklyStats,
    currentMonthStats,
    teacherGroups,
    availableDates,
    isAttendanceTaken,
    setIsAttendanceTaken,
    noSectionInfo, // 🆕
    fetchStudentsForTeacher,
    fetchStudentAbsenceStats,
    fetchAvailableDates,
  } = useAbsenceData();

  // استخراج الحلقة المختارة من الرابط
  const selectedGroupId = searchParams.get('groupId');
  const selectedGroup = useMemo(() => 
    teacherGroups.find(g => g._id === selectedGroupId) || null
  , [teacherGroups, selectedGroupId]);

  // استخدام hook لإدارة حالة الصفحة
  const {
    isLoadingDate,
    setIsLoadingDate,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isInitialLoad,
  } = useAttendancePageState({
    currentUser,
    selectedGroupId,
    date,
    fetchStudentsForTeacher,
    fetchStudentAbsenceStats,
    fetchAvailableDates,
    setDateRange,
  });
  
  // Date change effect (بدون initial load)
  useEffect(() => {
    if (!currentUser || isInitialLoad) return;
    if (currentUser.role !== "teacher" && currentUser.role !== "admin") return;
    
    const loadData = async () => {
      setIsLoadingDate(true);
      try {
        await fetchStudentsForTeacher(date);
      } finally {
        setIsLoadingDate(false);
      }
    };
    
    loadData();
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  // استخدام hook للفلترة والبحث والصفحات
  const {
    setGroupFilter,
    nameQuery,
    setNameQuery,
    visibleStudents,
  } = useStudentFilters({
    students,
  });

  // Sync group filter with selected group
  useEffect(() => {
    if (selectedGroup) {
      setGroupFilter(selectedGroup.name);
    } else {
      setGroupFilter('');
    }
  }, [selectedGroup, setGroupFilter]);

  // استخدام hook لإدارة اختيار الطلاب
  const { selectedAll, toggleStudentPresence, toggleAllStudents } =
    useStudentSelection({
      visibleStudents,
      setStudents,
      onChangeDetected: () => setHasUnsavedChanges(true),
      currentDate: date, // 🆕 تمرير التاريخ الحالي
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

  // 🆕 حساب إذا يجب تعطيل زر الحفظ
  // الزر معطل إذا: الحضور مسجل مسبقاً ولا توجد تغييرات
  const isSaveDisabled = isAttendanceTaken && !hasUnsavedChanges;

  // استخدام hook لحفظ الحضور
  const { isSaving, handleSave } = useAttendanceSave({
    visibleStudents,
    date,
    presentCount,
    absentCount,
    attendanceRate,
    onSaveSuccess: () => {
      setHasUnsavedChanges(false);
      setIsAttendanceTaken(true); // 🆕 بعد الحفظ، الحضور أصبح مسجلاً
    },
    isDateTooOld: dateTooOld,
    daysAgo,
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4" dir="rtl">
        <Card variant="elevated" className="max-w-md w-full p-4 sm:p-6">
          <div className="text-center">
            <div className="text-4xl sm:text-6xl mb-4">⚠️</div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">تنبيه</h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">{error}</p>
            {selectedGroupId && (
              <button
                onClick={() => setSearchParams({})}
                className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 bg-teal-600 text-white text-sm sm:text-base rounded-lg hover:bg-teal-700 transition-colors"
              >
                العودة للحلقات
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-4 sm:py-8 px-2 sm:px-4 bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20"
      dir="rtl">
      <div className="max-w-[98%] mx-auto">
        {/* العنوان */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {currentUser?.role === "student" ? "📊 سجلي" : currentUser?.role === "admin" ? "👔 لوحة المراقبة" : "📝 سجل الحضور والغياب"}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {currentUser?.role === "student"
                  ? "اطّلع على سجل غيابك الشهري وإجمالي السنة"
                  : currentUser?.role === "admin"
                  ? "لوحة مراقبة شاملة لحضور جميع الطلاب والإحصائيات"
                  : selectedGroup 
                    ? `تسجيل الحضور لحلقة: ${selectedGroup.name}`
                    : "اختر الحلقة للبدء بتسجيل الحضور"
                }
              </p>
            </div>
          </div>
        </div>

        {isInitialLoad ? (
          currentUser?.role === "student" ? (
            <StudentAttendanceSkeleton />
          ) : currentUser?.role === "admin" ? (
            <AdminAttendanceSkeleton />
          ) : !selectedGroup ? (
            <GroupsGridSkeleton />
          ) : (
            <TeacherAttendanceViewSkeleton />
          )
        ) : currentUser?.role === "student" ? (
          <StudentView 
            monthlyStats={monthlyStats} 
            weeklyStats={weeklyStats}
            currentMonthStats={currentMonthStats}
            currentUserId={currentUser._id}
            fetchStudentAbsenceStats={fetchStudentAbsenceStats}
            onRefresh={() => fetchStudentAbsenceStats(currentUser._id)}
            isRefreshing={isLoadingDate}
          />
        ) : currentUser?.role === "admin" ? (
          <AdminView />
        ) : (
          <>
            {!selectedGroup ? (
              <TeacherGroupsGrid 
                groups={teacherGroups} 
                onSelectGroup={(group) => setSearchParams({ groupId: group._id })}
                isLoading={isLoadingDate}
              />
            ) : (
              <TeacherAttendanceView
                group={selectedGroup}
                onBack={() => setSearchParams({})}
                startDate={startDate}
                endDate={endDate}
                setDateRange={setDateRange}
                availableDates={availableDates}
                nameQuery={nameQuery}
                setNameQuery={setNameQuery}
                displayStats={displayStats}
                isDateTooOld={dateTooOld}
                daysAgo={daysAgo}
                handleSave={handleSave}
                isSaving={isSaving}
                isLoadingDate={isLoadingDate}
                students={visibleStudents}
                selectedAll={selectedAll}
                toggleAllStudents={toggleAllStudents}
                toggleStudentPresence={toggleStudentPresence}
                hasUnsavedChanges={hasUnsavedChanges}
                isSaveDisabled={isSaveDisabled} // 🆕
                isAttendanceTaken={isAttendanceTaken} // 🆕
                noSectionInfo={noSectionInfo} // 🆕
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AbsencePage;