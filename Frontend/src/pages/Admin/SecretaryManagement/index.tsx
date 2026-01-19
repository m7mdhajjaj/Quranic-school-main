import React, { memo } from "react";
import { Shield } from "lucide-react";
import { EmptyState } from "@/components/UI/EmptyState";
import { MotionPageSkeleton } from "@/components/skeletons/MotionSkeleton";

// Components
import {
  SecretariesHeader,
  SecretariesStatsCards,
  SecretariesToolbar,
} from "./components";
import { SecretaryGridView, SecretaryTableView } from "./Views";
import { SecretaryForm } from "./Model";

// Hooks
import { useSecretaryManagement } from "./hooks";

// Types
import type { Secretary } from "./types";

// ============================================================================
// Memoized Sub-Components لتحسين الأداء
// ============================================================================

// Confirmation Modal Component
const ConfirmDeleteModal = memo<{
  isOpen: boolean;
  secretary: Secretary | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}>(({ isOpen, secretary, onConfirm, onCancel, isLoading }) => {
  if (!isOpen || !secretary) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              تأكيد حذف السكرتير
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف السكرتير{" "}
              <span className="font-semibold">
                {secretary.firstName} {secretary.lastName}
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
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              تأكيد حذف {count} سكرتير
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف {count} سكرتير؟ لا يمكن التراجع عن هذا الإجراء.
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
const SecretaryManagement: React.FC = () => {
  const {
    // Data
    secretaries,
    stats,
    isLoading,
    error,
    refetch,
    
    // Filter State
    searchQuery,
    setSearchQuery,
    genderFilter,
    setGenderFilter,
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
    selectedSecretary,
    isSubmitting,
    
    // Form Handlers
    handleAddSecretary,
    handleEditSecretary,
    handleFormSubmit,
    closeForm,
    
    // Delete State
    deleteConfirmation,
    
    // Delete Handlers
    handleDeleteSecretary,
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
  } = useSecretaryManagement();

  // Loading State
  if (isLoading) {
    return (
      <MotionPageSkeleton
        showStats={true}
        showToolbar={true}
        showTable={true}
        statsCount={4}
        rowsCount={8}
      />
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            حدث خطأ في تحميل البيانات
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
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
      <SecretariesHeader
        onAddSecretary={handleAddSecretary}
        onExport={handleExport}
        selectedCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
      />

      {/* Stats Cards */}
      <SecretariesStatsCards stats={stats} />

      {/* Toolbar */}
      <SecretariesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        genderFilter={genderFilter}
        onGenderFilterChange={setGenderFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={secretaries.length}
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        ageRange={ageRange}
        setAgeRange={setAgeRange}
        onResetFilters={resetFilters}
      />

      {/* Content */}
      {secretaries.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-12 h-12 text-gray-400" />}
          title="لا يوجد سكرتيرين"
          description="ابدأ بإضافة سكرتير جديد للنظام"
          action={{
            label: "إضافة سكرتير",
            onClick: handleAddSecretary,
          }}
        />
      ) : viewMode === "grid" ? (
        <SecretaryGridView
          secretaries={secretaries}
          onEdit={handleEditSecretary}
          onDelete={handleDeleteSecretary}
          selectedIds={selectedIds}
          onToggleSelection={handleToggleSelection}
        />
      ) : (
        <SecretaryTableView
          secretaries={secretaries}
          onEdit={handleEditSecretary}
          onDelete={handleDeleteSecretary}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          selectedIds={selectedIds}
          onToggleSelection={handleToggleSelection}
          onToggleSelectAll={handleToggleSelectAll}
        />
      )}

      {/* Secretary Form Modal */}
      <SecretaryForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        secretary={selectedSecretary}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmation.isOpen}
        secretary={deleteConfirmation.secretary}
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

export default SecretaryManagement;
