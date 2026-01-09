import { createSection, updateSection, deleteSection } from "@/Api/DailyMark/sectionApi";
import { createMark, deleteMark, updateMark } from "@/Api/DailyMark/dailyMarksApi";
import { sectionValidationSchema } from "@/Validation/dailyMarksValidation"; // Import Schema
import * as yup from "yup";
import {
  showCenteredSwal,
  showWarningMessage,
  showConfirmMessage,
} from "@/utils/sweetalertUtils";
import {
  showSuccessToast,
  showErrorToast,
} from "@/utils/toastUtils";
import type { Section, Mark } from "../types/types";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

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
  const navigate = useNavigate();
  
  // Handler: Add Section
  const handleAddSection = useCallback(async (
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

    // --- Strict Validation using YUP Schema ---
    try {
      // Construct data object matching schema
      const validationPayload = {
        date: newSection.date,
        reviewSection: newSection.reviewSection,
        memorizationSection: newSection.memorizationSection,
        memorizationMeta: newSection.memorizationMeta,
        reviewMeta: newSection.reviewMeta,
        group: selectedGroup,
        teacher: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "",
      };

      // Validate synchronously (or async)
      await sectionValidationSchema.validate(validationPayload, { abortEarly: false });

    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Show the first error message
        showWarningMessage(error.errors[0], "خطأ في البيانات");
        return;
      } else {
        console.error("Validation Error", error);
        return;
      }
    }
    // ------------------------------------------


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
        // Legacy Strings
        reviewSection: newSection.reviewSection,
        memorizationSection: newSection.memorizationSection,
        // New Structured Data
        memorizationMeta: newSection.memorizationMeta,
        reviewMeta: newSection.reviewMeta,
        
        group: selectedGroup,
        teacher: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "",
      };

      const createdSectionResponse = await createSection(sectionData);

      if (createdSectionResponse) {
        // Handle both simple section response and response with meta
        const createdSection = (createdSectionResponse as any).meta 
          ? (createdSectionResponse as any) 
          : createdSectionResponse;

        setSections((prev) => [createdSection, ...prev]);
        setIsAddSectionModalOpen(false);

        setNewSection({
          date: new Date().toISOString().split("T")[0],
          memorizationSection: "",
          reviewSection: "",
          memorizationMeta: [],
          reviewMeta: [],
        });

        // Show success toast immediately
        showSuccessToast("✅ تم إضافة المقطع بنجاح!");

        // Check if we need to ask/prompt for schedule
        if ((createdSectionResponse as any).meta?.askForSchedule) {
          const result = await showConfirmMessage(
            "تم إضافة المقطع بنجاح",
            "هل تود إضافة موعد في الجدول لهذا المقطع؟",
            "نعم، أضف موعد",
            "لا، شكراً"
          );

          if (result.isConfirmed) {
            // Determine session type based on filled fields
            let sessionType = "both";
            if (newSection.memorizationSection && !newSection.reviewSection) {
              sessionType = "hifz";
            } else if (!newSection.memorizationSection && newSection.reviewSection) {
              sessionType = "murajaah";
            }

            // Navigate to timetable with query params
            navigate(`/timetable?addSession=true&sectionId=${createdSection._id}&groupName=${encodeURIComponent(selectedGroup)}&sessionType=${sessionType}`);
          }
        }
      }
    } catch (err: unknown) {
      console.error("Error adding section:", err);
      
      const error = err as { response?: { status?: number; data?: { message?: string; errors?: string[] } }; message?: string };
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message || error.message;

      // Handle Validation Errors (Overlap, etc) nicely
      if (status === 400) {
           showErrorToast(serverMessage || "بيانات المقطع غير صحيحة");
           // Show granular errors if available
           if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
               error.response.data.errors.forEach(e => showWarningMessage(e, "تنبيه"));
           }
      } else {
          showErrorToast(`❌ حدث خطأ أثناء إضافة المقطع: ${serverMessage}`);
      }
    } finally {
      setIsAddingSectionLoading(false);
    }
  }, [selectedGroup, currentUser, setSections, setIsAddSectionModalOpen, navigate]);

  // Handler: Edit Section
  const handleEditSection = useCallback(async (
    e: React.FormEvent,
    editingSection: Section | null,
    setIsEditingSectionLoading?: (loading: boolean) => void
  ) => {
    e.preventDefault();

    if (!editingSection) return;

    setIsEditingSectionLoading?.(true);

    // Optimistic Update: Create the optimistically updated section
    // We assume editingSection contains the modifications from the form
    const optimisticSection = { ...editingSection };

    try {
      // 1. Update UI Immediately (Optimistic)
      setSections((prev) =>
        prev.map((section) =>
          section._id === editingSection._id ? optimisticSection : section
        ).filter((s): s is Section => s !== null)
      );
      
      setIsEditSectionModalOpen(false);
      setEditingSection(null);
      showSuccessToast("✅ تم تحديث المقطع بنجاح!");

      // 2. Start API call in background
      const updatePromise = updateSection(editingSection._id, {
        date: editingSection.date,
        memorizationSection: editingSection.memorizationSection,
        reviewSection: editingSection.reviewSection,
        memorizationMeta: editingSection.memorizationMeta, // Added: Send structured data
        reviewMeta: editingSection.reviewMeta,             // Added: Send structured data
      });

      // Show confirmation dialog immediately (without waiting for API)
      const confirmResult = await showConfirmMessage(
        "تحديث الجدول",
        "هل تود تعديل موعد الجدول المرتبط بهذا المقطع؟",
        "نعم، عدّل الموعد",
        "لا، شكراً"
      );

      if (confirmResult.isConfirmed) {
        // Determine session type based on filled fields
        let sessionType = "both";
        const hasMem = editingSection.memorizationSection && editingSection.memorizationSection.trim() !== "";
        const hasRev = editingSection.reviewSection && editingSection.reviewSection.trim() !== "";
        
        if (hasMem && !hasRev) {
          sessionType = "hifz";
        } else if (!hasMem && hasRev) {
          sessionType = "murajaah";
        }

        navigate(`/timetable?editSession=true&sectionId=${editingSection._id}&groupName=${encodeURIComponent(selectedGroup)}&sessionType=${sessionType}`);
      }

      // 3. Wait for API and update with actual server data to ensure consistency
      const updatedSection = await updatePromise;
      if (updatedSection) {
        setSections((prev) =>
          prev.map((section) =>
            section._id === editingSection._id ? updatedSection : section
          ).filter((s): s is Section => s !== null)
        );
      }

    } catch (err: unknown) {
      console.error("Error updating section:", err);
      
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message || error.message;

      // Handle Validation Errors specifically (Overlap)
      if (status === 400) {
        showErrorToast(serverMessage || "بيانات غير صالحة");
        // Rollback only if it was a validation error (since the server rejected it)
        if (refetchSections) await refetchSections();
      } else {
        showErrorToast("❌ حدث خطأ أثناء تحديث المقطع، سيتم استعادة البيانات...");
        if (refetchSections) await refetchSections();
      }
    } finally {
      setIsEditingSectionLoading?.(false);
    }
  }, [setSections, setIsEditSectionModalOpen, setEditingSection, refetchSections, selectedGroup, navigate]);

  // Handler: Delete Section
  const handleDeleteSection = useCallback(async (sectionId: string) => {
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
  }, [setSections, setMarks, refetchSections, refetchMarks]);

  // Handler: Add Mark
  const handleAddMark = useCallback(async (
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
        // Refresh sections status/progress (non-blocking)
        refetchSections?.();
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
  }, [setMarks, setIsAddMarkModalOpen, refetchSections]);

  // Handler: Update Mark
  const handleUpdateMark = useCallback(async (
    e: React.FormEvent,
    editingMark: Mark | null,
    _selectedStudentId: string | null,
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

      // 2. Call API in background (update by ID)
      const response = await updateMark(editingMark._id, markData as never);

      if (response.success && response.data) {
        const updatedMark = response.data;
        // Update with server data (to ensure consistency)
        setMarks((prev) => 
          prev.map((mark) => 
            mark._id === updatedMark._id ? updatedMark : mark
          )
        );
        // Refresh sections status/progress (non-blocking)
        refetchSections?.();
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
  }, [setMarks, setIsUpdateMarkModalOpen, setEditingMark, refetchSections]);

  // Handler: Delete Mark
  const handleDeleteMark = useCallback(async (markId: string) => {
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
      // Refresh sections status/progress (non-blocking)
      refetchSections?.();
    } catch (err) {
      console.error("Error deleting mark:", err);
      showErrorToast("❌ حدث خطأ أثناء حذف العلامة");
      if (refetchMarks) await refetchMarks();
    }
  }, [setMarks, refetchMarks, refetchSections]);

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
      setIsBulkDeleting?.(true);
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
