// ============================================================================
// useSessionModalLogic - Hook لفصل منطق SessionModal عن الفرونت إند
// ============================================================================

import { useState, useCallback } from "react";
import type { SessionFormData, Session } from "../../types/timetable.types";
import { validateTimetableData } from "@/Validation/timetableValidation";
import { showErrorToast } from "@/utils/toastUtils";

interface UseSessionModalLogicProps {
  onSubmit: (formData: SessionFormData, sessionId?: string) => Promise<boolean>;
  editingSession: Session | null;
  onClose: () => void;
  resetForm: () => void;
  bookedHours: string[];
  formData: SessionFormData;
}

export const useSessionModalLogic = ({
  onSubmit,
  editingSession,
  onClose,
  resetForm,
  bookedHours,
  formData,
}: UseSessionModalLogicProps) => {
  const [loading, setLoading] = useState(false);

  // ============================================
  // 🔒 التحقق من صحة البيانات
  // ============================================
  const validateForm = useCallback(async (): Promise<{ isValid: boolean; errorMessage?: string }> => {
    // 1️⃣ Frontend Validation - استخدام Yup validation
    const validation = await validateTimetableData(formData);

    if (!validation.isValid && validation.errors) {
      const errorMessages = Object.values(validation.errors).join('\n');
      return {
        isValid: false,
        errorMessage: '⚠️ يرجى تصحيح الأخطاء التالية:\n\n' + errorMessages,
      };
    }

    // 2️⃣ فحص إضافي للأوقات المحجوزة
    if (bookedHours.includes(formData.startHour)) {
      return {
        isValid: false,
        errorMessage: '❌ وقت البداية محجوز مسبقاً',
      };
    }

    if (bookedHours.includes(formData.endHour)) {
      return {
        isValid: false,
        errorMessage: '❌ وقت النهاية محجوز مسبقاً',
      };
    }

    return { isValid: true };
  }, [formData, bookedHours]);

  // ============================================
  // 📤 معالج إرسال النموذج
  // ============================================
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من صحة البيانات
    const validation = await validateForm();
    if (!validation.isValid) {
      showErrorToast(validation.errorMessage || 'يرجى تصحيح الأخطاء');
      return;
    }

    // إرسال البيانات للـ Backend
    // Backend سيقوم بفحص إضافي للتعارب (checkSessionConflict)
    setLoading(true);
    const success = await onSubmit(formData, editingSession?._id);
    setLoading(false);

    if (success) {
      resetForm();
      onClose();
    }
  }, [validateForm, onSubmit, formData, editingSession, resetForm, onClose]);

  // ============================================
  // ❌ معالج إغلاق المودال
  // ============================================
  const handleClose = useCallback(() => {
    if (!loading) {
      resetForm();
      onClose();
    }
  }, [loading, resetForm, onClose]);

  return {
    loading,
    handleSubmit,
    handleClose,
  };
};
