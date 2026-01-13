// AbsencePage.tsx
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAbsenceData, useAttendanceStats, useUnsavedChanges, useStudentFilters, useStudentSelection, useAttendanceSave } from "./hooks";
import { 
  StudentView, 
  TeacherGroupsGrid, 
  TeacherAttendanceView,
  AdminView,
  StudentViewSkeleton,
  GroupsGridSkeleton,
  TeacherViewSkeleton,
  AdminViewSkeleton
} from "./components";
import { isDateTooOld, getDaysAgo, todayISO } from "./utils/dateHelpers";
import { Card } from "@/components/UI/Card";
import PageHeader from "@/components/UI/PageHeader";

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
    teacherGroups,
    fetchStudentsForTeacher,
    fetchStudentAbsenceStats,
  } = useAbsenceData();

  const [isLoadingDate, setIsLoadingDate] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // استخراج الحلقة المختارة من الرابط
  const selectedGroupId = searchParams.get('groupId');
  const selectedGroup = useMemo(() => 
    teacherGroups.find(g => g._id === selectedGroupId) || null
  , [teacherGroups, selectedGroupId]);

  // استخدام hook للتحذير من التغييرات غير المحفوظة
  useUnsavedChanges({ hasUnsavedChanges });

  // Reset date when leaving group view (returning to groups list)
  useEffect(() => {
    if (!selectedGroupId) {
      const today = todayISO();
      setDateRange(today, today);
      setHasUnsavedChanges(false);
    }
  }, [selectedGroupId, setDateRange]);

  // Initial load
  useEffect(() => {
    if (!currentUser) return;
    if (!isInitialLoad) return; // تجنب التحميل المتكرر
    
    const loadData = async () => {
      if (currentUser.role === "teacher" || currentUser.role === "admin") {
        setIsLoadingDate(true);
        try {
          await fetchStudentsForTeacher(date);
          setHasUnsavedChanges(false);
        } finally {
          setIsLoadingDate(false);
          setIsInitialLoad(false);
        }
      } else if (currentUser.role === "student") {
        try {
          await fetchStudentAbsenceStats(currentUser._id);
        } finally {
          setIsInitialLoad(false);
        }
      }
    };
    
    loadData();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps
  
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
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Card variant="elevated" className="max-w-md p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">تنبيه</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{error}</p>
            {selectedGroupId && (
              <button
                onClick={() => setSearchParams({})}
                className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
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
      className="min-h-screen py-8 px-4 bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100"
      dir="rtl">
      <div className="container mx-auto max-w-[1800px]">
        {/* العنوان */}
        <PageHeader
          title="سجل الحضور والغياب"
          subtitle={
            currentUser?.role === "student"
              ? "اطّلع على سجل غيابك الشهري وإجمالي السنة"
              : currentUser?.role === "admin"
              ? "لوحة مراقبة شاملة لحضور جميع الطلاب والإحصائيات"
              : selectedGroup 
                ? `تسجيل الحضور لحلقة: ${selectedGroup.name}`
                : "اختر الحلقة للبدء بتسجيل الحضور"
          }
          icon={
            <div className="text-6xl">
              {currentUser?.role === "student" ? "📊" : currentUser?.role === "admin" ? "👔" : "📝"}
            </div>
          }
        />

        {isInitialLoad ? (
          // Initial Loading State
          currentUser?.role === "student" ? (
            <StudentViewSkeleton />
          ) : currentUser?.role === "admin" ? (
            <AdminViewSkeleton />
          ) : !selectedGroup ? (
            <GroupsGridSkeleton />
          ) : (
            <TeacherViewSkeleton />
          )
        ) : currentUser?.role === "student" ? (
          <StudentView monthlyStats={monthlyStats} />
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
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AbsencePage;