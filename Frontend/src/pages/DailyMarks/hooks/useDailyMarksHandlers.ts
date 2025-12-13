import { createSection, updateSection, deleteSection } from "@/Api/sectionApi";
import { createMark } from "@/Api/dailyMarksApi";
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
  setIsBulkUpdateModalOpen: (value: boolean) => void;
  setIsBulkDeleteModalOpen: (value: boolean) => void;
  setSelectedSectionsForBulk: React.Dispatch<React.SetStateAction<string[]>>;
}

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
  setIsBulkUpdateModalOpen,
  setIsBulkDeleteModalOpen,
  setSelectedSectionsForBulk,
}: UseHandlersProps) => {
  
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

    try {
      await deleteSection(sectionId);

      setSections((prev) => prev.filter((section) => section._id !== sectionId));
      setMarks((prev) =>
        prev.filter((mark) => {
          if (!mark || !mark.sectionId) {
            return false;
          }
          
          if (typeof mark.sectionId === "string") {
            return mark.sectionId !== sectionId;
          } else {
            return mark.sectionId._id !== sectionId;
          }
        })
      );

      showSuccessToast("✅ تم حذف المقطع بنجاح!");
    } catch (err) {
      console.error("Error deleting section:", err);
      showErrorToast("❌ حدث خطأ أثناء حذف المقطع");
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

    try {
      setIsAddingMarkLoading?.(true);
      
      const markData = {
        studentId: selectedStudentId,
        sectionId: selectedSection._id,
        reviewMark: newMark.reviewMark,
        memorizationMark: newMark.memorizationMark,
      };

      const createdMark = await createMark(markData as never);

      setMarks((prev) => [createdMark as never, ...prev]);
      setIsAddMarkModalOpen(false);

      const totalMark =
        (newMark.reviewMark || 0) + (newMark.memorizationMark || 0);
      showSuccessToast(`✅ تم رصد العلامة بنجاح! العلامة: ${totalMark}/20`);
    } catch (err) {
      console.error("Error adding mark:", err);
      showErrorToast("❌ حدث خطأ أثناء إضافة العلامة");
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

    if (!editingMark || !selectedStudentId || !selectedSection) return;

    setIsUpdatingMarkLoading?.(true);

    try {
      const markData = {
        studentId: selectedStudentId,
        sectionId: selectedSection._id,
        reviewMark: newMark.reviewMark,
        memorizationMark: newMark.memorizationMark,
      };

      const updatedMark = await createMark(markData as never);

      setMarks((prev) =>
        prev.map((mark) =>
          mark._id === editingMark._id ? (updatedMark as never) : mark
        )
      );
      setIsUpdateMarkModalOpen(false);
      setEditingMark(null);

      const totalMark =
        (newMark.reviewMark || 0) + (newMark.memorizationMark || 0);
      showSuccessToast(`🔄 تم تحديث العلامة بنجاح! العلامة الجديدة: ${totalMark}/20`);
    } catch (err) {
      console.error("Error updating mark:", err);
      showErrorToast("❌ حدث خطأ أثناء تحديث العلامة");
    } finally {
      setIsUpdatingMarkLoading?.(false);
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

      setIsBulkUpdateModalOpen(false);
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
    executeBulkUpdate,
    executeBulkDelete,
  };
};
