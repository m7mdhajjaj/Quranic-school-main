import React, { useState, useCallback, memo, useMemo } from "react";
import { Shield } from "lucide-react";
import { showSuccessToast } from "@/utils/toastUtils";
import { showErrorMessage } from "@/utils/sweetalertUtils";
import { EmptyState } from "@/components/UI/EmptyState";
import type { SecretaryFiltersParams } from "@/Api/secretaryApi";

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
} from "./hooks";

// Types
import type { Secretary, ViewMode, SortField, SortOrder, GenderFilter } from "./types";

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

// Skeleton Loader
const SecretariesSkeleton = memo<{ viewMode: ViewMode }>(({ viewMode }) => {
  // استخدام useMemo لتجنب إعادة إنشاء المصفوفة
  const skeletonItems = useMemo(() => [...Array(viewMode === "grid" ? 6 : 5)], [viewMode]);

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonItems.map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
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
        {skeletonItems.map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
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
});

SecretariesSkeleton.displayName = "SecretariesSkeleton";

// Main Component
const SecretaryManagement: React.FC = () => {
  // State للفلاتر - كلها تذهب للباك إند
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [sortField, setSortField] = useState<SortField>("secretaryId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showFilters, setShowFilters] = useState(false);

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (genderFilter !== "all") count++;
    if (ageRange[0] !== 0 || ageRange[1] !== 100) count++;
    return count;
  }, [genderFilter, ageRange]);

  // إعادة تعيين الفلاتر
  const resetFilters = useCallback(() => {
    setGenderFilter("all");
    setAgeRange([0, 100]);
  }, []);

  // تبديل عرض الفلاتر
  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  // معالجة الترتيب
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }, [sortField]);

  // بناء كائن الفلاتر للباك إند
  const filtersParams: SecretaryFiltersParams = useMemo(() => ({
    search: searchQuery || undefined,
    gender: genderFilter !== "all" ? genderFilter : undefined,
    minAge: ageRange[0] > 0 ? ageRange[0] : undefined,
    maxAge: ageRange[1] < 100 ? ageRange[1] : undefined,
    sortBy: sortField,
    sortOrder: sortOrder,
  }), [searchQuery, genderFilter, ageRange, sortField, sortOrder]);

  // State أخرى
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSecretary, setSelectedSecretary] = useState<Secretary | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    secretary: Secretary | null;
  }>({ isOpen: false, secretary: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);

  // Hooks - البيانات من الباك إند مع الفلاتر
  const { secretaries, isLoading, error, refetch } = useSecretariesData(filtersParams);
  const { createSecretary, updateSecretary, deleteSecretary, bulkDeleteSecretaries, isSubmitting } = useSecretariesActions();
  const { refetch: refetchStats, ...stats } = useSecretariesStats();

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
      refetchStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      showErrorMessage("فشل حذف السكرتير", errorMessage);
    }
  }, [deleteConfirmation.secretary, deleteSecretary, refetch, refetchStats]);

  // Bulk Delete Handlers
  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedIds.size === secretaries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(secretaries.map(s => s._id)));
    }
  }, [selectedIds.size, secretaries]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    setBulkDeleteConfirmation(true);
  }, [selectedIds.size]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    try {
      const ids = Array.from(selectedIds);
      await bulkDeleteSecretaries(ids);
      showSuccessToast(`تم حذف ${selectedIds.size} سكرتير بنجاح`);
      setSelectedIds(new Set());
      setBulkDeleteConfirmation(false);
      refetch();
      refetchStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      showErrorMessage("فشل حذف السكرتيرين", errorMessage);
    }
  }, [selectedIds, bulkDeleteSecretaries, refetch, refetchStats]);

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
        refetchStats();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
        showErrorMessage(
          selectedSecretary ? "فشل تحديث السكرتير" : "فشل إضافة السكرتير",
          errorMessage
        );
      }
    },
    [selectedSecretary, createSecretary, updateSecretary, refetch, refetchStats]
  );

  const handleExport = useCallback(async () => {
    try {
      const { utils, writeFile } = await import("xlsx");
      
      // 1. Data Processing
      const exportData = secretaries.map((sec, index) => ({
        "م": index + 1,
        "الاسم الكامل": [sec.firstName, sec.fatherName, sec.grandFatherName, sec.lastName].filter(Boolean).join(" "),
        "رقم السكرتير": sec.secretaryId || "-",
        "حالة الاتصال": sec.lastSeen && new Date(sec.lastSeen).getTime() > Date.now() - 5 * 60 * 1000 ? "متصل" : "غير متصل",
        "الجنس": sec.gender === 'male' || sec.gender === 'ذكر' ? 'ذكر' : 'أنثى',
        "العمر": sec.age ? `${sec.age} سنة` : "-",
        "رقم الهوية": sec.idNumber || "-",
        "رقم الهاتف": sec.phoneNumber || "-",
        "البريد الإلكتروني": sec.email || "-",
        "السكن": sec.residence || "-",
        "اسم الأم": sec.motherName || "-",
        "تاريخ الاضافة": sec.createdAt ? new Date(sec.createdAt).toLocaleDateString('ar-EG') : "-",
      }));

      // 2. Create Workbook and Worksheet
      const workbook = utils.book_new();
      const worksheet = utils.json_to_sheet(exportData);

      // 3. Styling Configuration (Widths)
      const wscols = [
        { wch: 5 },  // #
        { wch: 30 }, // Full Name
        { wch: 15 }, // ID
        { wch: 12 }, // Status
        { wch: 8 },  // Gender
        { wch: 8 },  // Age
        { wch: 15 }, // National ID
        { wch: 15 }, // Phone
        { wch: 25 }, // Email
        { wch: 20 }, // Residence
        { wch: 20 }, // Mother Name
        { wch: 15 }, // Created Date
      ];
      worksheet["!cols"] = wscols;

      // 4. Force RTL Direction
      if (!worksheet["!views"]) worksheet["!views"] = [];
      worksheet["!views"][0] = { rightToLeft: true };

      // 5. Save File
      utils.book_append_sheet(workbook, worksheet, "السكرتيرين");
      writeFile(workbook, `Secretaries_List_${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}.xlsx`);
      
      showSuccessToast("تم تصدير ملف Excel بنجاح ✅");
    } catch (error) {
      console.error("Export Error:", error);
      showErrorMessage("فشل التصدير", "حدث خطأ أثناء محاولة تصدير البيانات");
    }
  }, [secretaries]);

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
        isSearching={isLoading && searchQuery.length > 0}
      />

      {/* Content */}
      {isLoading ? (
        <SecretariesSkeleton viewMode={viewMode} />
      ) : secretaries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <EmptyState
            icon={<Shield className="w-12 h-12 text-gray-400" />}
            title="لا يوجد سكرتيرين"
            description={
              searchQuery || genderFilter !== "all"
                ? "لم يتم العثور على نتائج تطابق البحث"
                : "ابدأ بإضافة سكرتير جديد"
            }
            action={
              !searchQuery && genderFilter === "all"
                ? {
                    label: "إضافة سكرتير",
                    onClick: handleAddSecretary,
                  }
                : undefined
            }
          />
        </div>
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

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteConfirmModal
        isOpen={bulkDeleteConfirmation}
        count={selectedIds.size}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteConfirmation(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default SecretaryManagement;
