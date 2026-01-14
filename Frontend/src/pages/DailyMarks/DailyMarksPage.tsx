// ============================================================================
// IMPORTS
// ============================================================================

import { lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

// UI Components
import PageHeader from '@/components/UI/PageHeader';

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
import { StudentView } from './Views/StudentView';
import { ModalsContainer } from './modals/ModalsContainer';
import { GroupsGridView } from './Views/TeacherView/components/GroupsGridView';
import { DailyMarksPageSkeleton } from '../../components/skeletons/DailyMarksSkeletons';


// Lazy load heavy component
const TeacherView = lazy(() =>
  import('./Views/TeacherView/TeacherView').then((m) => ({ default: m.TeacherView }))
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
    state.searchQuery,
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
  const isTeacher = !isStudent;

  // Default month/year for student view
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (loading) {
    return <DailyMarksPageSkeleton />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-green-50 py-6 px-3 md:px-4 lg:px-6"
      dir="rtl"
    >
      <div className="w-full max-w-full mx-auto space-y-5">
        {/* Page Header */}
        <PageHeader
          title="نظام العلامات اليومية"
          subtitle={
            currentUser
              ? isStudent
                ? `${currentUser.firstName} ${currentUser.fatherName || ''} ${currentUser.lastName || ''} - ${currentUser.group || ''}`
                : `المعلم: ${currentUser.firstName} ${currentUser.lastName || ''}`
              : 'متابعة وتسجيل علامات الحفظ والمراجعة اليومية للطلاب'
          }
          icon={<BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
          showDivider={true}
        />

        {/* Groups Grid View - Teacher Only, shown when no group selected */}
        {isTeacher && (!selectedGroup || selectedGroup === 'all') && (
          <GroupsGridView
            groupsWithStats={groupsWithStats}
            onGroupSelect={(g) => setGroupWithUrl(g, false)}
            isLoading={loading || isAnyGroupLoading}
          />
        )}

        {/* Groups Grid Skeleton - REMOVED per user request */}

        {/* Averages Section - Teacher Only */}
        {isTeacher && !loading && (
          <AveragesSection
            selectedStudentId={selectedStudentId}
            sectionsCount={sectionsCount}
            averages={averages}
            loading={loadingMarks}
          />
        )}

        {/* Main Content Area */}
        {isStudent ? (
          <StudentView
            sections={sections}
            marks={marks}
            loadingMarks={loadingMarks || loading}
            averages={averages}
            selectedMonth={selectedMonth ?? currentMonth}
            selectedYear={selectedYear ?? currentYear}
            studentId={selectedStudentId}
            onMonthChange={(month: number) => setSelectedMonth(month)}
            onYearChange={(year: number) => setSelectedYear(year)}
          />
        ) : (
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
              onAddSection={handleAddSectionClick}
              onEditSection={openEditSectionModal}
              onDeleteSection={handlers.handleDeleteSection}
              onBulkDelete={() => state.setIsBulkDeleteModalOpen(true)}
              onAddMark={openAddMarkModal}
              onUpdateMark={openUpdateMarkModal}
              onDeleteMark={handlers.handleDeleteMark}
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
        )}
      </div>

      {/* Modals - Teacher Only */}
      {isTeacher && (
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
      )}
    </div>
  );
};

export default DailyMarksPage;
