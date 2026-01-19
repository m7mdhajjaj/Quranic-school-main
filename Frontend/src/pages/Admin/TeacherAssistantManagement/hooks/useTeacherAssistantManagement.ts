import { useState, useCallback, useMemo } from "react";
import { showSuccessToast } from "@/utils/toastUtils";
import { showErrorMessage } from "@/utils/sweetalertUtils";
import type { TeacherAssistantFiltersParams } from "@/Api/teacherAssistantApi";
import {
  useTeacherAssistantsData,
  useTeacherAssistantsActions,
  useTeacherAssistantsStats,
} from "./";
import type { TeacherAssistant, ViewMode, SortField, SortOrder, GenderFilter, GroupsAssignmentFilter } from "../types";
import type { TeacherAssistantFormData } from "./useTeacherAssistantForm";

export const useTeacherAssistantManagement = () => {
  // State للفلاتر
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [groupsAssignmentFilter, setGroupsAssignmentFilter] = useState<GroupsAssignmentFilter>("all");
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [sortField, setSortField] = useState<SortField>("assistantId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showFilters, setShowFilters] = useState(false);

  // State أخرى
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<TeacherAssistant | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    assistant: TeacherAssistant | null;
  }>({ isOpen: false, assistant: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (genderFilter !== "all") count++;
    if (groupsAssignmentFilter !== "all") count++;
    if (ageRange[0] !== 0 || ageRange[1] !== 100) count++;
    return count;
  }, [genderFilter, groupsAssignmentFilter, ageRange]);

  // بناء كائن الفلاتر للباك إند
  const filtersParams: TeacherAssistantFiltersParams = useMemo(() => ({
    search: searchQuery || undefined,
    gender: genderFilter !== "all" ? genderFilter : undefined,
    minAge: ageRange[0] > 0 ? ageRange[0] : undefined,
    maxAge: ageRange[1] < 100 ? ageRange[1] : undefined,
    hasGroups: groupsAssignmentFilter !== "all" ? groupsAssignmentFilter : undefined,
    sortBy: sortField,
    sortOrder: sortOrder,
  }), [searchQuery, genderFilter, groupsAssignmentFilter, ageRange, sortField, sortOrder]);

  // Hooks
  const { assistants, error, refetch } = useTeacherAssistantsData(filtersParams);
  const { createTeacherAssistant, updateTeacherAssistant, deleteTeacherAssistant, bulkDeleteTeacherAssistants, isSubmitting } = useTeacherAssistantsActions();
  const { refetch: refetchStats, ...stats } = useTeacherAssistantsStats();

  // Filter Handlers
  const resetFilters = useCallback(() => {
    setGenderFilter("all");
    setGroupsAssignmentFilter("all");
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
      showSuccessToast("تم حذف مساعد المدرس بنجاح");
      setDeleteConfirmation({ isOpen: false, assistant: null });
      refetch();
      refetchStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      showErrorMessage("فشل حذف مساعد المدرس", errorMessage);
    }
  }, [deleteConfirmation.assistant, deleteTeacherAssistant, refetch, refetchStats]);

  const closeDeleteConfirmation = useCallback(() => {
    setDeleteConfirmation({ isOpen: false, assistant: null });
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
    if (selectedIds.size === assistants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(assistants.map((a: TeacherAssistant) => a._id)));
    }
  }, [selectedIds.size, assistants]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    setBulkDeleteConfirmation(true);
  }, [selectedIds.size]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    try {
      const ids = Array.from(selectedIds);
      await bulkDeleteTeacherAssistants(ids);
      showSuccessToast(`تم حذف ${selectedIds.size} مساعد مدرس بنجاح`);
      setSelectedIds(new Set());
      setBulkDeleteConfirmation(false);
      refetch();
      refetchStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      showErrorMessage("فشل حذف مساعدي المدرسين", errorMessage);
    }
  }, [selectedIds, bulkDeleteTeacherAssistants, refetch, refetchStats]);

  const closeBulkDeleteConfirmation = useCallback(() => {
    setBulkDeleteConfirmation(false);
  }, []);

  // Form Handlers
  const handleFormSubmit = useCallback(
    async (data: TeacherAssistantFormData) => {
      try {
        if (selectedAssistant) {
          await updateTeacherAssistant(selectedAssistant._id, data);
          showSuccessToast("تم تحديث بيانات مساعد المدرس بنجاح");
        } else {
          await createTeacherAssistant(data);
          showSuccessToast("تم إضافة مساعد المدرس بنجاح");
        }
        setIsFormOpen(false);
        setSelectedAssistant(null);
        refetch();
        refetchStats();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
        showErrorMessage(
          selectedAssistant ? "فشل تحديث مساعد المدرس" : "فشل إضافة مساعد المدرس",
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
  const handleExport = useCallback(async () => {
    try {
      const { utils, writeFile } = await import("xlsx");
      
      const exportData = assistants.map((assistant: TeacherAssistant, index: number) => ({
        "م": index + 1,
        "الاسم الكامل": [assistant.firstName, assistant.fatherName, assistant.grandFatherName, assistant.lastName].filter(Boolean).join(" "),
        "رقم المساعد": assistant.assistantId || "-",
        "حالة الاتصال": assistant.lastSeen && new Date(assistant.lastSeen).getTime() > Date.now() - 5 * 60 * 1000 ? "متصل" : "غير متصل",
        "الجنس": assistant.gender === 'male' || assistant.gender === 'ذكر' ? 'ذكر' : 'أنثى',
        "العمر": assistant.age ? `${assistant.age} سنة` : "-",
        "رقم الهوية": assistant.idNumber || "-",
        "رقم الهاتف": assistant.phoneNumber || "-",
        "البريد الإلكتروني": assistant.email || "-",
        "مكان السكن": assistant.residence || "-",
        "الحلقات": assistant.allowedGroups?.map((g: { _id: string; name: string }) => g.name).join(" | ") || "-",
      }));

      const ws = utils.json_to_sheet(exportData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "مساعدي المدرسين");
      writeFile(wb, "teacher_assistants_export.xlsx");
      
      showSuccessToast("تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error("Export error:", error);
      showErrorMessage("فشل التصدير", "حدث خطأ أثناء تصدير البيانات");
    }
  }, [assistants]);

  return {
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
  };
};
