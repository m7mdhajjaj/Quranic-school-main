import { createSection, updateSection, deleteSection } from "@/Api/DailyMark/sectionApi";
import { createMark, deleteMark, updateMark } from "@/Api/DailyMark/dailyMarksApi";
import { sectionValidationSchema } from '@/Validation/DailyMark';
import * as yup from "yup";
import {
  showCenteredSwal,
  showWarningMessage,
  showConfirmMessage,
  showErrorMessage,
} from "@/utils/sweetalertUtils";
import { playSuccessSound } from "@/utils/AudioManager";
import {
  showSuccessToast,
  showWarningToast,
} from "@/utils/toastUtils";

// Helper for displaying completion messages
const handleCompletionSuccess = (completedSurahs: any[]) => {
  if (!completedSurahs || completedSurahs.length === 0) return;

  const names = completedSurahs.map(s => {
      const typeLabel = (s.type || 'memorization') === 'memorization' ? 'حفظ' : 'مراجعة';
      return `<div class="py-1 border-b border-gray-100 last:border-0 flex justify-between items-center">
        <span class="font-bold text-emerald-600">سورة ${s.surahName}</span>
        <span class="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">${typeLabel}</span>
      </div>`;
  }).join('');

  showCenteredSwal({
    title: '🎉 مبارك! إنجاز عظيم',
    html: `<div class="text-gray-600 mb-3">تم بحمد الله إتمام:</div><div class="bg-white p-3 rounded-xl border border-gray-100 shadow-inner text-right">${names}</div>`,
    icon: 'success',
    confirmButtonText: 'ممتاز',
    timer: 6000,
    timerProgressBar: true
  });
  
  try { playSuccessSound(); } catch (e) { console.error(e); }
};

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
  refetchStats?: () => Promise<void>;
  refetchCompletedSurahs?: () => Promise<void>;
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
  refetchStats,
  refetchCompletedSurahs,
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
        // ✅ User-friendly error messages
        const errorMsg = error.errors[0];
        
        // Map technical errors to user-friendly messages
        let userMessage = errorMsg;
        
        if (errorMsg.includes('at-least-one-section') || errorMsg.includes('مقطع حفظ أو مقطع مراجعة')) {
          userMessage = "⚠️ يجب إدخال مقطع حفظ أو مقطع مراجعة على الأقل";
        } else if (errorMsg.includes('التاريخ')) {
          userMessage = `📅 ${errorMsg}`;
        } else if (errorMsg.includes('تداخل') || errorMsg.includes('overlap')) {
          userMessage = `🚫 ${errorMsg}`;
        }
        
        showWarningMessage("يرجى التحقق من البيانات", userMessage);
        return;
      } else {
        console.error("Validation Error", error);
        showErrorMessage("خطأ", "⚠️ خطأ في التحقق من البيانات");
        return;
      }
    }
    // ------------------------------------------

    // ✅ V3: Date validation removed - backfilling is allowed
    // Backend performs date-aware validation for chronological integrity
    // No need to block past dates in UI

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
          ? (createdSectionResponse as any) // Note: This might be the wrapping object, checks below imply createdSection is the section
          : createdSectionResponse;

        // ✅ تحسين تجربة المستخدم:
        // 1. تحديث الحالة محلياً فوراً (Optimistic Update)
        // 2. إغلاق النافذة فوراً
        // 3. تحديث البيانات في الخلفية
        
        setSections((prev) => [createdSection as Section, ...prev]);
        
        setIsAddSectionModalOpen(false);
        setIsAddingSectionLoading(false); // Force loading off immediately

        setNewSection({
          date: new Date().toISOString().split("T")[0],
          memorizationSection: "",
          reviewSection: "",
          memorizationMeta: [],
          reviewMeta: [],
        });

        // Show success toast immediately
        showSuccessToast("✅ تم إضافة المقطع بنجاح!");

        // Trigger refetches in background (Fire and forget-ish)
        if (refetchSections) {
           refetchSections().catch(console.error);
        }
        refetchStats?.();
        refetchCompletedSurahs?.();

        // Check Completion
        const responseMeta = (createdSectionResponse as any).meta;
        if (responseMeta?.completedSurahs?.length > 0) {
            handleCompletionSuccess(responseMeta.completedSurahs);
        }

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

      // ✅ Handle Validation Errors with user-friendly messages
      if (status === 400) {
        let userMessage = serverMessage || "بيانات المقطع غير صحيحة";
        
        // Use SweetAlert for important errors with details
        if (serverMessage?.includes('تداخل') || serverMessage?.includes('overlap')) {
          showErrorMessage("خطأ في البيانات", serverMessage);
        } else if (serverMessage?.includes('فجوة') || serverMessage?.includes('gap')) {
          showErrorMessage("خطأ في التسلسل", serverMessage);
        } else if (serverMessage?.includes('بداية خاطئة') || serverMessage?.includes('يجب أن يبدأ من')) {
          showErrorMessage("خطأ في البداية", serverMessage);
        } else if (serverMessage?.includes('تكرار') || serverMessage?.includes('duplicate')) {
          showErrorMessage("تكرار مقطع", "🚫 هذا المقطع مسجل مسبقاً");
        } else if (serverMessage?.includes('same-day') || serverMessage?.includes('نفس اليوم')) {
          showErrorMessage("تكرار في نفس اليوم", "📅 لا يمكن إضافة مقطع مكرر في نفس اليوم");
        } else {
          showErrorMessage("خطأ في البيانات", userMessage);
        }
        
        // Show additional granular errors if available
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach(e => showWarningToast(e));
        }
      } else if (status === 404) {
        showErrorMessage("خطأ", "❌ الحلقة المطلوبة غير موجودة");
      } else if (status === 500) {
        showErrorMessage("خطأ في الخادم", "⚠️ حدث خطأ في الخادم، يرجى المحاولة لاحقاً");
      } else {
        showErrorMessage("خطأ", `❌ حدث خطأ: ${serverMessage || 'غير معروف'}`);
      }
    } finally {
      setIsAddingSectionLoading(false);
    }
  }, [selectedGroup, currentUser, setSections, setIsAddSectionModalOpen, navigate, refetchSections, refetchStats, refetchCompletedSurahs]);

  // Handler: Edit Section
  const handleEditSection = useCallback(async (
    e: React.FormEvent,
    editingSection: Section | null,
    updatedData: Partial<Section> | null,
    setIsEditingSectionLoading?: (loading: boolean) => void
  ) => {
    e.preventDefault();

    if (!editingSection) return;

    setIsEditingSectionLoading?.(true);

    try {
      // 1. Call API first (Wait for validation)
      // Use updatedData if available, otherwise fallback to editingSection (but updatedData should be preferred)
      const dataToSend = updatedData || editingSection;
      
      const updatedSection = await updateSection(editingSection._id, {
        date: dataToSend.date,
        memorizationSection: dataToSend.memorizationSection,
        reviewSection: dataToSend.reviewSection,
        memorizationMeta: dataToSend.memorizationMeta,
        reviewMeta: dataToSend.reviewMeta,
      });

      // 2. Success: Update UI
      if (updatedSection) {
        // ✅ إعادة جلب المقاطع لضمان الحصول على كل البيانات
        if (refetchSections) {
          await refetchSections();
        } else {
          setSections((prev) =>
            prev.map((section) =>
              section._id === editingSection._id ? updatedSection : section
            ).filter((s): s is Section => s !== null)
          );
        }
        
        setIsEditSectionModalOpen(false);
        setEditingSection(null);
        showSuccessToast("✅ تم تحديث المقطع بنجاح!");

        // Trigger refetches
        refetchStats?.();
        refetchCompletedSurahs?.();

        // Check Completion
        const meta = (updatedSection as any).meta;
        if (meta?.completedSurahs?.length > 0) {
             handleCompletionSuccess(meta.completedSurahs);
        }

        // 3. Prompt for Schedule Update (only if section has a timetable)
        const timetableId = updatedSection.timetableId 
          ? (typeof updatedSection.timetableId === 'object' ? updatedSection.timetableId._id : updatedSection.timetableId)
          : null;

        if (timetableId) {
          const confirmResult = await showConfirmMessage(
            "تحديث الجدول",
            "هل تود تعديل موعد الجدول المرتبط بهذا المقطع؟",
            "نعم، عدّل الموعد",
            "لا، شكراً"
          );
    
          if (confirmResult.isConfirmed) {
            navigate(`/timetable?editSession=${timetableId}`);
          }
        }
      }

    } catch (err: unknown) {
      console.error("Error updating section:", err);
      
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message || error.message;

      // Handle Validation Errors specifically (Overlap)
      if (status === 400) {
        showErrorMessage("بيانات غير صالحة", serverMessage || "بيانات غير صالحة");
        // No need to rollback or refetch, as we didn't update UI yet.
      } else {
        showErrorMessage("حدث خطأ", "❌ حدث خطأ أثناء تحديث المقطع، حاول مرة أخرى.");
      }
    } finally {
      setIsEditingSectionLoading?.(false);
    }
  }, [setSections, setIsEditSectionModalOpen, setEditingSection, selectedGroup, navigate, refetchSections, refetchStats, refetchCompletedSurahs]);

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
    refetchStats?.();
    refetchCompletedSurahs?.();

    try {
      // 2. Call API in background
      await deleteSection(sectionId);
      
      // ✅ 3. Refresh to show AI repairs (if any gaps were filled)
      if (refetchSections) {
        await refetchSections();
      }
    } catch (err) {
      console.error("Error deleting section:", err);
      showErrorMessage("حدث خطأ", "❌ حدث خطأ أثناء حذف المقطع، سيتم استعادة البيانات...");
      
      // 4. Rollback on error
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

    // ✅ تحديد ما إذا كان المقطع يحتوي على حفظ أو مراجعة
    const hasMemorization = !!(
      selectedSection.memorizationSection?.trim() || 
      (selectedSection.memorizationMeta && selectedSection.memorizationMeta.length > 0)
    );
    const hasReview = !!(
      selectedSection.reviewSection?.trim() || 
      (selectedSection.reviewMeta && selectedSection.reviewMeta.length > 0)
    );

    // ✅ حساب المجموع فقط للعلامات الموجودة
    let totalMark = 0;
    if (hasReview) totalMark += (newMark.reviewMark || 0);
    if (hasMemorization) totalMark += (newMark.memorizationMark || 0);
    const maxMark = (hasReview && hasMemorization) ? 20 : 10;

    // ✅ إرسال فقط العلامات المتعلقة بالنوع الموجود
    const markData: {
      studentId: string;
      sectionId: string;
      reviewMark?: number;
      memorizationMark?: number;
    } = {
      studentId: selectedStudentId,
      sectionId: selectedSection._id,
    };

    if (hasReview) {
      markData.reviewMark = newMark.reviewMark;
    }
    if (hasMemorization) {
      markData.memorizationMark = newMark.memorizationMark;
    }

    try {
      setIsAddingMarkLoading?.(true);

      // 1. Call API FIRST (no optimistic update for marks with time window)
      const response = await createMark(markData as never);

      if (response.success && response.data) {
        const savedMark = response.data;
        
        // 2. Update UI only after success
        setMarks((prev) => [...prev, savedMark]);
        setIsAddMarkModalOpen(false);
        showSuccessToast(`✅ تم رصد العلامة بنجاح! العلامة: ${totalMark}/${maxMark}`);
        
        // Refresh sections status/progress (non-blocking)
        refetchSections?.();
        refetchStats?.();
        refetchCompletedSurahs?.();
      } else {
        throw new Error(response.message || "Failed to create mark");
      }
    } catch (err) {
      console.error("Error adding mark:", err);
      
      // ✅ Handle specific error types
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const serverMessage = error.response?.data?.message || error.message;
      
      // Check for edit window errors (نافذة التعديل الزمنية)
      if (serverMessage?.includes('قبل موعد') || serverMessage?.includes('انتهت فترة')) {
        showErrorMessage("⏰ خارج فترة التعديل", serverMessage);
      } else {
        showErrorMessage("حدث خطأ", serverMessage || "❌ حدث خطأ أثناء إضافة العلامة");
      }
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

    // ✅ تحديد ما إذا كان المقطع يحتوي على حفظ أو مراجعة
    const hasMemorization = !!(
      selectedSection.memorizationSection?.trim() || 
      (selectedSection.memorizationMeta && selectedSection.memorizationMeta.length > 0)
    );
    const hasReview = !!(
      selectedSection.reviewSection?.trim() || 
      (selectedSection.reviewMeta && selectedSection.reviewMeta.length > 0)
    );

    const originalMark = { ...editingMark };
    
    // ✅ حساب المجموع فقط للعلامات الموجودة
    let totalMark = 0;
    if (hasReview) totalMark += (newMark.reviewMark || 0);
    if (hasMemorization) totalMark += (newMark.memorizationMark || 0);
    const maxMark = (hasReview && hasMemorization) ? 20 : 10;

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
      showSuccessToast(`🔄 تم تحديث العلامة بنجاح! العلامة الجديدة: ${totalMark}/${maxMark}`);

      // ✅ إرسال فقط العلامات المتعلقة بالنوع الموجود
      const markData: {
        studentId: string;
        sectionId: string;
        reviewMark?: number;
        memorizationMark?: number;
      } = {
        studentId: actualStudentId, // Use actualStudentId from editingMark
        sectionId: selectedSection._id,
      };

      if (hasReview) {
        markData.reviewMark = newMark.reviewMark;
      }
      if (hasMemorization) {
        markData.memorizationMark = newMark.memorizationMark;
      }

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
        refetchStats?.();
        refetchCompletedSurahs?.();
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
      
      // ✅ Handle specific error types
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const serverMessage = error.response?.data?.message || error.message;
      
      // Check for edit window errors (نافذة التعديل الزمنية)
      if (serverMessage?.includes('قبل موعد') || serverMessage?.includes('انتهت فترة')) {
        showErrorMessage("⏰ خارج فترة التعديل", serverMessage);
      } else {
        showErrorMessage("حدث خطأ", "❌ حدث خطأ أثناء تحديث العلامة");
      }
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
        // ✅ Handle specific error types including edit window errors
        const serverMessage = apiResult.message;
        
        if (serverMessage?.includes('قبل موعد') || serverMessage?.includes('انتهت فترة')) {
          showErrorMessage("⏰ خارج فترة التعديل", serverMessage);
        } else {
          showErrorMessage("حدث خطأ", `❌ ${serverMessage || "حدث خطأ أثناء حذف العلامة"}`);
        }
        if (refetchMarks) await refetchMarks();
      }
      // Refresh sections status/progress (non-blocking)
      refetchSections?.();
      refetchStats?.();
      refetchCompletedSurahs?.();
    } catch (err) {
      console.error("Error deleting mark:", err);
      
      // ✅ Handle specific error types
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const serverMessage = error.response?.data?.message || error.message;
      
      if (serverMessage?.includes('قبل موعد') || serverMessage?.includes('انتهت فترة')) {
        showErrorMessage("⏰ خارج فترة التعديل", serverMessage);
      } else {
        showErrorMessage("حدث خطأ", "❌ حدث خطأ أثناء حذف العلامة");
      }
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
      refetchStats?.();
      refetchCompletedSurahs?.();
    } catch (err) {
      console.error("Error bulk updating sections:", err);
      showErrorMessage("حدث خطأ", "❌ حدث خطأ أثناء تحديث المقاطع");
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
      refetchStats?.();
      refetchCompletedSurahs?.();
    } catch (err) {
      console.error("Error bulk deleting sections:", err);
      showErrorMessage("حدث خطأ", "❌ حدث خطأ أثناء حذف المقاطع");
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
