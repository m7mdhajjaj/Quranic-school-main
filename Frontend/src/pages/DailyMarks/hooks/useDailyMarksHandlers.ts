import { createSection, updateSection, deleteSection } from "@/Api/sectionApi";
import { createMark, deleteMark } from "@/Api/dailyMarksApi";
import {
  showCenteredSwal,
  showWarningMessage,
} from "@/utils/sweetalertUtils";
import {
  showSuccessToast,
  showErrorToast,
} from "@/utils/toastUtils";
import type { Section, Mark } from "../types/types";

interface UseHandlersProps {
  selectedGroup: string;
  currentUser: { firstName: string; lastName?: string; role: string; _id: string; fatherName?: string; group?: string } | null;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setMarks: React.Dispatch<React.SetStateAction<Mark[]>>;
  setIsAddSectionModalOpen: (value: boolean) => void;
  setIsEditSectionModalOpen: (value: boolean) => void;
  setEditingSection: (section: Section | null) => void;
  setIsAddMarkModalOpen: (value: boolean) => void;
  setIsUpdateMarkModalOpen: (value: boolean) => void;
  setEditingMark: (mark: Mark | null) => void;
  setIsBulkDeleteModalOpen: (value: boolean) => void;
  setSelectedSectionsForBulk: React.Dispatch<React.SetStateAction<string[]>>;
  refetchMarks?: () => Promise<void>;
  refetchSections?: () => Promise<void>;
}

interface UseDailyMarksHandlersReturn {
  handleAddSection: (
    e: React.FormEvent,
    newSection: Omit<Section, "_id">,
    setNewSection: (section: Omit<Section, "_id">) => void,
    setIsAddingSectionLoading: (loading: boolean) => void
  ) => Promise<void>;
  handleEditSection: (
    e: React.FormEvent,
    editingSection: Section | null,
    setIsEditingSectionLoading?: (loading: boolean) => void
  ) => Promise<void>;
  handleDeleteSection: (sectionId: string) => Promise<void>;
  handleAddMark: (
    e: React.FormEvent,
    selectedStudentId: string | null,
    selectedSection: Section | null,
    newMark: { reviewMark: number; memorizationMark: number },
    setIsAddingMarkLoading?: (loading: boolean) => void
  ) => Promise<void>;
  handleUpdateMark: (
    e: React.FormEvent,
    editingMark: Mark | null,
    selectedStudentId: string | null,
    selectedSection: Section | null,
    newMark: { reviewMark: number; memorizationMark: number },
    setIsUpdatingMarkLoading?: (loading: boolean) => void
  ) => Promise<void>;
  handleDeleteMark: (markId: string) => Promise<void>;
  executeBulkUpdate: (
    sections: Section[],
    selectedSectionsForBulk: string[],
    updateData: { reviewSection?: string; memorizationSection?: string },
    setIsBulkUpdating?: (loading: boolean) => void
  ) => Promise<void>;
  executeBulkDelete: (
    selectedSectionsForBulk: string[],
    setIsBulkDeleting?: (loading: boolean) => void
  ) => Promise<void>;
}

/**
 * Custom hook for Daily Marks business logic handlers
 * 
 * @description
 * - Handles all CRUD operations for sections and marks
 * - Manages bulk operations (update, delete)
 * - Shows appropriate feedback (toasts, alerts)
 * - Integrates with API and updates local state
 * 
 * @param {UseHandlersProps} props - Dependencies and state setters
 * 
 * @returns {UseDailyMarksHandlersReturn} All handler functions
 */
export const useDailyMarksHandlers = ({
  selectedGroup,
  currentUser,
  setSections,
  setMarks,
  setIsAddSectionModalOpen,
  setIsEditSectionModalOpen,
  setEditingSection,
  setIsAddMarkModalOpen,
  setIsUpdateMarkModalOpen,
  setEditingMark,
  setIsBulkDeleteModalOpen,
  setSelectedSectionsForBulk,
  refetchMarks,
  refetchSections,
}: UseHandlersProps): UseDailyMarksHandlersReturn => {
  
  // Handler: Add Section
  const handleAddSection = async (
    e: React.FormEvent,
    newSection: Omit<Section, "_id">,
    setNewSection: (section: Omit<Section, "_id">) => void,
    setIsAddingSectionLoading: (loading: boolean) => void
  ) => {
    e.preventDefault();

    if (!selectedGroup) {
      showWarningMessage("الرجاء اختيار حلقة أولاً", "تنبيه");
      return;
    }

    if (!newSection.reviewSection || !newSection.memorizationSection) {
      showWarningMessage("الرجاء ملء جميع الحقول المطلوبة", "تنبيه");
      return;
    }

    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sectionDate = new Date(newSection.date);
    sectionDate.setHours(0, 0, 0, 0);
    
    if (sectionDate < today) {
      showWarningMessage("لا يمكن إضافة مقطع بتاريخ سابق. يجب أن يكون التاريخ من اليوم أو في المستقبل", "تنبيه");
      return;
    }

    setIsAddingSectionLoading(true);
    try {
      const sectionData = {
        date: newSection.date,
        reviewSection: newSection.reviewSection,
        memorizationSection: newSection.memorizationSection,
        group: selectedGroup,
        teacher: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "",
      };

      const createdSection = await createSection(sectionData);

      if (createdSection) {
        setSections((prev) => [createdSection, ...prev]);
        setIsAddSectionModalOpen(false);

        setNewSection({
          date: new Date().toISOString().split("T")[0],
          memorizationSection: "",
          reviewSection: "",
        });

        showSuccessToast("✅ تم إضافة المقطع بنجاح!");
      }
    } catch (err: unknown) {
      console.error("Error adding section:", err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showErrorToast(
        `❌ حدث خطأ أثناء إضافة المقطع: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsAddingSectionLoading(false);
    }
  };

  // Handler: Edit Section
  const handleEditSection = async (
    e: React.FormEvent,
    editingSection: Section | null,
    setIsEditingSectionLoading?: (loading: boolean) => void
  ) => {
    e.preventDefault();

    if (!editingSection) return;

    setIsEditingSectionLoading?.(true);

    try {
      const updatedSectionData = await updateSection(editingSection._id, {
        date: editingSection.date,
        memorizationSection: editingSection.memorizationSection,
        reviewSection: editingSection.reviewSection,
      });

      setSections((prev) =>
        prev.map((section) =>
          section._id === editingSection._id ? updatedSectionData : section
        ).filter((s): s is Section => s !== null)
      );
      setIsEditSectionModalOpen(false);
      setEditingSection(null);
      showSuccessToast("✅ تم تحديث المقطع بنجاح!");
    } catch (err) {
      console.error("Error updating section:", err);
      showErrorToast("❌ حدث خطأ أثناء تحديث المقطع");
    } finally {
      setIsEditingSectionLoading?.(false);
    }
  };

  // Handler: Delete Section
  const handleDeleteSection = async (sectionId: string) => {
    const result = await showCenteredSwal({
      title: "تأكيد الحذف",
      text: "هل أنت متأكد من حذف هذا المقطع؟ سيتم حذف جميع العلامات المرتبطة به.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    // 1. Optimistic Update: Remove from UI immediately
    setSections((prev) => prev.filter((section) => section._id !== sectionId));
    setMarks((prev) =>
      prev.filter((mark) => {
        if (!mark || !mark.sectionId) return false;
        const mSectionId = typeof mark.sectionId === "string" ? mark.sectionId : mark.sectionId._id;
        return mSectionId !== sectionId;
      })
    );
    
    showSuccessToast("✅ تم حذف المقطع بنجاح!");

    try {
      // 2. Call API in background
      await deleteSection(sectionId);
    } catch (err) {
      console.error("Error deleting section:", err);
      showErrorToast("❌ حدث خطأ أثناء حذف المقطع، سيتم استعادة البيانات...");
      
      // 3. Rollback on error
      if (refetchSections) await refetchSections();
      if (refetchMarks) await refetchMarks();
    }
  };

  // Handler: Add Mark
  const handleAddMark = async (
    e: React.FormEvent,
    selectedStudentId: string | null,
    selectedSection: Section | null,
    newMark: { reviewMark: number; memorizationMark: number },
    setIsAddingMarkLoading?: (loading: boolean) => void
  ) => {
    e.preventDefault();

    if (!selectedStudentId || !selectedSection) return;

    // Generate a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const totalMark = (newMark.reviewMark || 0) + (newMark.memorizationMark || 0);

    // Optimistic UI Update
    const optimisticMark = {
      _id: tempId,
      studentId: selectedStudentId, // Note: In real app this might need to be an object if populated
      sectionId: selectedSection._id,
      reviewMark: newMark.reviewMark,
      memorizationMark: newMark.memorizationMark,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as Mark; // Casting because studentId might be expected as object

    try {
      setIsAddingMarkLoading?.(true);
      
      // 1. Update UI Immediately
      setMarks((prev) => [...prev, optimisticMark]);
      setIsAddMarkModalOpen(false);
      showSuccessToast(`✅ تم رصد العلامة بنجاح! العلامة: ${totalMark}/20`);

      const markData = {
        studentId: selectedStudentId,
        sectionId: selectedSection._id,
        reviewMark: newMark.reviewMark,
        memorizationMark: newMark.memorizationMark,
      };

      // 2. Call API in background
      const response = await createMark(markData as never);

      if (response.success && response.data) {
        const savedMark = response.data;
        
        // 3. Replace temp mark with real mark
        setMarks((prev) => 
          prev.map(m => m._id === tempId ? savedMark : m)
        );
      } else {
        throw new Error(response.message || "Failed to create mark");
      }
    } catch (err) {
      console.error("Error adding mark:", err);
      
      // 4. Revert on error
      setMarks((prev) => prev.filter(m => m._id !== tempId));
      showErrorToast("❌ حدث خطأ أثناء إضافة العلامة");
      
      // Re-open modal if needed, or just let user try again (data is lost from form though if modal closed)
      // Ideally we might want to keep modal open, but for speed we closed it.
    } finally {
      setIsAddingMarkLoading?.(false);
    }
  };

  // Handler: Update Mark
  const handleUpdateMark = async (
    e: React.FormEvent,
    editingMark: Mark | null,
    selectedStudentId: string | null,
    selectedSection: Section | null,
    newMark: { reviewMark: number; memorizationMark: number },
    setIsUpdatingMarkLoading?: (loading: boolean) => void
  ) => {
    e.preventDefault();

    if (!editingMark || !selectedSection) return;

    // CRITICAL FIX: Extract studentId from editingMark, not selectedStudentId
    // This prevents updating the wrong student's mark
    const actualStudentId = typeof editingMark.studentId === 'string' 
      ? editingMark.studentId 
      : editingMark.studentId._id;

    const originalMark = { ...editingMark };
    const totalMark = (newMark.reviewMark || 0) + (newMark.memorizationMark || 0);

    try {
      setIsUpdatingMarkLoading?.(true);

      // 1. Optimistic UI Update
      setMarks((prev) => 
        prev.map((mark) => 
          mark._id === editingMark._id 
            ? { ...mark, ...newMark, reviewMark: newMark.reviewMark, memorizationMark: newMark.memorizationMark } 
            : mark
        )
      );
      
      setIsUpdateMarkModalOpen(false);
      setEditingMark(null);
      showSuccessToast(`🔄 تم تحديث العلامة بنجاح! العلامة الجديدة: ${totalMark}/20`);

      const markData = {
        studentId: actualStudentId, // Use actualStudentId from editingMark
        sectionId: selectedSection._id,
        reviewMark: newMark.reviewMark,
        memorizationMark: newMark.memorizationMark,
      };

      // 2. Call API in background
      const response = await createMark(markData as never);

      if (response.success && response.data) {
        const updatedMark = response.data;
        // Update with server data (to ensure consistency)
        setMarks((prev) => 
          prev.map((mark) => 
            mark._id === updatedMark._id ? updatedMark : mark
          )
        );
      } else {
        throw new Error(response.message || "Failed to update mark");
      }
    } catch (err) {
      console.error("Error updating mark:", err);
      
      // 3. Revert on error
      setMarks((prev) => 
        prev.map((mark) => 
          mark._id === editingMark._id ? originalMark : mark
        )
      );
      showErrorToast("❌ حدث خطأ أثناء تحديث العلامة");
    } finally {
      setIsUpdatingMarkLoading?.(false);
    }
  };

  // Handler: Delete Mark
  const handleDeleteMark = async (markId: string) => {
    const result = await showCenteredSwal({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف العلامة نهائياً",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    // Optimistic Update: Update UI immediately
    setMarks((prev) => prev.filter((mark) => mark._id !== markId));
    showSuccessToast("✅ تم حذف العلامة بنجاح!");

    try {
      const apiResult = await deleteMark(markId);
      
      if (!apiResult.success) {
        // If API fails, show error and revert (by refetching)
        showErrorToast(`❌ ${apiResult.message || "حدث خطأ أثناء حذف العلامة"}`);
        if (refetchMarks) await refetchMarks();
      }
    } catch (err) {
      console.error("Error deleting mark:", err);
      showErrorToast("❌ حدث خطأ أثناء حذف العلامة");
      if (refetchMarks) await refetchMarks();
    }
  };

  // Handler: Bulk Update
  const executeBulkUpdate = async (
    sections: Section[],
    selectedSectionsForBulk: string[],
    updateData: {
      reviewSection?: string;
      memorizationSection?: string;
    },
    setIsBulkUpdating?: (loading: boolean) => void
  ) => {
    if (selectedSectionsForBulk.length === 0) {
      showWarningMessage("الرجاء اختيار مقطع واحد على الأقل للتحديث", "تنبيه");
      return;
    }

    setIsBulkUpdating?.(true);

    try {
      const updatePromises = selectedSectionsForBulk.map(async (sectionId) => {
        const sectionToUpdate = sections.find((s) => s._id === sectionId);
        if (!sectionToUpdate) return null;

        const updatedData = {
          date: sectionToUpdate.date,
          reviewSection:
            updateData.reviewSection || sectionToUpdate.reviewSection,
          memorizationSection:
            updateData.memorizationSection ||
            sectionToUpdate.memorizationSection,
        };

        return updateSection(sectionId, updatedData);
      });

      const results = await Promise.all(updatePromises);

      setSections((prev) =>
        prev.map((section) => {
          const result = results.find((r) => r?._id === section._id);
          return result ? result : section;
        })
      );

      setSelectedSectionsForBulk([]);
      showSuccessToast("✅ تم تحديث المقاطع بنجاح!");
    } catch (err) {
      console.error("Error bulk updating sections:", err);
      showErrorToast("❌ حدث خطأ أثناء تحديث المقاطع");
    } finally {
      setIsBulkUpdating?.(false);
    }
  };

  // Handler: Bulk Delete
  const executeBulkDelete = async (selectedSectionsForBulk: string[], setIsBulkDeleting?: (loading: boolean) => void) => {
    if (selectedSectionsForBulk.length === 0) {
      showWarningMessage("الرجاء اختيار مقطع واحد على الأقل للحذف", "تنبيه");
      return;
    }

    const result = await showCenteredSwal({
      title: "تأكيد الحذف الجماعي",
      text: `هل أنت متأكد من حذف ${selectedSectionsForBulk.length} مقطع؟ سيتم حذف جميع العلامات المرتبطة بهم.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف الكل",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await Promise.all(
        selectedSectionsForBulk.map((sectionId) => deleteSection(sectionId))
      );

      setSections((prev) =>
        prev.filter((section) => !selectedSectionsForBulk.includes(section._id))
      );

      setMarks((prev) =>
        prev.filter((mark) => {
          if (!mark || !mark.sectionId) {
            return false;
          }
          
          if (typeof mark.sectionId === "string") {
            return !selectedSectionsForBulk.includes(mark.sectionId);
          } else {
            return !selectedSectionsForBulk.includes(mark.sectionId._id);
          }
        })
      );

      setIsBulkDeleteModalOpen(false);
      setSelectedSectionsForBulk([]);
      showSuccessToast("✅ تم حذف المقاطع بنجاح!");
    } catch (err) {
      console.error("Error bulk deleting sections:", err);
      showErrorToast("❌ حدث خطأ أثناء حذف المقاطع");
    } finally {
      setIsBulkDeleting?.(false);
    }
  };

  return {
    handleAddSection,
    handleEditSection,
    handleDeleteSection,
    handleAddMark,
    handleUpdateMark,
    handleDeleteMark,
    executeBulkUpdate,
    executeBulkDelete,
  };
};
