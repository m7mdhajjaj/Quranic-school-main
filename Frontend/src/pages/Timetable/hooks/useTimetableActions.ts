// ============================================================================
// useTimetableActions - هوك لإدارة عمليات الجدول (إضافة، تعديل، حذف)
// ============================================================================

import { useCallback } from "react";
import {
  createSession,
  updateSession,
  deleteSession,
} from "@/Api/TimeTable.Api";
import type { Session, SessionFormData } from "../types/timetable.types";
import { showConfirmDialog, showErrorMessage } from "@/components/utils";
import { showSuccessToast, showErrorToast } from "@/components/utils/toastUtils";

interface UseTimetableActionsProps {
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

export const useTimetableActions = ({
  setSessions,
}: UseTimetableActionsProps) => {
  // إضافة موعد جديد
  const addSession = useCallback(
    async (formData: SessionFormData) => {
      try {
        // ✅ Backend سيتحقق من validation
        const added = await createSession(formData);
        setSessions((prev) => [...prev, added]);

        showSuccessToast(
          `تم إضافة موعد ${formData.note} يوم ${formData.day} بنجاح ✓`
        );

        return true;
      } catch (error: any) {
        console.error("❌ خطأ في حفظ الموعد:", error);
        
        // Handle conflict errors
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

  // تحديث موعد موجود
  const editSession = useCallback(
    async (sessionId: string, formData: SessionFormData) => {
      try {
        // ✅ Backend سيتحقق من validation
        const updated = await updateSession(sessionId, formData);
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? updated : s))
        );

        showSuccessToast("تم تحديث موعد الحلقة بنجاح ✓");

        return true;
      } catch (error: any) {
        console.error("❌ خطأ في تحديث الموعد:", error);
        
        // Handle conflict errors
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

  // حذف موعد
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
