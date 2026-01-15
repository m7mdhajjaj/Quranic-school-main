import React, { useState, useCallback } from "react";
import { Shield } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";

// Components
import {
  SecretariesHeader,
  SecretariesStatsCards,
  SecretariesToolbar,
} from "./components";
import { SecretaryGridView, SecretaryTableView } from "./Views";
import { SecretaryForm, type SecretaryFormData } from "./Model";

// Hooks
import {
  useSecretariesData,
  useSecretariesActions,
  useSecretariesStats,
  useSecretariesFilters,
} from "./hooks";

// Types
import type { Secretary, ViewMode } from "./types";

// Confirmation Modal Component
const ConfirmDeleteModal: React.FC<{
  isOpen: boolean;
  secretary: Secretary | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ isOpen, secretary, onConfirm, onCancel, isLoading }) => {
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
};

// Skeleton Loader
const SecretariesSkeleton: React.FC<{ viewMode: ViewMode }> = ({ viewMode }) => {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="h-24 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Component
const SecretaryManagement: React.FC = () => {
  // State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSecretary, setSelectedSecretary] = useState<Secretary | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    secretary: Secretary | null;
  }>({ isOpen: false, secretary: null });

  // Hooks
  const { secretaries, isLoading, error, refetch } = useSecretariesData();
  const { createSecretary, updateSecretary, deleteSecretary, isSubmitting } = useSecretariesActions();
  const { refetch: refetchStats, ...stats } = useSecretariesStats(); // إحصائيات من الباك إند مباشرة
  const {
    searchQuery,
    setSearchQuery,
    genderFilter,
    setGenderFilter,
    sortField,
    sortOrder,
    viewMode,
    setViewMode,
    handleSort,
    filteredSecretaries,
    showFilters,
    setShowFilters,
    toggleFilters,
    ageRange,
    setAgeRange,
    activeFiltersCount,
    resetFilters,
  } = useSecretariesFilters(secretaries);

  // Handlers
  const handleAddSecretary = useCallback(() => {
    setSelectedSecretary(null);
    setIsFormOpen(true);
  }, []);

  const handleEditSecretary = useCallback((secretary: Secretary) => {
    setSelectedSecretary(secretary);
    setIsFormOpen(true);
  }, []);

  const handleDeleteSecretary = useCallback((secretary: Secretary) => {
    setDeleteConfirmation({ isOpen: true, secretary });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmation.secretary) return;

    try {
      await deleteSecretary(deleteConfirmation.secretary._id);
      showSuccessToast("تم حذف السكرتير بنجاح");
      setDeleteConfirmation({ isOpen: false, secretary: null });
      refetch();
      refetchStats(); // تحديث الإحصائيات
    } catch {
      showErrorToast("حدث خطأ أثناء حذف السكرتير");
    }
  }, [deleteConfirmation.secretary, deleteSecretary, refetch, refetchStats]);

  const handleFormSubmit = useCallback(
    async (data: SecretaryFormData) => {
      try {
        if (selectedSecretary) {
          await updateSecretary(selectedSecretary._id, data);
          showSuccessToast("تم تحديث بيانات السكرتير بنجاح");
        } else {
          await createSecretary(data);
          showSuccessToast("تم إضافة السكرتير بنجاح");
        }
        setIsFormOpen(false);
        setSelectedSecretary(null);
        refetch();
        refetchStats(); // تحديث الإحصائيات
      } catch {
        showErrorToast(
          selectedSecretary
            ? "حدث خطأ أثناء تحديث السكرتير"
            : "حدث خطأ أثناء إضافة السكرتير"
        );
      }
    },
    [selectedSecretary, createSecretary, updateSecretary, refetch, refetchStats]
  );

  const handleExport = useCallback(() => {
    // TODO: Implement export functionality
    showSuccessToast("جاري تصدير البيانات...");
  }, []);

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
        totalCount={filteredSecretaries.length}
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        ageRange={ageRange}
        setAgeRange={setAgeRange}
        onResetFilters={resetFilters}
      />

      {/* Content */}
      {isLoading ? (
        <SecretariesSkeleton viewMode={viewMode} />
      ) : filteredSecretaries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            لا يوجد سكرتيرين
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || genderFilter !== "all"
              ? "لم يتم العثور على نتائج تطابق البحث"
              : "ابدأ بإضافة سكرتير جديد"}
          </p>
          {!searchQuery && genderFilter === "all" && (
            <button
              onClick={handleAddSecretary}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              إضافة سكرتير
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <SecretaryGridView
          secretaries={filteredSecretaries}
          onEdit={handleEditSecretary}
          onDelete={handleDeleteSecretary}
        />
      ) : (
        <SecretaryTableView
          secretaries={filteredSecretaries}
          onEdit={handleEditSecretary}
          onDelete={handleDeleteSecretary}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {/* Secretary Form Modal */}
      <SecretaryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedSecretary(null);
        }}
        onSubmit={handleFormSubmit}
        secretary={selectedSecretary}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmation.isOpen}
        secretary={deleteConfirmation.secretary}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, secretary: null })}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default SecretaryManagement;
