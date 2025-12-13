// ============================================================================
// useTimetableActions - هوك لإدارة عمليات الجدول (CRUD Operations)
// ============================================================================
// يوفر دوال لإضافة، تعديل، وحذف الحصص عبر الـ Backend API
// جميع العمليات تتحقق من الصلاحيات والتعارب في الـ Backend

import { useCallback } from "react";
import {
  createSession,
  updateSession,
  deleteSession,
} from "@/Api/TimeTable.Api";
import type { Session, SessionFormData } from "../types/timetable.types";
import { showConfirmDialog, showErrorMessage } from "@/utils/sweetalertUtils";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";

interface UseTimetableActionsProps {
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

export const useTimetableActions = ({
  setSessions,
}: UseTimetableActionsProps) => {
  
  // ============================================
  // ➕ إضافة موعد جديد
  // ============================================
  // Backend يتحقق من:
  // 1. Validation (Yup schema)
  // 2. تعارب أوقات المعلم
  // 3. تعارب أوقات الحلقة
  const addSession = useCallback(
    async (formData: SessionFormData) => {
      try {
        const added = await createSession(formData);
        setSessions((prev) => [...prev, added]);

        showSuccessToast(
          `تم إضافة موعد ${formData.note} يوم ${formData.day} بنجاح ✓`
        );

        return true;
      } catch (error: any) {
        console.error("❌ خطأ في حفظ الموعد:", error);
        
        // معالجة خاصة لأخطاء التعارب (409 Conflict)
        if (error?.isConflict) {
          await showErrorMessage("تعارض في المواعيد!", error.message);
          return false;
        }

        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "حدث خطأ أثناء حفظ الحلقة";

        showErrorToast(errorMsg);

        return false;
      }
    },
    [setSessions]
  );

  // ============================================
  // ✏️ تعديل موعد موجود
  // ============================================
  // Backend يتحقق من:
  // 1. Validation (Yup schema)
  // 2. تعارب أوقات المعلم (مع استثناء الجلسة الحالية)
  // 3. الصلاحيات (المعلم يعدل مواعيده فقط)
  const editSession = useCallback(
    async (sessionId: string, formData: SessionFormData) => {
      try {
        const updated = await updateSession(sessionId, formData);
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? updated : s))
        );

        showSuccessToast("تم تحديث موعد الحلقة بنجاح ✓");

        return true;
      } catch (error: any) {
        console.error("❌ خطأ في تحديث الموعد:", error);
        
        // معالجة خاصة لأخطاء التعارب (409 Conflict)
        if (error?.isConflict) {
          await showErrorMessage("تعارض في المواعيد!", error.message);
          return false;
        }

        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "حدث خطأ أثناء تحديث الحلقة";

        showErrorToast(errorMsg);

        return false;
      }
    },
    [setSessions]
  );

  // ============================================
  // 🗑️ حذف موعد
  // ============================================
  // يطلب تأكيد من المستخدم قبل الحذف
  const removeSession = useCallback(
    async (session: Session) => {
      const result = await showConfirmDialog(
        "تأكيد الحذف",
        `هل أنت متأكد من حذف موعد <strong>${
          session.note || "الحلقة"
        }</strong>؟<br>يوم ${session.day} من ${session.startHour} إلى ${
          session.endHour
        }`,
        "نعم، احذف",
        "إلغاء"
      );

      if (!result.isConfirmed) return false;

      if (session._id) {
        try {
          await deleteSession(session._id);
          setSessions((prev) => prev.filter((s) => s._id !== session._id));

          showSuccessToast("تم حذف الموعد بنجاح ✓");

          return true;
        } catch (error) {
          console.error("Error deleting session:", error);
          showErrorToast("حدث خطأ أثناء حذف الحلقة");
          return false;
        }
      }

      return false;
    },
    [setSessions]
  );

  return {
    addSession,
    editSession,
    removeSession,
  };
};
