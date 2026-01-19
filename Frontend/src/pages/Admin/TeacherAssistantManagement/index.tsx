import React, { memo } from "react";
import { HandHelping } from "lucide-react";
import { EmptyState } from "@/components/UI/EmptyState";

// Components
import { PageHeader, StatsCards, Toolbar } from "./components";
import { GridView, TableView } from "./Views";
import { AssistantForm } from "./Model";

// Hooks
import { useTeacherAssistantManagement } from "./hooks";

// Types
import type { TeacherAssistant } from "./types";

// ============================================================================
// Memoized Sub-Components
// ============================================================================

// Confirmation Modal Component
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

// Bulk Delete Confirmation Modal
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

// Main Component
const TeacherAssistantManagement: React.FC = () => {
  const {
    // Data
    assistants,
    stats,
    error,
    refetch,
    
    // Filter State
    searchQuery,
    setSearchQuery,
    genderFilter,
    setGenderFilter,
    groupsAssignmentFilter,
    setGroupsAssignmentFilter,
    ageRange,
    setAgeRange,
    sortField,
    sortOrder,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    activeFiltersCount,
    
    // Filter Handlers
    resetFilters,
    toggleFilters,
    handleSort,
    
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
    
    // Selection State
    selectedIds,
    bulkDeleteConfirmation,
    
    // Selection Handlers
    handleToggleSelection,
    handleToggleSelectAll,
    handleBulkDelete,
    handleConfirmBulkDelete,
    closeBulkDeleteConfirmation,
    
    // Export
    handleExport,
  } = useTeacherAssistantManagement();

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        onAddAssistant={handleAddAssistant}
        onExport={handleExport}
        selectedCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Toolbar */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        genderFilter={genderFilter}
        onGenderFilterChange={setGenderFilter}
        groupsAssignmentFilter={groupsAssignmentFilter}
        onGroupsAssignmentFilterChange={setGroupsAssignmentFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={assistants.length}
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        ageRange={ageRange}
        setAgeRange={setAgeRange}
        onResetFilters={resetFilters}
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
          onDelete={handleDeleteAssistant}
          selectedIds={selectedIds}
          onToggleSelection={handleToggleSelection}
        />
      ) : (
        <TableView
          assistants={assistants}
          onEdit={handleEditAssistant}
          onDelete={handleDeleteAssistant}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          selectedIds={selectedIds}
          onToggleSelection={handleToggleSelection}
          onToggleSelectAll={handleToggleSelectAll}
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
        count={selectedIds.size}
        onConfirm={handleConfirmBulkDelete}
        onCancel={closeBulkDeleteConfirmation}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TeacherAssistantManagement;
