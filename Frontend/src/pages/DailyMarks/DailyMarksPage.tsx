// ============================================================================
// IMPORTS
// ============================================================================

import { lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

// UI Components
// PageHeader removed - using custom header

// Custom Hooks - Organized by Role/Category
import { 
  // Data hooks
  useDailyMarksData,
  useFilteredMarksData,
  useStudentAverages,
  useGroupStats,
  useCompletedSurahs,
  // Shared hooks
  useDailyMarksState,
  useSectionsFilter,
  useComputedValues,
  // Teacher hooks
  useDailyMarksHandlers,
  useStudentSelection,
  // Student hooks
  useStudentIdForAverages,
  // UI hooks
  useModalAndFormActions,
} from './hooks';
import { useAllGroupsStats } from './Views/TeacherView/hooks';

// Page Components
import { AveragesSection } from './components/AveragesSection';
import { NewStudentView } from './Views/NewStudentView';
import { GroupsGridView } from './Views/TeacherView/components/GroupsGridView';


// ✅ Lazy load heavy components
const TeacherView = lazy(() =>
  import('./Views/TeacherView/TeacherView').then((m) => ({ default: m.TeacherView }))
);

// ✅ Lazy load ModalsContainer - لا يُحمّل إلا عند الحاجة
const ModalsContainer = lazy(() =>
  import('./modals/ModalsContainer').then((m) => ({ default: m.ModalsContainer }))
);

// ============================================================================
// MAIN COMPONENT
// ✅ V3 Compatible - Date-Aware Sequence System
// - Supports backfilling (past dates)
// - Displays sections in chronological order
// - Backend handles sequence validation
// ============================================================================

const DailyMarksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const syncingUrlRef = useRef(false);

  // ==========================================================================
  // DATA & STATE HOOKS
  // ==========================================================================

  // Basic data (users, students, groups)
  const { currentUser, students, teacherGroups, loading } = useDailyMarksData();

  // Student selection with auto-select logic
  const { selectedStudentId, selectedGroup, isPending, setSelectedGroup } =
    useStudentSelection(currentUser, teacherGroups, loading);

  // URL <-> state sync for navigation (browser back/forward)
  const setGroupWithUrl = useCallback((group: string, replace = false) => {
    // prevent re-entry loops
    syncingUrlRef.current = true;

    const next = new URLSearchParams(searchParams);
    if (group) next.set('group', group);
    else next.delete('group');
    // when leaving group, also clear section
    if (!group) next.delete('sectionId');

    setSearchParams(next, { replace });
    setSelectedGroup(group);

    // release in microtask
    queueMicrotask(() => {
      syncingUrlRef.current = false;
    });
  }, [searchParams, setSearchParams, setSelectedGroup]);

  // when URL changes (back/forward), update state
  useEffect(() => {
    if (syncingUrlRef.current) return;
    const urlGroup = searchParams.get('group') || '';
    if (urlGroup !== selectedGroup) {
      setSelectedGroup(urlGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Component state (modals, forms, etc.)
  const state = useDailyMarksState();

  // Filter state (month/year/day/date range)
  const {
    selectedMonth,
    selectedYear,
    selectedDay,
    setSelectedMonth,
    setSelectedYear,
    setSelectedDay,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    filterMode,      // New
    setFilterMode    // New
  } = useSectionsFilter();

  // Determine student ID for filtering marks
  // For students: use their own ID (currentUser._id)
  // For teachers: use selectedStudentId (null to see all marks)
  const studentIdForMarksFilter = currentUser?.role === "student" ? currentUser._id : selectedStudentId;

  // ✅ Debounce البحث لتحسين الأداء - 300ms تأخير
  const debouncedSearchQuery = useDebounce(state.searchQuery, 300);

  // Fetch filtered sections and marks
  const {
    sections,
    marks,
    loading: loadingMarks,
    setSections,
    setMarks,
    refetchMarksOnly,
    refetchSectionsOnly,
  } = useFilteredMarksData(
    studentIdForMarksFilter,
    selectedGroup,
    selectedMonth,
    selectedYear,
    selectedDay || null,
    debouncedSearchQuery, // ✅ استخدام القيمة المؤخرة
    !!currentUser && !!selectedGroup,
    startDate,
    endDate,
    filterMode // Pass new filter mode
  );

  // Student ID for averages calculation
  const studentIdForAverages = useStudentIdForAverages(
    currentUser,
    selectedStudentId
  );

  // Fetch student averages
  const { averages, refetch: refetchAverages } = useStudentAverages(
    studentIdForAverages,
    selectedGroup,
    selectedMonth,
    selectedYear,
    !!currentUser && !!selectedGroup && !!studentIdForAverages
  );

  // Fetch Group Stats (for Progress Bar)
  const { refetch: refetchGroupStats } = useGroupStats(
    selectedGroup,
    selectedMonth,
    selectedYear,
    !!currentUser && !!selectedGroup
  );

  // Fetch Completed Surahs (for updates)
  const { refresh: refreshCompletedSurahs } = useCompletedSurahs(selectedGroup, false);

  // Combined Status Refetcher
  const refetchStats = async () => {
    await Promise.all([
      refetchAverages(),
      refetchGroupStats()
    ]);
  };

  // ==========================================================================
  // BUSINESS LOGIC HOOKS
  // ==========================================================================

  // Event handlers (CRUD operations)
  const handlers = useDailyMarksHandlers({
    selectedGroup,
    currentUser,
    setSections,
    setMarks,
    setIsAddSectionModalOpen: state.setIsAddSectionModalOpen,
    setIsEditSectionModalOpen: state.setIsEditSectionModalOpen,
    setEditingSection: state.setEditingSection,
    setIsAddMarkModalOpen: state.setIsAddMarkModalOpen,
    setIsUpdateMarkModalOpen: state.setIsUpdateMarkModalOpen,
    setEditingMark: state.setEditingMark,
    setIsBulkDeleteModalOpen: state.setIsBulkDeleteModalOpen,
    setSelectedSectionsForBulk: state.setSelectedSectionsForBulk,
    refetchMarks: refetchMarksOnly,
    refetchSections: refetchSectionsOnly,
    refetchStats,
    refetchCompletedSurahs: refreshCompletedSurahs,
  });

  // Modal actions & form handlers
  const {
    openAddMarkModal,
    openUpdateMarkModal,
    openEditSectionModal,
    toggleSectionSelection,
    handleSectionInputChange,
    handleEditSectionInputChange,
    handleMarkInputChange,
  } = useModalAndFormActions({
    setIsAddMarkModalOpen: state.setIsAddMarkModalOpen,
    setIsUpdateMarkModalOpen: state.setIsUpdateMarkModalOpen,
    setIsEditSectionModalOpen: state.setIsEditSectionModalOpen,
    setSelectedSection: state.setSelectedSection,
    setSelectedStudent: state.setSelectedStudent,
    setEditingMark: state.setEditingMark,
    setEditingSection: state.setEditingSection,
    setSelectedSectionsForBulk: state.setSelectedSectionsForBulk,
    setNewSection: state.setNewSection,
    setNewMark: state.setNewMark,
  });

  // Computed values & helpers
  const { getSelectedStudent, sectionsCount } = useComputedValues({
    students,
    selectedStudentId,
    sections,
  });

  // Get groups stats for GroupsGridView
  const { groupsWithStats, isAnyGroupLoading } = useAllGroupsStats(
    teacherGroups,
    selectedGroup,
    selectedMonth,
    selectedYear
  );

  const handleAddSectionClick = useCallback(() => {
    const today = new Date();
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    state.setNewSection(prev => ({ ...prev, date: localDate }));
    state.setIsAddSectionModalOpen(true);
  }, [state]);

  // ==========================================================================
  // ROLE & DEFAULT VALUES
  // ==========================================================================

  const isStudent = currentUser?.role === 'student';
  const isTeacherAssistant = currentUser?.role === 'teacherAssistant';
  const isTeacher = !isStudent; // Includes teacher, admin, and teacherAssistant

  // Default month/year for student view
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // ==========================================================================
  // RENDER
  // ==========================================================================

  // Show simple loading instead of skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // STUDENT VIEW - Full Width Layout (No wrapper, no header)
  // ==========================================================================
  if (isStudent) {
    return (
      <NewStudentView
        studentId={currentUser?._id || selectedStudentId || ''}
        groupId={selectedGroup || currentUser?.group || undefined}
      />
    );
  }

  // ==========================================================================
  // TEACHER VIEW - With Header and Container
  // ==========================================================================
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20"
      dir="rtl"
    >
      {/* Header - مثل باقي الصفحات */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white rounded-b-3xl shadow-xl p-6 pb-8 mb-6">
        <div className="max-w-[98%] mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* أيقونة */}
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg">
              <BookOpen className="w-10 h-10 md:w-12 md:h-12" />
            </div>

            {/* العنوان */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                نظام العلامات اليومية
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
                {currentUser
                  ? `المعلم: ${currentUser.firstName} ${currentUser.lastName || ''}`
                  : 'متابعة وتسجيل علامات الحفظ والمراجعة اليومية للطلاب'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pb-12 space-y-5">
        {/* Groups Grid View - Teacher Only, shown when no group selected */}
        {isTeacher && (!selectedGroup || selectedGroup === 'all') && (
          <GroupsGridView
            groupsWithStats={groupsWithStats}
            onGroupSelect={(g) => setGroupWithUrl(g, false)}
            isLoading={loading || isAnyGroupLoading}
            selectedFilterMode={filterMode}
            onFilterModeChange={setFilterMode}
          />
        )}

        {/* Groups Grid Skeleton - REMOVED per user request */}

        {/* Averages Section - Teacher Only */}
        {!loading && (
          <AveragesSection
            selectedStudentId={selectedStudentId}
            sectionsCount={sectionsCount}
            averages={averages}
            loading={loadingMarks}
          />
        )}

        {/* Main Content Area - Teacher View */}
        <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100 rounded-xl"></div>}>
          <TeacherView
              students={students}
              selectedGroup={selectedGroup}
              teacherGroups={teacherGroups}
              sections={sections}
              marks={marks}
              loadingMarks={loadingMarks || loading}
              onBulkMarks={() => {}}
              onGroupSelect={(g) => setGroupWithUrl(g, false)}
              // مساعد المدرس لا يستطيع إضافة أو تعديل أو حذف المقاطع
              onAddSection={isTeacherAssistant ? undefined : handleAddSectionClick}
              onEditSection={isTeacherAssistant ? undefined : openEditSectionModal}
              onDeleteSection={isTeacherAssistant ? undefined : handlers.handleDeleteSection}
              onBulkDelete={isTeacherAssistant ? undefined : () => state.setIsBulkDeleteModalOpen(true)}
              // مساعد المدرس يستطيع فقط إضافة علامات، ولا يستطيع تعديلها أو حذفها
              onAddMark={openAddMarkModal}
              onUpdateMark={isTeacherAssistant ? undefined : openUpdateMarkModal}
              onDeleteMark={isTeacherAssistant ? undefined : handlers.handleDeleteMark}
              onMarkChange={refetchMarksOnly}
              onRefreshData={() => {
                refetchSectionsOnly();
                refetchStats();
              }}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              selectedDay={selectedDay}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              onDayChange={setSelectedDay}
              searchQuery={state.searchQuery}
              onSearchChange={state.setSearchQuery}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              selectedFilterMode={filterMode}
              onFilterModeChange={setFilterMode}
            />
          </Suspense>
      </div>

      {/* Modals - Teacher Only (Lazy Loaded) */}
      <Suspense fallback={null}>
        <ModalsContainer
            currentUser={currentUser}
            selectedStudentId={selectedStudentId}
          selectedGroup={selectedGroup}
          sections={sections}
          refetchMarks={refetchMarksOnly}
          onMarkChange={refetchSectionsOnly}
          state={{
            ...state,
            selectedStudent: state.selectedStudent,
            setSelectedStudent: state.setSelectedStudent,
          }}
          handlers={handlers}
          handleSectionInputChange={handleSectionInputChange}
          handleEditSectionInputChange={handleEditSectionInputChange}
          handleMarkInputChange={handleMarkInputChange}
          openAddMarkModal={openAddMarkModal}
          openUpdateMarkModal={openUpdateMarkModal}
          openEditSectionModal={openEditSectionModal}
          toggleSectionSelection={toggleSectionSelection}
          getSelectedStudent={getSelectedStudent}
          />
      </Suspense>
    </div>
  );
};

export default DailyMarksPage;
