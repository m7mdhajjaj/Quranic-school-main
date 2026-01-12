// ============================================================================
// useTimetableActions - هوك لإدارة عمليات الجدول (CRUD Operations)
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)

import { useCallback, useMemo } from "react";
import {
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from "@/Api/TimeTable.Api";
import type { Session, SessionFormData } from "../../types/timetable.types";
import { showConfirmDialog, showErrorMessage } from "@/utils/sweetalertUtils";
import { showSuccessToast } from "@/utils/toastUtils";
import { getCurrentUser, formatDateShort, getDayNameFromDate } from "../../utils";

interface UseTimetableActionsProps {
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

export const useTimetableActions = ({
  setSessions,
}: UseTimetableActionsProps) => {
  
  // ============================================
  // 🔄 Helper: تحويل Response إلى Session (DRY)
  // ============================================
  const mapResponseToSession = useMemo(() => {
    return (data: any): Session => {
      const currentUser = getCurrentUser();
      
      let session: Session = {
        _id: data._id,
        sessionDate: data.sessionDate,
        day: data.day,
        startHour: data.startHour,
        endHour: data.endHour,
        note: data.note,
        description: data.description,
        sessionType: data.sessionType,
        groupId: typeof data.groupId === 'object' ? data.groupId?._id : data.groupId,
        teacherId: data.teacherId,
        sectionId: typeof data.sectionId === 'object' ? data.sectionId?._id : data.sectionId,
      };
      
      // إذا كان المعلم هو المستخدم الحالي، استبدل الـ ID بالبيانات الكاملة
      if (typeof session.teacherId === 'string' && currentUser && currentUser._id === session.teacherId) {
        session.teacherId = {
          _id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName || ''
        } as any;
      }
      
      return session;
    };
  }, []);
  
  // ============================================
  // ➕ إضافة موعد جديد
  // ============================================
  const addSession = useCallback(
    async (formData: SessionFormData) => {
      try {
        const response = await createTimetable(formData);
        const sessionToAdd = mapResponseToSession(response.data);

        setSessions((prev) => [...prev, sessionToAdd]);

        const dayName = getDayNameFromDate(formData.sessionDate);
        const dateDisplay = formatDateShort(formData.sessionDate);
        
        showSuccessToast(
          `تم إضافة موعد ${formData.note || ''} يوم ${dayName} (${dateDisplay}) بنجاح ✓`
        );

        return true;
      } catch (error: any) {
        
        if (error?.isConflict) {
          await showErrorMessage("⚠️ تعارض في المواعيد", error.message);
          return false;
        }

        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "حدث خطأ أثناء حفظ الحلقة";

        await showErrorMessage("❌ خطأ في حفظ الموعد", errorMsg);

        return false;
      }
    },
    [setSessions, mapResponseToSession]
  );

  // ============================================
  // ✏️ تعديل موعد موجود
  // ============================================
  const editSession = useCallback(
    async (sessionId: string, formData: SessionFormData) => {
      try {
        const response = await updateTimetable(sessionId, formData);
        const sessionToUpdate = mapResponseToSession(response.data);

        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? sessionToUpdate : s))
        );

        showSuccessToast("تم تحديث موعد الحلقة بنجاح ✓");

        return true;
      } catch (error: any) {
        
        if (error?.isConflict) {
          await showErrorMessage("⚠️ تعارض في المواعيد", error.message);
          return false;
        }

        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "حدث خطأ أثناء تحديث الحلقة";

        await showErrorMessage("❌ خطأ في تحديث الموعد", errorMsg);

        return false;
      }
    },
    [setSessions, mapResponseToSession]
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
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.message ||
            error?.message ||
            "حدث خطأ أثناء حذف الحلقة";
          
          await showErrorMessage("❌ خطأ في حذف الموعد", errorMsg);
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
