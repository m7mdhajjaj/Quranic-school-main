import React, { memo, useState, useCallback } from "react";
import { HandHelping } from "lucide-react";
import { EmptyState } from "@/components/UI/EmptyState";

// Context Hooks
import {
  useTeacherAssistantContext,
  useFiltersContext,
  useSelectionContext,
  useExportContext,
} from "./context";

// Components
import { PageHeader, StatsCards, Toolbar } from "./components";
import { GridView, TableView } from "./Views";
import { AssistantForm } from "./Model";

// Types
import type { TeacherAssistant, ViewMode } from "./types";
import type { TeacherAssistantFormData } from "./hooks/useTeacherAssistantForm";
import { showSuccessToast } from "@/utils/toastUtils";
import { showErrorMessage } from "@/utils/sweetalertUtils";
import { MESSAGES } from "./constants";

// ============================================================================
// Confirmation Modals
// ============================================================================

const ConfirmDeleteModal = memo<{
  isOpen: boolean;
  assistant: TeacherAssistant | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}>(({ isOpen, assistant, onConfirm, onCancel, isLoading }) => {
  if (!isOpen || !assistant) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <HandHelping className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              تأكيد حذف مساعد المدرس
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف مساعد المدرس{" "}
              <span className="font-semibold">
                {assistant.firstName} {assistant.lastName}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onCancel}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  "نعم، احذف"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ConfirmDeleteModal.displayName = "ConfirmDeleteModal";

const BulkDeleteConfirmModal = memo<{
  isOpen: boolean;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}>(({ isOpen, count, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <HandHelping className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              تأكيد حذف {count} مساعد مدرس
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف {count} مساعد مدرس؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onCancel}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  "نعم، احذف الكل"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BulkDeleteConfirmModal.displayName = "BulkDeleteConfirmModal";

// ============================================================================
// Main Content Component
// ============================================================================

export const TeacherAssistantManagementContent: React.FC = () => {
  // Context Hooks (كل واحد يجيب بس اللي يحتاجه)
  const {
    assistants,
    stats,
    error,
    isLoading,
    refetch,
    refetchStats,
    isSubmitting,
    createTeacherAssistant,
    updateTeacherAssistant,
    deleteTeacherAssistant,
    bulkDeleteTeacherAssistants,
  } = useTeacherAssistantContext();

  const filters = useFiltersContext();
  const selection = useSelectionContext();
  const { handleExport } = useExportContext();

  // Local State (بس للـ modals والـ form)
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<TeacherAssistant | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    assistant: TeacherAssistant | null;
  }>({ isOpen: false, assistant: null });
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);

  // Form Handlers
  const handleAddAssistant = useCallback(() => {
    setSelectedAssistant(null);
    setIsFormOpen(true);
  }, []);

  const handleEditAssistant = useCallback((assistant: TeacherAssistant) => {
    setSelectedAssistant(assistant);
    setIsFormOpen(true);
  }, []);

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

  // Delete Handlers
  const handleDeleteClick = useCallback((assistant: TeacherAssistant) => {
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

  // Error State
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HandHelping className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            حدث خطأ في تحميل البيانات
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 p-6 space-y-6">
      <div className="max-w-[98%] mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        onAddAssistant={handleAddAssistant}
        onExport={() => handleExport(assistants)}
        selectedCount={selection.selectedCount}
        onBulkDelete={handleBulkDelete}
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Toolbar */}
      <Toolbar
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
        genderFilter={filters.genderFilter}
        onGenderFilterChange={filters.setGenderFilter}
        groupsAssignmentFilter={filters.groupsAssignmentFilter}
        onGroupsAssignmentFilterChange={filters.setGroupsAssignmentFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={assistants.length}
        showFilters={filters.showFilters}
        onToggleFilters={filters.toggleFilters}
        setShowFilters={filters.setShowFilters}
        activeFiltersCount={filters.activeFiltersCount}
        ageRange={filters.ageRange}
        setAgeRange={filters.setAgeRange}
        onResetFilters={filters.resetFilters}
      />

      {/* Content */}
      {assistants.length === 0 ? (
        <EmptyState
          icon={<HandHelping className="w-12 h-12 text-gray-400" />}
          title="لا يوجد مساعدي مدرسين"
          description="ابدأ بإضافة مساعد مدرس جديد للنظام"
          action={{
            label: "إضافة مساعد مدرس",
            onClick: handleAddAssistant,
          }}
        />
      ) : viewMode === "grid" ? (
        <GridView
          assistants={assistants}
          onEdit={handleEditAssistant}
          onDelete={handleDeleteClick}
          selectedIds={selection.selectedIds}
          onToggleSelection={selection.handleToggleSelection}
        />
      ) : (
        <TableView
          assistants={assistants}
          onEdit={handleEditAssistant}
          onDelete={handleDeleteClick}
          sortField={filters.sortField}
          sortOrder={filters.sortOrder}
          onSort={filters.handleSort}
          selectedIds={selection.selectedIds}
          onToggleSelection={selection.handleToggleSelection}
          onToggleSelectAll={() => selection.handleToggleSelectAll(assistants.map(a => a._id))}
        />
      )}

      {/* Assistant Form Modal */}
      <AssistantForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        assistant={selectedAssistant}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmation.isOpen}
        assistant={deleteConfirmation.assistant}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteConfirmation}
        isLoading={isSubmitting}
      />

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteConfirmModal
        isOpen={bulkDeleteConfirmation}
        count={selection.selectedCount}
        onConfirm={handleConfirmBulkDelete}
        onCancel={closeBulkDeleteConfirmation}
        isLoading={isSubmitting}
      />
      </div>
    </div>
  );
};
