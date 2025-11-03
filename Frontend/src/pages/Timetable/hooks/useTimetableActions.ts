// ============================================================================
// useTimetableActions - هوك لإدارة عمليات الجدول (إضافة، تعديل، حذف)
// ============================================================================

import { useCallback } from "react";
import {
  createSession,
  updateSession,
  deleteSession,
} from "../../../Api/sessionApi";
import type { Session, SessionFormData } from "../types/timetable.types";
import Swal from "sweetalert2";

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
        const added = await createSession(formData);
        setSessions((prev) => [...prev, added]);

        await Swal.fire({
          icon: "success",
          title: "تمت الإضافة بنجاح!",
          text: `تم إضافة موعد ${formData.note} يوم ${formData.day}`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        return true;
      } catch (error: any) {
        console.error("❌ خطأ في حفظ الموعد:", error);
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "حدث خطأ أثناء حفظ الحلقة";

        await Swal.fire({
          icon: "error",
          title: "حدث خطأ!",
          text: errorMsg,
          confirmButtonText: "حسناً",
          confirmButtonColor: "#10b981",
        });

        return false;
      }
    },
    [setSessions]
  );

  // تحديث موعد موجود
  const editSession = useCallback(
    async (sessionId: string, formData: SessionFormData) => {
      try {
        const updated = await updateSession(sessionId, formData);
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? updated : s))
        );

        await Swal.fire({
          icon: "success",
          title: "نجح التحديث!",
          text: "تم تحديث موعد الحلقة بنجاح",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        return true;
      } catch (error: any) {
        console.error("❌ خطأ في تحديث الموعد:", error);
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "حدث خطأ أثناء تحديث الحلقة";

        await Swal.fire({
          icon: "error",
          title: "حدث خطأ!",
          text: errorMsg,
          confirmButtonText: "حسناً",
          confirmButtonColor: "#10b981",
        });

        return false;
      }
    },
    [setSessions]
  );

  // حذف موعد
  const removeSession = useCallback(
    async (session: Session) => {
      const result = await Swal.fire({
        title: "تأكيد الحذف",
        html: `هل أنت متأكد من حذف موعد <strong>${
          session.note || "الحلقة"
        }</strong>؟<br>يوم ${session.day} من ${session.startHour} إلى ${
          session.endHour
        }`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "نعم، احذف",
        cancelButtonText: "إلغاء",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return false;

      if (session._id) {
        try {
          await deleteSession(session._id);
          setSessions((prev) => prev.filter((s) => s._id !== session._id));

          await Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: "تم حذف الموعد بنجاح",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });

          return true;
        } catch (error) {
          console.error("Error deleting session:", error);
          await Swal.fire({
            icon: "error",
            title: "حدث خطأ!",
            text: "حدث خطأ أثناء حذف الحلقة",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#10b981",
          });
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
