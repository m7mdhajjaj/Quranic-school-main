import { lazy, Suspense, memo } from 'react';
import type { LoggedInUser, Section, Mark, Student } from '../types/types';

// Lazy load modals
const AddSectionModal = lazy(() =>
  import('../modals/AddSectionModal').then((m) => ({
    default: m.AddSectionModal,
  }))
);
const EditSectionModal = lazy(() =>
  import('../modals/EditSectionModal').then((m) => ({
    default: m.EditSectionModal,
  }))
);
const AddMarkModal = lazy(() =>
  import('../modals/AddMarkModal').then((m) => ({ default: m.AddMarkModal }))
);
const UpdateMarkModal = lazy(() =>
  import('../modals/UpdateMarkModal').then((m) => ({
    default: m.UpdateMarkModal,
  }))
);
const BulkUpdateModal = lazy(() =>
  import('../modals/BulkUpdateModal').then((m) => ({
    default: m.BulkUpdateModal,
  }))
);
const BulkDeleteModal = lazy(() =>
  import('../modals/BulkDeleteModal').then((m) => ({
    default: m.BulkDeleteModal,
  }))
);

interface ModalsContainerProps {
  currentUser: LoggedInUser | null;
  selectedStudentId: string | null;
  selectedGroup: string;
  sections: Section[];
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
    
    isBulkUpdateModalOpen: boolean;
    setIsBulkUpdateModalOpen: (open: boolean) => void;
    selectedSectionsForBulk: string[];
    setSelectedSectionsForBulk: (sections: string[]) => void;
    isBulkUpdating: boolean;
    setIsBulkUpdating: React.Dispatch<React.SetStateAction<boolean>>;
    
    isBulkDeleteModalOpen: boolean;
    setIsBulkDeleteModalOpen: (open: boolean) => void;
    isBulkDeleting: boolean;
    setIsBulkDeleting: React.Dispatch<React.SetStateAction<boolean>>;
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
  inputHandlers: {
    handleSectionInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleEditSectionInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleMarkInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  modalActions: {
    toggleSectionSelection: (sectionId: string) => void;
  };
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
  state,
  handlers,
  inputHandlers,
  modalActions,
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
  );
};

export const ModalsContainer = memo(ModalsContainerComponent);
