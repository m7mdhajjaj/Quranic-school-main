// ============================================================================
// IMPORTS
// ============================================================================

// React & Hooks
import { lazy, Suspense } from 'react';

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

// UI Components
import PageHeader from '@/components/UI/PageHeader';
import { BookOpen } from 'lucide-react';

// Page Components
import { MonthYearFilter } from './components/MonthYearFilter';
import { AveragesSection } from './components/AveragesSection';
import { StudentView } from './Views/StudentView';
import { ModalsContainer } from './modals/ModalsContainer';
import { AveragesBarSkeleton } from '../../components/skeletons/AveragesBarSkeleton';

// Lazy load heavy component
const TeacherView = lazy(() =>
  import('./Views/TeacherView').then((m) => ({ default: m.TeacherView }))
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DailyMarksPage = () => {
  // ==========================================================================
  // SOCKET CONNECTIONS
  // ==========================================================================

  // ==========================================================================
  // DATA & STATE HOOKS
  // ==========================================================================

  // Data Fetching & Management - Basic data (users, students, groups)
  const { currentUser, students, teacherGroups, loading } = useDailyMarksData();

  // Student Selection (with auto-select logic)
  const { selectedStudentId, selectedGroup, isPending, setSelectedGroup } =
    useStudentSelection(currentUser, teacherGroups, loading);

  // Component State (Modals, Forms, etc.)
  const state = useDailyMarksState();

  // Sections Filtering (month/year/day selection)
  const {
    selectedMonth,
    selectedYear,
    selectedDay,
    setSelectedMonth,
    setSelectedYear,
    setSelectedDay,
  } = useSectionsFilter();

  // Filtered Data Fetching - Uses new filtered API (enabled for all roles)
  const {
    sections,
    marks,
    loading: loadingMarks,
    setSections,
    setMarks,
    refetch: refetchMarks,
    refetchSections,
  } = useFilteredMarksData(
    selectedStudentId,
    selectedGroup,
    selectedMonth,
    selectedYear,
    selectedDay || null,
    state.searchQuery,
    !!currentUser && !!selectedGroup // Only fetch when user and group are ready
  );

  // Fetch averages from backend using custom hook for student ID resolution
  const studentIdForAverages = useStudentIdForAverages(
    currentUser,
    selectedStudentId
  );

  const { averages } = useStudentAverages(
    studentIdForAverages,
    selectedGroup,
    selectedMonth,
    selectedYear,
    !!currentUser && !!selectedGroup && !!studentIdForAverages
  );

  // Filtered Students

  // ==========================================================================
  // BUSINESS LOGIC HOOKS
  // ==========================================================================

  // Event Handlers
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

  // Modal Actions & Input Handlers (merged)
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

  // Computed Values & Helpers
  const { getSelectedStudent, sectionsCount } = useComputedValues({
    students,
    selectedStudentId,
    sections,
  });

  // ==========================================================================
  // SIDE EFFECTS
  // ==========================================================================

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-green-50 py-8 px-4 md:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="w-full max-w-full mx-auto">
        {/* Page Header */}
        <PageHeader
          title="نظام العلامات اليومية"
          subtitle={
            currentUser
              ? currentUser.role === 'student'
                ? `${currentUser.firstName} ${currentUser.fatherName || ''} ${currentUser.lastName || ''} - ${currentUser.group || ''}`
                : `المعلم: ${currentUser.firstName} ${currentUser.lastName || ''}`
              : 'متابعة وتسجيل علامات الحفظ والمراجعة اليومية للطلاب'
          }
          icon={<BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
          showDivider={true}
        />

        {/* Averages Section - Above All Content (Teacher Only) */}
        {currentUser?.role !== 'student' && (
          <AveragesSection
            selectedStudentId={selectedStudentId}
            sectionsCount={sectionsCount}
            averages={averages}
          />
        )}

        {/* Filters Row - Only for students (teachers have filter in TeacherView) */}
        {currentUser?.role === 'student' && (
          <div className="mb-8">
            {/* Month and Year Filter */}
            <MonthYearFilter
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              selectedDay={selectedDay}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              onDayChange={setSelectedDay}
              searchQuery={state.searchQuery}
              onSearchChange={state.setSearchQuery}
            />
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="space-y-8">
            {/* Averages Skeleton for Teachers */}
            {(!currentUser || currentUser?.role !== 'student') && (
              <AveragesBarSkeleton />
            )}
          </div>
        ) : (
          <>
            {currentUser?.role !== 'student' ? (
              // Teacher View - Full width
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
                />
              </Suspense>
            ) : (
              // Student View
              <StudentView
                sections={sections}
                marks={marks}
                loadingMarks={loadingMarks}
                averages={averages}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
                searchQuery={state.searchQuery}
                onSearchChange={state.setSearchQuery}
              />
            )}
          </>
        )}
      </div>

      {/* Modal Components - Teacher Only */}
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
    </div>
  );
};

export default DailyMarksPage;
