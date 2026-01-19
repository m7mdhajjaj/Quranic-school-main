import { useState, useCallback } from "react";
import { showSuccessToast } from "@/utils/toastUtils";
import { showErrorMessage } from "@/utils/sweetalertUtils";
import { MESSAGES } from "../constants";
import {
  useTeacherAssistantsData,
  useTeacherAssistantsActions,
  useTeacherAssistantsStats,
  useTeacherAssistantFilters,
  useTeacherAssistantSelection,
  useTeacherAssistantExport,
} from "./";
import type { TeacherAssistant, ViewMode } from "../types";
import type { TeacherAssistantFormData } from "./useTeacherAssistantForm";

export const useTeacherAssistantManagement = () => {
  // استخدام الـ hooks المنفصلة
  const filters = useTeacherAssistantFilters();
  const selection = useTeacherAssistantSelection();
  const { handleExport } = useTeacherAssistantExport();

  // State للـ view mode
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // State للنموذج
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<TeacherAssistant | null>(null);

  // State للحذف
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    assistant: TeacherAssistant | null;
  }>({ isOpen: false, assistant: null });
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);

  // Data Hooks
  const { assistants, error, refetch } = useTeacherAssistantsData(filters.filtersParams);
  const { createTeacherAssistant, updateTeacherAssistant, deleteTeacherAssistant, bulkDeleteTeacherAssistants, isSubmitting } = useTeacherAssistantsActions();
  const { refetch: refetchStats, ...stats } = useTeacherAssistantsStats();

  // Assistant Handlers
  const handleAddAssistant = useCallback(() => {
    setSelectedAssistant(null);
    setIsFormOpen(true);
  }, []);

  const handleEditAssistant = useCallback((assistant: TeacherAssistant) => {
    setSelectedAssistant(assistant);
    setIsFormOpen(true);
  }, []);

  const handleDeleteAssistant = useCallback((assistant: TeacherAssistant) => {
    setDeleteConfirmation({ isOpen: true, assistant });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmation.assistant) return;

    try {
      await deleteTeacherAssistant(deleteConfirmation.assistant._id);
      showSuccessToast(MESSAGES.SUCCESS.DELETE);
      setDeleteConfirmation({ isOpen: false, assistant: null });
      refetch();
      refetchStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.UNEXPECTED;
      showErrorMessage(MESSAGES.ERROR.DELETE, errorMessage);
    }
  }, [deleteConfirmation.assistant, deleteTeacherAssistant, refetch, refetchStats]);

  const closeDeleteConfirmation = useCallback(() => {
    setDeleteConfirmation({ isOpen: false, assistant: null });
  }, []);

  // Bulk Delete Handlers
  const handleBulkDelete = useCallback(() => {
    if (selection.selectedCount === 0) return;
    setBulkDeleteConfirmation(true);
  }, [selection.selectedCount]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selection.selectedCount === 0) return;

    try {
      const ids = Array.from(selection.selectedIds);
      await bulkDeleteTeacherAssistants(ids);
      showSuccessToast(MESSAGES.SUCCESS.BULK_DELETE(selection.selectedCount));
      selection.clearSelection();
      setBulkDeleteConfirmation(false);
      refetch();
      refetchStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.UNEXPECTED;
      showErrorMessage(MESSAGES.ERROR.BULK_DELETE, errorMessage);
    }
  }, [selection, bulkDeleteTeacherAssistants, refetch, refetchStats]);

  const closeBulkDeleteConfirmation = useCallback(() => {
    setBulkDeleteConfirmation(false);
  }, []);

  // Form Handlers
  const handleFormSubmit = useCallback(
    async (data: TeacherAssistantFormData) => {
      try {
        if (selectedAssistant) {
          await updateTeacherAssistant(selectedAssistant._id, data);
          showSuccessToast(MESSAGES.SUCCESS.UPDATE);
        } else {
          await createTeacherAssistant(data);
          showSuccessToast(MESSAGES.SUCCESS.CREATE);
        }
        setIsFormOpen(false);
        setSelectedAssistant(null);
        refetch();
        refetchStats();
      } catch (error) {
        console.error('❌ Error in handleFormSubmit:', error);
        const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.UNEXPECTED;
        showErrorMessage(
          selectedAssistant ? MESSAGES.ERROR.UPDATE : MESSAGES.ERROR.CREATE,
          errorMessage
        );
      }
    },
    [selectedAssistant, createTeacherAssistant, updateTeacherAssistant, refetch, refetchStats]
  );

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedAssistant(null);
  }, []);

  // Export Handler
  const handleExportClick = useCallback(() => {
    handleExport(assistants);
  }, [assistants, handleExport]);

  return {
    // Data
    assistants,
    stats,
    error,
    refetch,
    
    // Filter State & Actions (من useTeacherAssistantFilters)
    ...filters,
    
    // View State
    viewMode,
    setViewMode,
    
    // Form State
    isFormOpen,
    selectedAssistant,
    isSubmitting,
    
    // Form Handlers
    handleAddAssistant,
    handleEditAssistant,
    handleFormSubmit,
    closeForm,
    
    // Delete State
    deleteConfirmation,
    
    // Delete Handlers
    handleDeleteAssistant,
    handleConfirmDelete,
    closeDeleteConfirmation,
    
    // Selection State & Actions (من useTeacherAssistantSelection)
    ...selection,
    
    // Bulk Delete State
    bulkDeleteConfirmation,
    
    // Bulk Delete Handlers
    handleBulkDelete,
    handleConfirmBulkDelete,
    closeBulkDeleteConfirmation,
    
    // Export
    handleExport: handleExportClick,
  };
};
