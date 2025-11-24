// ============================================================================
// IMPORTS
// ============================================================================

// React & Hooks
import { useState, useEffect, useMemo, useCallback, useTransition, lazy, Suspense } from "react";

// Socket & Data Hooks
import { useDailyMarksSocket, useNotificationsSocket } from "../../Socket";
import { useDailyMarksData } from "./hooks/useDailyMarksData";
import { useSectionsFilter } from "./hooks/useSectionsFilter";
import { useDailyMarksState } from "./hooks/useDailyMarksState";
import { useDailyMarksHandlers } from "./hooks/useDailyMarksHandlers";
import { useModalActions } from "./hooks/useModalActions";

// UI Components
import PageHeader from "@/components/UI/PageHeader";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { BookOpen } from "lucide-react";

// Page Components
import { MonthYearFilter } from "./components/MonthYearFilter";
import { StudentList } from "./components/StudentList";
import { AveragesSection } from "./components/AveragesSection";
import { StudentView } from "./components/StudentView";

// Lazy load heavy components
const TeacherView = lazy(() => import("./components/TeacherView").then(m => ({ default: m.TeacherView })));
const AddSectionModal = lazy(() => import("./modals/AddSectionModal").then(m => ({ default: m.AddSectionModal })));
const EditSectionModal = lazy(() => import("./modals/EditSectionModal").then(m => ({ default: m.EditSectionModal })));
const AddMarkModal = lazy(() => import("./modals/AddMarkModal").then(m => ({ default: m.AddMarkModal })));
const UpdateMarkModal = lazy(() => import("./modals/UpdateMarkModal").then(m => ({ default: m.UpdateMarkModal })));
const BulkUpdateModal = lazy(() => import("./modals/BulkUpdateModal").then(m => ({ default: m.BulkUpdateModal })));
const BulkDeleteModal = lazy(() => import("./modals/BulkDeleteModal").then(m => ({ default: m.BulkDeleteModal })));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DailyMarksPage = () => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  // Local Selection State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  
  // Optimistic student selection
  const handleStudentSelect = useCallback((studentId: string) => {
    // Update UI immediately
    setSelectedStudentId(studentId);
    // Mark as pending for heavy operations
    startTransition(() => {
      // Heavy re-renders happen in transition
    });
  }, []);

  // ==========================================================================
  // CUSTOM HOOKS
  // ==========================================================================
  
  // Socket Connections
  const { lastUpdate: socketLastUpdate } = useDailyMarksSocket();
  const { lastNotification } = useNotificationsSocket();

  // Data Fetching & Management
  const {
    currentUser,
    students,
    sections,
    marks,
    teacherGroups,
    loading,
    loadingMarks,
    setMarks,
    setSections,
    refetchMarks,
    refetchSections,
  } = useDailyMarksData(selectedStudentId, selectedGroup);

  // Component State (Modals, Forms, etc.)
  const state = useDailyMarksState({ students, teacherGroups });

  // Sections Filtering
  const {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    getFilteredSections,
    calculateAverages,
  } = useSectionsFilter(sections);

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

  // ==========================================================================
  // SIDE EFFECTS
  // ==========================================================================
  
  // Auto-select first group when loaded
  useEffect(() => {
    if (teacherGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(teacherGroups[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherGroups]);

  // Reset student selection when group changes
  useEffect(() => {
    setSelectedStudentId(null);
  }, [selectedGroup]);

  // Refetch marks on socket updates
  useEffect(() => {
    if (!socketLastUpdate || !currentUser) return;
    refetchMarks(selectedStudentId || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketLastUpdate, currentUser, selectedStudentId]);

  // Listen to notifications and refetch sections when assignment notification received
  useEffect(() => {
    if (!lastNotification || !currentUser) return;
    
    // Only refetch for assignment notifications (sections related)
    if (lastNotification.type === "assignment") {
      console.log("📚 Section notification received, refetching sections...");
      refetchSections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastNotification, currentUser]);

  // ==========================================================================
  // INPUT CHANGE HANDLERS
  // ==========================================================================
  
  const handleSectionInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    state.setNewSection((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEditSectionInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    state.setEditingSection((prev) => prev ? { ...prev, [name]: value } : null);
  }, []);

  const handleMarkInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    state.setNewMark((prev) => ({ ...prev, [name]: Number(value) }));
  }, []);

  // ==========================================================================
  // COMPUTED VALUES & HELPERS
  // ==========================================================================
  
  const filteredSections = useMemo(() => getFilteredSections(), [getFilteredSections]);
  
  const averages = useMemo(() => calculateAverages(
    marks,
    currentUser?.role === "student" ? currentUser._id : selectedStudentId
  ), [marks, currentUser, selectedStudentId, calculateAverages]);

  const getSelectedStudent = useCallback(() => {
    return students.find((s) => s._id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // ==========================================================================
  // RENDER
  // ==========================================================================
  
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-8 px-4 md:px-6 lg:px-8"
      dir="rtl">
      <div className="w-full max-w-full mx-auto">
        {/* Page Header */}
        <PageHeader
          title="نظام العلامات اليومية"
          subtitle={
            currentUser
              ? currentUser.role === "student"
                ? `${currentUser.firstName} ${currentUser.fatherName || ""} ${currentUser.lastName || ""} - ${currentUser.group || ""}`
                : `المعلم: ${currentUser.firstName} ${currentUser.lastName || ""}`
              : "متابعة وتسجيل علامات الحفظ والمراجعة اليومية للطلاب"
          }
          icon={<BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
          showDivider={true}
        />

        {/* Filters Row - Teacher Only */}
        {currentUser?.role !== "student" && (
          <div className="mb-8">
            {/* Month and Year Filter */}
            <MonthYearFilter
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
            />
          </div>
        )}

        {/* Month Filter for Students */}
        {currentUser?.role === "student" && (
          <MonthYearFilter
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        )}

        {/* Averages Section - Above All Content */}
        {currentUser?.role !== "student" && (
          <AveragesSection
            selectedStudentId={selectedStudentId}
            sectionsCount={filteredSections.length}
            averages={averages}
          />
        )}

        {/* Main Content Area */}
        {loading ? (
          <LoadingSpinner size="lg" text="جاري التحميل..." />
        ) : (
          <>
            {currentUser?.role !== "student" ? (
              // Teacher View - Student List on Right, Table on Left
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Student List - 1 column on Right */}
                <div className="xl:col-span-1">
                  <StudentList
                    students={state.filteredStudents}
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
                      sections={filteredSections}
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
                sections={filteredSections}
                marks={marks}
                loadingMarks={loadingMarks}
                averages={averages}
              />
            )}
          </>
        )}
      </div>

      {/* Modal Components - Teacher Only */}
      {currentUser?.role !== "student" && (
        <Suspense fallback={null}>
          {/* Add Section Modal */}
          <AddSectionModal
            isOpen={state.isAddSectionModalOpen}
            selectedGroup={selectedGroup}
            newSection={state.newSection}
            isLoading={state.isAddingSectionLoading}
            onClose={() => state.setIsAddSectionModalOpen(false)}
            onSubmit={(e) => handlers.handleAddSection(e, state.newSection, state.setNewSection, state.setIsAddingSectionLoading)}
            onChange={handleSectionInputChange}
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
            onSubmit={(e) => handlers.handleEditSection(e, state.editingSection, state.setIsEditingSectionLoading)}
            onChange={handleEditSectionInputChange}
          />

          {/* Add Mark Modal */}
          <AddMarkModal
            isOpen={state.isAddMarkModalOpen}
            selectedSection={state.selectedSection}
            selectedStudent={getSelectedStudent()}
            newMark={state.newMark}
            isLoading={state.isAddingMarkLoading}
            onClose={() => state.setIsAddMarkModalOpen(false)}
            onSubmit={(e) => handlers.handleAddMark(e, selectedStudentId, state.selectedSection, state.newMark, state.setIsAddingMarkLoading)}
            onChange={handleMarkInputChange}
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
            onSubmit={(e) => handlers.handleUpdateMark(e, state.editingMark, selectedStudentId, state.selectedSection, state.newMark, state.setIsUpdatingMarkLoading)}
            onChange={handleMarkInputChange}
          />

          {/* Bulk Update Modal */}
          <BulkUpdateModal
            isOpen={state.isBulkUpdateModalOpen}
            sections={filteredSections}
            selectedSectionsForBulk={state.selectedSectionsForBulk}
            isLoading={state.isBulkUpdating}
            onClose={() => {
              state.setIsBulkUpdateModalOpen(false);
              state.setSelectedSectionsForBulk([]);
            }}
            onToggleSection={modalActions.toggleSectionSelection}
            onSubmit={(updateData) => handlers.executeBulkUpdate(filteredSections, state.selectedSectionsForBulk, updateData, state.setIsBulkUpdating)}
          />

          {/* Bulk Delete Modal */}
          <BulkDeleteModal
            isOpen={state.isBulkDeleteModalOpen}
            sections={filteredSections}
            selectedSectionsForBulk={state.selectedSectionsForBulk}
            isLoading={state.isBulkDeleting}
            onClose={() => {
              state.setIsBulkDeleteModalOpen(false);
              state.setSelectedSectionsForBulk([]);
            }}
            onToggleSection={modalActions.toggleSectionSelection}
            onConfirm={() => handlers.executeBulkDelete(state.selectedSectionsForBulk, state.setIsBulkDeleting)}
          />
        </Suspense>
      )}

     
    </div>
  );
};

export default DailyMarksPage;
