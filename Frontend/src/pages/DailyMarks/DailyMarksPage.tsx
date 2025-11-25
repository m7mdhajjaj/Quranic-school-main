// ============================================================================
// IMPORTS
// ============================================================================

// React & Hooks
import { lazy, Suspense, useEffect, useCallback } from 'react';

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

// Lazy load heavy components
const TeacherView = lazy(() =>
  import('./components/TeacherView').then((m) => ({ default: m.TeacherView }))
);
const AddSectionModal = lazy(() =>
  import('./modals/AddSectionModal').then((m) => ({
    default: m.AddSectionModal,
  }))
);
const EditSectionModal = lazy(() =>
  import('./modals/EditSectionModal').then((m) => ({
    default: m.EditSectionModal,
  }))
);
const AddMarkModal = lazy(() =>
  import('./modals/AddMarkModal').then((m) => ({ default: m.AddMarkModal }))
);
const UpdateMarkModal = lazy(() =>
  import('./modals/UpdateMarkModal').then((m) => ({
    default: m.UpdateMarkModal,
  }))
);
const BulkUpdateModal = lazy(() =>
  import('./modals/BulkUpdateModal').then((m) => ({
    default: m.BulkUpdateModal,
  }))
);
const BulkDeleteModal = lazy(() =>
  import('./modals/BulkDeleteModal').then((m) => ({
    default: m.BulkDeleteModal,
  }))
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

  // Student Selection
  const {
    selectedStudentId,
    selectedGroup,
    isPending,
    handleStudentSelect,
    setSelectedGroup,
  } = useStudentSelection();

  // Component State (Modals, Forms, etc.)
  const state = useDailyMarksState();

  // Sections Filtering (needs to be before data hooks)
  const {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    calculateAverages,
  } = useSectionsFilter([], state.searchQuery);

  // Data Fetching & Management - Basic data (users, students, groups)
  const {
    currentUser,
    students,
    teacherGroups,
    loading,
  } = useDailyMarksData(selectedStudentId, selectedGroup);

  // Filtered Data Fetching - Uses new filtered API (enabled for all roles)
  const {
    sections: filteredSectionsData,
    marks: filteredMarksData,
    loading: loadingFiltered,
    setSections,
    setMarks,
    refetch: refetchFilteredData,
  } = useFilteredMarksData(
    selectedStudentId,
    selectedGroup,
    selectedMonth,
    selectedYear,
    state.searchQuery,
    !!currentUser && !!selectedGroup // Only fetch when user and group are ready
  );

  // Fetch averages from backend
  const { averages: backendAverages } = useStudentAverages(
    selectedStudentId,
    selectedGroup,
    selectedMonth,
    selectedYear,
    !!currentUser && !!selectedGroup && !!selectedStudentId
  );

  // Use filtered data for all roles (students, teachers, admins)
  const sections = filteredSectionsData;
  const marks = filteredMarksData;
  const loadingMarks = loadingFiltered;

  // Refetch functions that work with filtered API
  const refetchMarks = useCallback(async () => {
    await refetchFilteredData();
  }, [refetchFilteredData]);

  const refetchSections = useCallback(async () => {
    await refetchFilteredData();
  }, [refetchFilteredData]);

  // For students, set their group automatically
  useEffect(() => {
    if (
      currentUser?.role === 'student' &&
      currentUser.group &&
      !selectedGroup
    ) {
      console.log('🎓 Setting student group:', currentUser.group);
      setSelectedGroup(currentUser.group);
    }
  }, [currentUser, selectedGroup, setSelectedGroup]);

  // Filtered Students
  const filteredStudents = useFilteredStudents({ students, selectedGroup });

  // Auto-select first group after data loads
  useEffect(() => {
    if (teacherGroups.length > 0 && !selectedGroup && !loading) {
      console.log('🎯 Auto-selecting first group:', teacherGroups[0]);
      setSelectedGroup(teacherGroups[0]);
    }
  }, [teacherGroups, selectedGroup, loading, setSelectedGroup]);

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
    sections: sections,
    marks,
    currentUserId:
      currentUser?.role === 'student' ? currentUser._id : undefined,
    calculateAverages,
  });

  // Use backend averages instead of frontend calculation
  const averages = backendAverages;

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
      {currentUser?.role !== 'student' && (
        <Suspense fallback={null}>
          {/* Add Section Modal */}
          <AddSectionModal
            isOpen={state.isAddSectionModalOpen}
            selectedGroup={selectedGroup}
            newSection={state.newSection}
            isLoading={state.isAddingSectionLoading}
            onClose={() => state.setIsAddSectionModalOpen(false)}
            onSubmit={(e) =>
              handlers.handleAddSection(
                e,
                state.newSection,
                state.setNewSection,
                state.setIsAddingSectionLoading
              )
            }
            onChange={inputHandlers.handleSectionInputChange}
          />

          {/* Edit Section Modal */}
          <EditSectionModal
            isOpen={state.isEditSectionModalOpen}
            editingSection={state.editingSection}
            isLoading={state.isEditingSectionLoading}
            onClose={() => {
              state.setIsEditSectionModalOpen(false);
              state.setEditingSection(null);
            }}
            onSubmit={(e) =>
              handlers.handleEditSection(
                e,
                state.editingSection,
                state.setIsEditingSectionLoading
              )
            }
            onChange={inputHandlers.handleEditSectionInputChange}
          />

          {/* Add Mark Modal */}
          <AddMarkModal
            isOpen={state.isAddMarkModalOpen}
            selectedSection={state.selectedSection}
            selectedStudent={getSelectedStudent()}
            newMark={state.newMark}
            isLoading={state.isAddingMarkLoading}
            onClose={() => state.setIsAddMarkModalOpen(false)}
            onSubmit={(e) =>
              handlers.handleAddMark(
                e,
                selectedStudentId,
                state.selectedSection,
                state.newMark,
                state.setIsAddingMarkLoading
              )
            }
            onChange={inputHandlers.handleMarkInputChange}
          />

          {/* Update Mark Modal */}
          <UpdateMarkModal
            isOpen={state.isUpdateMarkModalOpen}
            selectedSection={state.selectedSection}
            selectedStudent={getSelectedStudent()}
            editingMark={state.editingMark}
            newMark={state.newMark}
            isLoading={state.isUpdatingMarkLoading}
            onClose={() => {
              state.setIsUpdateMarkModalOpen(false);
              state.setEditingMark(null);
            }}
            onSubmit={(e) =>
              handlers.handleUpdateMark(
                e,
                state.editingMark,
                selectedStudentId,
                state.selectedSection,
                state.newMark,
                state.setIsUpdatingMarkLoading
              )
            }
            onChange={inputHandlers.handleMarkInputChange}
          />

          {/* Bulk Update Modal */}
          <BulkUpdateModal
            isOpen={state.isBulkUpdateModalOpen}
            sections={sections}
            selectedSectionsForBulk={state.selectedSectionsForBulk}
            isLoading={state.isBulkUpdating}
            onClose={() => {
              state.setIsBulkUpdateModalOpen(false);
              state.setSelectedSectionsForBulk([]);
            }}
            onToggleSection={modalActions.toggleSectionSelection}
            onSubmit={(updateData) =>
              handlers.executeBulkUpdate(
                sections,
                state.selectedSectionsForBulk,
                updateData,
                state.setIsBulkUpdating
              )
            }
          />

          {/* Bulk Delete Modal */}
          <BulkDeleteModal
            isOpen={state.isBulkDeleteModalOpen}
            sections={sections}
            selectedSectionsForBulk={state.selectedSectionsForBulk}
            isLoading={state.isBulkDeleting}
            onClose={() => {
              state.setIsBulkDeleteModalOpen(false);
              state.setSelectedSectionsForBulk([]);
            }}
            onToggleSection={modalActions.toggleSectionSelection}
            onConfirm={() =>
              handlers.executeBulkDelete(
                state.selectedSectionsForBulk,
                state.setIsBulkDeleting
              )
            }
          />
        </Suspense>
      )}
    </div>
  );
};

export default DailyMarksPage;
