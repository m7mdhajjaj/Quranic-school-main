// ============================================================================
// IMPORTS
// ============================================================================

// React & Hooks
import { lazy, Suspense } from 'react';

// Socket Hooks
import {
  useDailyMarksSocket,
  useDailyMarksSocketEffects,
  useNotificationsSocket,
} from '../../Socket';

// Custom Hooks - Data Management
import { useDailyMarksData } from './hooks/useDailyMarksData';
import { useFilteredMarksData } from './hooks/useFilteredMarksData';
import { useStudentAverages } from './hooks/useStudentAverages';
import { useStudentIdForAverages } from './hooks/useStudentIdForAverages';
import { useDailyMarksState } from './hooks/useDailyMarksState';
import { useSectionsFilter } from './hooks/useSectionsFilter';

// Custom Hooks - Business Logic
import { useDailyMarksHandlers } from './hooks/useDailyMarksHandlers';
import { useModalActions } from './hooks/useModalActions';
import { useStudentSelection } from './hooks/useStudentSelection';
import { useInputHandlers } from './hooks/useInputHandlers';
import { useComputedValues } from './hooks/useComputedValues';
import { useFilteredStudents } from './hooks/useFilteredStudents';

// UI Components
import PageHeader from '@/components/UI/PageHeader';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { BookOpen } from 'lucide-react';

// Page Components
import { MonthYearFilter } from './components/MonthYearFilter';
import { StudentList } from './components/StudentList';
import { AveragesSection } from './components/AveragesSection';
import { StudentView } from './components/StudentView';
import { ModalsContainer } from './components/ModalsContainer';

// Lazy load heavy component
const TeacherView = lazy(() =>
  import('./components/TeacherView').then((m) => ({ default: m.TeacherView }))
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DailyMarksPage = () => {
  // ==========================================================================
  // SOCKET CONNECTIONS
  // ==========================================================================
  const { lastUpdate: socketLastUpdate } = useDailyMarksSocket();
  const { lastNotification } = useNotificationsSocket();

  // ==========================================================================
  // DATA & STATE HOOKS
  // ==========================================================================

  // Data Fetching & Management - Basic data (users, students, groups)
  const { currentUser, students, teacherGroups, loading } = useDailyMarksData();

  // Student Selection (with auto-select logic)
  const {
    selectedStudentId,
    selectedGroup,
    isPending,
    handleStudentSelect,
    setSelectedGroup,
  } = useStudentSelection(currentUser, teacherGroups, loading);

  // Component State (Modals, Forms, etc.)
  const state = useDailyMarksState();

  // Sections Filtering (month/year selection only)
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } =
    useSectionsFilter();

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
    state.searchQuery,
    !!currentUser && !!selectedGroup // Only fetch when user and group are ready
  );

  // Fetch averages from backend using custom hook for student ID resolution
  const studentIdForAverages = useStudentIdForAverages(currentUser, selectedStudentId);
    
  const { averages } = useStudentAverages(
    studentIdForAverages,
    selectedGroup,
    selectedMonth,
    selectedYear,
    !!currentUser && !!selectedGroup && !!studentIdForAverages
  );

  // Filtered Students
  const filteredStudents = useFilteredStudents({ students, selectedGroup });

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
    setIsBulkUpdateModalOpen: state.setIsBulkUpdateModalOpen,
    setIsBulkDeleteModalOpen: state.setIsBulkDeleteModalOpen,
    setSelectedSectionsForBulk: state.setSelectedSectionsForBulk,
  });

  // Modal Actions
  const modalActions = useModalActions({
    setSelectedSection: state.setSelectedSection,
    setNewMark: state.setNewMark,
    setIsAddMarkModalOpen: state.setIsAddMarkModalOpen,
    setEditingMark: state.setEditingMark,
    setIsUpdateMarkModalOpen: state.setIsUpdateMarkModalOpen,
    setEditingSection: state.setEditingSection,
    setIsEditSectionModalOpen: state.setIsEditSectionModalOpen,
    setSelectedSectionsForBulk: state.setSelectedSectionsForBulk,
  });

  // Input Change Handlers
  const inputHandlers = useInputHandlers({
    setNewSection: state.setNewSection,
    setEditingSection: state.setEditingSection,
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

  // Socket-based effects (marks refetch, notifications)
  useDailyMarksSocketEffects({
    socketLastUpdate,
    lastNotification,
    currentUser,
    selectedStudentId,
    refetchMarks,
    refetchSections,
  });

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-8 px-4 md:px-6 lg:px-8"
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

        {/* Filters Row - Teacher Only */}
        {currentUser?.role !== 'student' && (
          <div className="mb-8">
            {/* Month and Year Filter */}
            <MonthYearFilter
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              searchQuery={state.searchQuery}
              onSearchChange={state.setSearchQuery}
            />
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <LoadingSpinner size="lg" text="جاري التحميل..." />
        ) : (
          <>
            {currentUser?.role !== 'student' ? (
              // Teacher View - Student List on Right, Table on Left
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Student List - 1 column on Right */}
                <div className="xl:col-span-1">
                  <StudentList
                    students={filteredStudents}
                    teacherGroups={teacherGroups}
                    selectedGroup={selectedGroup}
                    selectedStudentId={selectedStudentId}
                    onGroupChange={setSelectedGroup}
                    onStudentSelect={handleStudentSelect}
                    onAddSection={() => state.setIsAddSectionModalOpen(true)}
                    onBulkUpdate={() => state.setIsBulkUpdateModalOpen(true)}
                    onBulkDelete={() => state.setIsBulkDeleteModalOpen(true)}
                  />
                </div>

                {/* Marks Table - 3 columns */}
                <div className="xl:col-span-3">
                  <Suspense fallback={<LoadingSpinner size="md" />}>
                    <TeacherView
                      students={students}
                      selectedStudentId={selectedStudentId}
                      sections={sections}
                      marks={marks}
                      loadingMarks={loadingMarks || isPending}
                      onAddMark={modalActions.openAddMarkModal}
                      onUpdateMark={modalActions.openUpdateMarkModal}
                      onEditSection={modalActions.openEditSectionModal}
                      onDeleteSection={handlers.handleDeleteSection}
                    />
                  </Suspense>
                </div>
              </div>
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
        state={state}
        handlers={handlers}
        inputHandlers={inputHandlers}
        modalActions={modalActions}
        getSelectedStudent={getSelectedStudent}
      />
    </div>
  );
};

export default DailyMarksPage;
