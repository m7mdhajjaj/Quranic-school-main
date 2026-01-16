import { useState, useCallback, useMemo } from "react";
import { showSuccessToast } from "@/utils/toastUtils";
import { showErrorMessage } from "@/utils/sweetalertUtils";
import type { SecretaryFiltersParams } from "@/Api/secretaryApi";
import {
  useSecretariesData,
  useSecretariesActions,
  useSecretariesStats,
} from "./index";
import type { Secretary, ViewMode, SortField, SortOrder, GenderFilter } from "../types";
import type { SecretaryFormData } from "./useSecretaryForm";

export const useSecretaryManagement = () => {
  // State للفلاتر
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [sortField, setSortField] = useState<SortField>("secretaryId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showFilters, setShowFilters] = useState(false);

  // State أخرى
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSecretary, setSelectedSecretary] = useState<Secretary | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    secretary: Secretary | null;
  }>({ isOpen: false, secretary: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (genderFilter !== "all") count++;
    if (ageRange[0] !== 0 || ageRange[1] !== 100) count++;
    return count;
  }, [genderFilter, ageRange]);

  // بناء كائن الفلاتر للباك إند
  const filtersParams: SecretaryFiltersParams = useMemo(() => ({
    search: searchQuery || undefined,
    gender: genderFilter !== "all" ? genderFilter : undefined,
    minAge: ageRange[0] > 0 ? ageRange[0] : undefined,
    maxAge: ageRange[1] < 100 ? ageRange[1] : undefined,
    sortBy: sortField,
    sortOrder: sortOrder,
  }), [searchQuery, genderFilter, ageRange, sortField, sortOrder]);

  // Hooks
  const { secretaries, error, refetch } = useSecretariesData(filtersParams);
  const { createSecretary, updateSecretary, deleteSecretary, bulkDeleteSecretaries, isSubmitting } = useSecretariesActions();
  const { refetch: refetchStats, ...stats } = useSecretariesStats();

  // Filter Handlers
  const resetFilters = useCallback(() => {
    setGenderFilter("all");
    setAgeRange([0, 100]);
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }, [sortField]);

  // Secretary Handlers
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

  const closeDeleteConfirmation = useCallback(() => {
    setDeleteConfirmation({ isOpen: false, secretary: null });
  }, []);

  // Selection Handlers
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

  const closeBulkDeleteConfirmation = useCallback(() => {
    setBulkDeleteConfirmation(false);
  }, []);

  // Form Handlers
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

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedSecretary(null);
  }, []);

  // Export Handler
  const handleExport = useCallback(async () => {
    try {
      const { utils, writeFile } = await import("xlsx");
      
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
        "تاريخ الاضافة": sec.createdAt ? new Date(sec.createdAt).toLocaleDateString('ar-EG', { timeZone: 'Asia/Jerusalem' }) : "-",
      }));

      const workbook = utils.book_new();
      const worksheet = utils.json_to_sheet(exportData);

      const wscols = [
        { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 8 },
        { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 20 },
        { wch: 20 }, { wch: 15 },
      ];
      worksheet["!cols"] = wscols;

      if (!worksheet["!views"]) worksheet["!views"] = [];
      worksheet["!views"][0] = { rightToLeft: true };

      utils.book_append_sheet(workbook, worksheet, "السكرتيرين");
      writeFile(workbook, `Secretaries_List_${new Date().toLocaleDateString("en-GB", { timeZone: 'Asia/Jerusalem' }).replace(/\//g, "-")}.xlsx`);
      
      showSuccessToast("تم تصدير ملف Excel بنجاح ✅");
    } catch (error) {
      console.error("Export Error:", error);
      showErrorMessage("فشل التصدير", "حدث خطأ أثناء محاولة تصدير البيانات");
    }
  }, [secretaries]);

  return {
    // Data
    secretaries,
    stats,
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
  };
};
