// ============================================================================
// useTimetableActions - هوك لإدارة عمليات الجدول (CRUD Operations)
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)

import { useCallback } from "react";
import {
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from "@/Api/TimeTable.Api";
import type { Session, SessionFormData } from "../types/timetable.types";
import { showConfirmDialog, showErrorMessage } from "@/utils/sweetalertUtils";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";
import { getCurrentUser, formatDateShort, getDayNameFromDate } from "../utils";

interface UseTimetableActionsProps {
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

export const useTimetableActions = ({
  setSessions,
}: UseTimetableActionsProps) => {
  
  // ============================================
  // ➕ إضافة موعد جديد
  // ============================================
  const addSession = useCallback(
    async (formData: SessionFormData) => {
      try {
        const response = await createTimetable(formData);
        
        // استخراج البيانات من الـ response
        const added = response.data;
        let sessionToAdd: Session = {
          _id: added._id,
          sessionDate: added.sessionDate,
          day: added.day,
          startHour: added.startHour,
          endHour: added.endHour,
          note: added.note,
          description: added.description,
          sessionType: added.sessionType,
          groupId: typeof added.groupId === 'object' ? added.groupId?._id : added.groupId,
          teacherId: added.teacherId,
          sectionId: typeof added.sectionId === 'object' ? added.sectionId?._id : added.sectionId,
        };
        const currentUser = getCurrentUser();
        
        if (typeof sessionToAdd.teacherId === 'string' && currentUser && currentUser._id === sessionToAdd.teacherId) {
           sessionToAdd.teacherId = {
             _id: currentUser._id,
             firstName: currentUser.firstName,
             lastName: currentUser.lastName || ''
           } as any;
        }

        setSessions((prev) => [...prev, sessionToAdd]);

        const dayName = getDayNameFromDate(formData.sessionDate);
        const dateDisplay = formatDateShort(formData.sessionDate);
        
        showSuccessToast(
          `تم إضافة موعد ${formData.note || ''} يوم ${dayName} (${dateDisplay}) بنجاح ✓`
        );

        return true;
      } catch (error: any) {
        console.error("❌ خطأ في حفظ الموعد:", error);
        
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
  const editSession = useCallback(
    async (sessionId: string, formData: SessionFormData) => {
      try {
        const response = await updateTimetable(sessionId, formData);
        
        // استخراج البيانات من الـ response
        const updated = response.data;
        let sessionToUpdate: Session = {
          _id: updated._id,
          sessionDate: updated.sessionDate,
          day: updated.day,
          startHour: updated.startHour,
          endHour: updated.endHour,
          note: updated.note,
          description: updated.description,
          sessionType: updated.sessionType,
          groupId: typeof updated.groupId === 'object' ? updated.groupId?._id : updated.groupId,
          teacherId: updated.teacherId,
          sectionId: typeof updated.sectionId === 'object' ? updated.sectionId?._id : updated.sectionId,
        };
        const currentUser = getCurrentUser();
        
        if (typeof sessionToUpdate.teacherId === 'string' && currentUser && currentUser._id === sessionToUpdate.teacherId) {
           sessionToUpdate.teacherId = {
             _id: currentUser._id,
             firstName: currentUser.firstName,
             lastName: currentUser.lastName || ''
           } as any;
        }

        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? sessionToUpdate : s))
        );

        showSuccessToast("تم تحديث موعد الحلقة بنجاح ✓");

        return true;
      } catch (error: any) {
        console.error("❌ خطأ في تحديث الموعد:", error);
        
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
  const removeSession = useCallback(
    async (session: Session) => {
      const dayName = session.day || getDayNameFromDate(session.sessionDate);
      const dateDisplay = formatDateShort(session.sessionDate);
      
      const result = await showConfirmDialog(
        "تأكيد الحذف",
        `هل أنت متأكد من حذف موعد <strong>${
          session.note || "الحلقة"
        }</strong>؟<br>يوم ${dayName} (${dateDisplay}) من ${session.startHour} إلى ${
          session.endHour
        }`,
        "نعم، احذف",
        "إلغاء"
      );

      if (!result.isConfirmed) return false;

      if (session._id) {
        try {
          await deleteTimetable(session._id);
          
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
