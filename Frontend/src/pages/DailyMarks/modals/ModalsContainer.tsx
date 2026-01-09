import { lazy, Suspense, memo } from 'react';
import type { LoggedInUser, Section, Mark, Student } from '../types/types';

// Lazy load modals
const AddSectionModal = lazy(() =>
  import('./AddSectionModal').then((m) => ({
    default: m.AddSectionModal,
  }))
);
const EditSectionModal = lazy(() =>
  import('./EditSectionModal').then((m) => ({
    default: m.EditSectionModal,
  }))
);
const AddMarkModal = lazy(() =>
  import('./AddMarkModal').then((m) => ({ default: m.AddMarkModal }))
);
const UpdateMarkModal = lazy(() =>
  import('./UpdateMarkModal').then((m) => ({
    default: m.UpdateMarkModal,
  }))
);
const BulkDeleteModal = lazy(() =>
  import('./BulkDeleteModal').then((m) => ({
    default: m.BulkDeleteModal,
  }))
);
const BulkMarksModal = lazy(() =>
  import('./BulkMarksModal').then((m) => ({
    default: m.BulkMarksModal,
  }))
);

interface ModalsContainerProps {
  currentUser: LoggedInUser | null;
  selectedStudentId: string | null;
  selectedGroup: string;
  sections: Section[];
  refetchMarks?: () => void;
  onMarkChange?: () => void;
  state: {
    isAddSectionModalOpen: boolean;
    setIsAddSectionModalOpen: (open: boolean) => void;
    newSection: Omit<Section, "_id">;
    setNewSection: React.Dispatch<React.SetStateAction<Omit<Section, "_id">>>;
    isAddingSectionLoading: boolean;
    setIsAddingSectionLoading: React.Dispatch<React.SetStateAction<boolean>>;
    
    isEditSectionModalOpen: boolean;
    setIsEditSectionModalOpen: (open: boolean) => void;
    editingSection: Section | null;
    setEditingSection: (section: Section | null) => void;
    isEditingSectionLoading: boolean;
    setIsEditingSectionLoading: React.Dispatch<React.SetStateAction<boolean>>;
    
    isAddMarkModalOpen: boolean;
    setIsAddMarkModalOpen: (open: boolean) => void;
    selectedSection: Section | null;
    newMark: { reviewMark: number; memorizationMark: number };
    isAddingMarkLoading: boolean;
    setIsAddingMarkLoading: React.Dispatch<React.SetStateAction<boolean>>;
    
    isUpdateMarkModalOpen: boolean;
    setIsUpdateMarkModalOpen: (open: boolean) => void;
    editingMark: Mark | null;
    setEditingMark: (mark: Mark | null) => void;
    isUpdatingMarkLoading: boolean;
    setIsUpdatingMarkLoading: React.Dispatch<React.SetStateAction<boolean>>;
    selectedStudent: Student | null;
    setSelectedStudent: (student: Student | null) => void;
    
    selectedSectionsForBulk: string[];
    setSelectedSectionsForBulk: (sections: string[]) => void;
    
    isBulkDeleteModalOpen: boolean;
    setIsBulkDeleteModalOpen: (open: boolean) => void;
    isBulkDeleting: boolean;
    setIsBulkDeleting: React.Dispatch<React.SetStateAction<boolean>>;
    
    isBulkMarksModalOpen: boolean;
    setIsBulkMarksModalOpen: (open: boolean) => void;
    bulkMarksSection: Section | null;
    setBulkMarksSection: (section: Section | null) => void;
  };
  handlers: {
    handleAddSection: (
      e: React.FormEvent,
      newSection: Omit<Section, "_id">,
      setNewSection: React.Dispatch<React.SetStateAction<Omit<Section, "_id">>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => void;
    handleEditSection: (
      e: React.FormEvent,
      editingSection: Section | null,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => void;
    handleAddMark: (
      e: React.FormEvent,
      studentId: string | null,
      section: Section | null,
      mark: { reviewMark: number; memorizationMark: number },
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => void;
    handleUpdateMark: (
      e: React.FormEvent,
      editingMark: Mark | null,
      studentId: string | null,
      section: Section | null,
      mark: { reviewMark: number; memorizationMark: number },
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => void;
    executeBulkUpdate: (
      sections: Section[],
      selectedIds: string[],
      updateData: { reviewSection?: string; memorizationSection?: string },
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => void;
    executeBulkDelete: (
      selectedIds: string[],
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => void;
  };
  // Form input handlers
  handleSectionInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleEditSectionInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleMarkInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Modal actions
  toggleSectionSelection: (sectionId: string) => void;
  openAddMarkModal: (section: Section, student?: Student) => void;
  openUpdateMarkModal: (mark: Mark, section: Section, student?: Student) => void;
  openEditSectionModal: (section: Section) => void;
  // Computed values
  getSelectedStudent: () => Student | null;
}

/**
 * Container component for all Daily Marks modals
 * Only renders for teachers/admins
 */
const ModalsContainerComponent = ({
  currentUser,
  selectedStudentId,
  selectedGroup,
  sections,
  refetchMarks,
  onMarkChange,
  state,
  handlers,
  handleSectionInputChange,
  handleEditSectionInputChange,
  handleMarkInputChange,
  toggleSectionSelection,
  openAddMarkModal,
  openUpdateMarkModal,
  openEditSectionModal,
  getSelectedStudent,
}: ModalsContainerProps) => {
  // Don't render modals for students
  if (currentUser?.role === 'student') {
    return null;
  }

  return (
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
        onSubmit={(e) =>
          handlers.handleEditSection(
            e,
            state.editingSection,
            state.setIsEditingSectionLoading
          )
        }
        onChange={handleEditSectionInputChange}
      />

      {/* Add Mark Modal */}
      <AddMarkModal
        isOpen={state.isAddMarkModalOpen}
        selectedSection={state.selectedSection}
        selectedStudent={state.selectedStudent || getSelectedStudent()}
        newMark={state.newMark}
        isLoading={state.isAddingMarkLoading}
        onClose={() => {
          state.setIsAddMarkModalOpen(false);
          state.setSelectedStudent(null);
        }}
        onSubmit={async (e) => {
          await handlers.handleAddMark(
            e,
            state.selectedStudent?._id || selectedStudentId,
            state.selectedSection,
            state.newMark,
            state.setIsAddingMarkLoading
          );
          // Avoid double refetch: prefer onMarkChange, fallback to refetchMarks
          if (onMarkChange) onMarkChange();
          else refetchMarks?.();
        }}
        onChange={handleMarkInputChange}
      />

      {/* Update Mark Modal */}
      <UpdateMarkModal
        isOpen={state.isUpdateMarkModalOpen}
        selectedSection={state.selectedSection}
        selectedStudent={state.selectedStudent || getSelectedStudent()}
        editingMark={state.editingMark}
        newMark={state.newMark}
        isLoading={state.isUpdatingMarkLoading}
        onClose={() => {
          state.setIsUpdateMarkModalOpen(false);
          state.setEditingMark(null);
          state.setSelectedStudent(null);
        }}
        onSubmit={async (e) => {
          await handlers.handleUpdateMark(
            e,
            state.editingMark,
            state.selectedStudent?._id || selectedStudentId,
            state.selectedSection,
            state.newMark,
            state.setIsUpdatingMarkLoading
          );
          // Avoid double refetch: prefer onMarkChange, fallback to refetchMarks
          if (onMarkChange) onMarkChange();
          else refetchMarks?.();
        }}
        onChange={handleMarkInputChange}
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
        onToggleSection={toggleSectionSelection}
        onConfirm={() =>
          handlers.executeBulkDelete(
            state.selectedSectionsForBulk,
            state.setIsBulkDeleting
          )
        }
      />

      {/* Bulk Marks Modal */}
      <BulkMarksModal
        isOpen={state.isBulkMarksModalOpen}
        section={state.bulkMarksSection}
        group={selectedGroup}
        onClose={() => {
          state.setIsBulkMarksModalOpen(false);
          state.setBulkMarksSection(null);
        }}
        onSuccess={() => {
          // Refetch marks after successful bulk update
          refetchMarks?.();
        }}
      />
    </Suspense>
  );
};

export const ModalsContainer = memo(ModalsContainerComponent);
