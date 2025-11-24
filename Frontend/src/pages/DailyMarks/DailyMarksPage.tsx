// ============================================================================
// IMPORTS
// ============================================================================

// React & Hooks
import { useState, useEffect, useMemo, useCallback, memo, useTransition } from "react";

// Socket & Data Hooks
import { useDailyMarksSocket } from "../../Socket";
import { useDailyMarksData } from "./hooks/useDailyMarksData";
import { useSectionsFilter } from "./hooks/useSectionsFilter";
import { useDailyMarksState } from "./hooks/useDailyMarksState";
import { useDailyMarksHandlers } from "./hooks/useDailyMarksHandlers";
import { useModalActions } from "./hooks/useModalActions";

// UI Components
import PageHeader from "@/components/UI/PageHeader";
import { BookOpen } from "lucide-react";

// Page Components
import { MonthYearFilter } from "./components/MonthYearFilter";
import { StudentList } from "./components/StudentList";
import { AveragesSection } from "./components/AveragesSection";
import { TeacherView } from "./components/TeacherView";
import { StudentView } from "./components/StudentView";

// Modal Components
import { AddSectionModal } from "./modals/AddSectionModal";
import { EditSectionModal } from "./modals/EditSectionModal";
import { AddMarkModal } from "./modals/AddMarkModal";
import { UpdateMarkModal } from "./modals/UpdateMarkModal";
import { BulkUpdateModal } from "./modals/BulkUpdateModal";
import { BulkDeleteModal } from "./modals/BulkDeleteModal";

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

  // ==========================================================================
  // CUSTOM HOOKS
  // ==========================================================================
  
  // Socket Connection
  const { lastUpdate: socketLastUpdate } = useDailyMarksSocket();

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

  // ==========================================================================
  // INPUT CHANGE HANDLERS
  // ==========================================================================
  
  const handleSectionInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    state.setNewSection((prev) => ({ ...prev, [name]: value }));
  }, [state.setNewSection]);

  const handleEditSectionInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    state.setEditingSection((prev) => prev ? { ...prev, [name]: value } : null);
  }, [state.setEditingSection]);

  const handleMarkInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    state.setNewMark((prev) => ({ ...prev, [name]: Number(value) }));
  }, [state.setNewMark]);

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
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-gray-600 font-medium">جاري التحميل...</p>
          </div>
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
                    onStudentSelect={setSelectedStudentId}
                    onAddSection={() => state.setIsAddSectionModalOpen(true)}
                    onBulkUpdate={() => state.setIsBulkUpdateModalOpen(true)}
                    onBulkDelete={() => state.setIsBulkDeleteModalOpen(true)}
                  />
                </div>

                {/* Marks Table - 3 columns */}
                <div className="xl:col-span-3">
                  <TeacherView
                    students={students}
                    selectedStudentId={selectedStudentId}
                    sections={filteredSections}
                    marks={marks}
                    loadingMarks={loadingMarks}
                    onAddMark={modalActions.openAddMarkModal}
                    onUpdateMark={modalActions.openUpdateMarkModal}
                    onEditSection={modalActions.openEditSectionModal}
                    onDeleteSection={handlers.handleDeleteSection}
                  />
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
        <>
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
            onClose={() => {
              state.setIsEditSectionModalOpen(false);
              state.setEditingSection(null);
            }}
            onSubmit={(e) => handlers.handleEditSection(e, state.editingSection)}
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
            onClose={() => {
              state.setIsUpdateMarkModalOpen(false);
              state.setEditingMark(null);
            }}
            onSubmit={(e) => handlers.handleUpdateMark(e, state.editingMark, selectedStudentId, state.selectedSection, state.newMark)}
            onChange={handleMarkInputChange}
          />

          {/* Bulk Update Modal */}
          <BulkUpdateModal
            isOpen={state.isBulkUpdateModalOpen}
            sections={filteredSections}
            selectedSectionsForBulk={state.selectedSectionsForBulk}
            onClose={() => {
              state.setIsBulkUpdateModalOpen(false);
              state.setSelectedSectionsForBulk([]);
            }}
            onToggleSection={modalActions.toggleSectionSelection}
            onSubmit={(updateData) => handlers.executeBulkUpdate(filteredSections, state.selectedSectionsForBulk, updateData)}
          />

          {/* Bulk Delete Modal */}
          <BulkDeleteModal
            isOpen={state.isBulkDeleteModalOpen}
            sections={filteredSections}
            selectedSectionsForBulk={state.selectedSectionsForBulk}
            onClose={() => {
              state.setIsBulkDeleteModalOpen(false);
              state.setSelectedSectionsForBulk([]);
            }}
            onToggleSection={modalActions.toggleSectionSelection}
            onConfirm={() => handlers.executeBulkDelete(state.selectedSectionsForBulk)}
          />
        </>
      )}

     
    </div>
  );
};

export default DailyMarksPage;
