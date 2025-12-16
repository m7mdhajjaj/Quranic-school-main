// ============================================================================
// IMPORTS
// ============================================================================

import { lazy, Suspense } from 'react';
import { BookOpen } from 'lucide-react';

// UI Components
import PageHeader from '@/components/UI/PageHeader';
import { AveragesBarSkeleton } from '../../components/skeletons/AveragesBarSkeleton';

// Custom Hooks - Data Management
import { useDailyMarksData } from './hooks/useDailyMarksData';
import { useFilteredMarksData } from './hooks/useFilteredMarksData';
import { useStudentAverages } from './hooks/useStudentAverages';
import { useStudentIdForAverages } from './hooks/useStudentIdForAverages';
import { useDailyMarksState } from './hooks/useDailyMarksState';
import { useSectionsFilter } from './hooks/useSectionsFilter';

// Custom Hooks - Business Logic
import { useDailyMarksHandlers } from './hooks/useDailyMarksHandlers';
import { useModalAndFormActions } from './hooks/useModalAndFormActions';
import { useStudentSelection } from './hooks/useStudentSelection';
import { useComputedValues } from './hooks/useComputedValues';
import { useAllGroupsStats } from './Views/TeacherView/hooks';

// Page Components
import { AveragesSection } from './components/AveragesSection';
import { StudentView } from './Views/StudentView';
import { ModalsContainer } from './modals/ModalsContainer';
import { GroupsGridView } from './Views/TeacherView/components/GroupsGridView';

// Lazy load heavy component
const TeacherView = lazy(() =>
  import('./Views/TeacherView/TeacherView').then((m) => ({ default: m.TeacherView }))
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DailyMarksPage = () => {
  // ==========================================================================
  // DATA & STATE HOOKS
  // ==========================================================================

  // Basic data (users, students, groups)
  const { currentUser, students, teacherGroups, loading } = useDailyMarksData();

  // Student selection with auto-select logic
  const { selectedStudentId, selectedGroup, isPending, setSelectedGroup } =
    useStudentSelection(currentUser, teacherGroups, loading);

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
    refetch: refetchMarks,
    refetchSections,
  } = useFilteredMarksData(
    studentIdForMarksFilter,
    selectedGroup,
    selectedMonth,
    selectedYear,
    selectedDay || null,
    state.searchQuery,
    !!currentUser && !!selectedGroup,
    startDate,
    endDate
  );

  // Student ID for averages calculation
  const studentIdForAverages = useStudentIdForAverages(
    currentUser,
    selectedStudentId
  );

  // Fetch student averages
  const { averages } = useStudentAverages(
    studentIdForAverages,
    selectedGroup,
    selectedMonth,
    selectedYear,
    !!currentUser && !!selectedGroup && !!studentIdForAverages
  );

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
    refetchMarks,
    refetchSections,
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
        {isTeacher && !loading && (!selectedGroup || selectedGroup === 'all') && (
          <GroupsGridView
            groupsWithStats={groupsWithStats}
            onGroupSelect={setSelectedGroup}
            isLoading={isAnyGroupLoading}
          />
        )}

        {/* Averages Section - Teacher Only */}
        {isTeacher && !loading && (
          <AveragesSection
            selectedStudentId={selectedStudentId}
            sectionsCount={sectionsCount}
            averages={averages}
          />
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="space-y-8">
            {isTeacher && <AveragesBarSkeleton />}
          </div>
        ) : (
          <>
            {isStudent ? (
              <StudentView
                sections={sections}
                marks={marks}
                loadingMarks={loadingMarks}
                averages={averages}
                selectedMonth={selectedMonth ?? currentMonth}
                selectedYear={selectedYear ?? currentYear}
                studentId={selectedStudentId}
                onMonthChange={(month: number) => setSelectedMonth(month)}
                onYearChange={(year: number) => setSelectedYear(year)}
              />
            ) : (
              <Suspense fallback={<AveragesBarSkeleton />}>
                <TeacherView
                  students={students}
                  selectedGroup={selectedGroup}
                  teacherGroups={teacherGroups}
                  sections={sections}
                  marks={marks}
                  loadingMarks={loadingMarks || isPending}
                  onBulkMarks={() => {}}
                  onGroupSelect={setSelectedGroup}
                  onAddSection={() => state.setIsAddSectionModalOpen(true)}
                  onEditSection={openEditSectionModal}
                  onDeleteSection={handlers.handleDeleteSection}
                  onBulkDelete={() => state.setIsBulkDeleteModalOpen(true)}
                  onAddMark={openAddMarkModal}
                  onUpdateMark={openUpdateMarkModal}
                  onDeleteMark={handlers.handleDeleteMark}
                  onMarkChange={refetchMarks}
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
                />
              </Suspense>
            )}
          </>
        )}
      </div>

      {/* Modals - Teacher Only */}
      {isTeacher && (
        <ModalsContainer
          currentUser={currentUser}
          selectedStudentId={selectedStudentId}
        selectedGroup={selectedGroup}
        sections={sections}
        refetchMarks={refetchMarks}
        onMarkChange={refetchMarks}
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
