// ============================================================================
// useTimetableActions - هوك لإدارة عمليات الجدول (CRUD Operations)
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)
// ✅ Optimistic Updates: التحديث الفوري ثم التحقق من الـ Server

import { useCallback, useMemo, useRef } from "react";
import {
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from "@/Api/TimeTable.Api";
import type { Session, SessionFormData } from "../../types/timetable.types";
import { showConfirmDialog, showErrorMessage } from "@/utils/sweetalertUtils";
import { showSuccessToast } from "@/utils/toastUtils";
import { getCurrentUser, formatDateShort, getDayNameFromDate, validateSessionData } from "../../utils";

interface UseTimetableActionsProps {
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  refetchSessions?: () => Promise<void>;
}

export const useTimetableActions = ({
  setSessions,
  refetchSessions,
}: UseTimetableActionsProps) => {
  
  // ✅ Ref لحفظ الـ state السابق للـ rollback
  const previousSessionsRef = useRef<Session[]>([]);
  
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
  // ➕ إضافة موعد جديد (Optimistic Update)
  // ============================================
  const addSession = useCallback(
    async (formData: SessionFormData) => {
      // ✅ 1. Validation قبل الإرسال
      const validation = validateSessionData(formData);
      if (!validation.isValid) {
        await showErrorMessage("❌ بيانات غير صحيحة", validation.errors.join('\n'));
        return false;
      }

      // ✅ 2. إنشاء Session مؤقت للـ Optimistic Update
      const tempId = `temp_${Date.now()}`;
      const currentUser = getCurrentUser();
      const optimisticSession: Session = {
        _id: tempId,
        sessionDate: formData.sessionDate,
        day: getDayNameFromDate(formData.sessionDate),
        startHour: formData.startHour,
        endHour: formData.endHour,
        note: formData.note || '',
        description: formData.description || '',
        sessionType: formData.sessionType || 'both',
        groupId: formData.groupId,
        teacherId: currentUser ? {
          _id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName || ''
        } as any : formData.teacherId,
        sectionId: formData.sectionId,
      };

      // ✅ 3. حفظ الـ state الحالي للـ rollback
      setSessions((prev) => {
        previousSessionsRef.current = prev;
        return [...prev, optimisticSession];
      });

      try {
        // ✅ 4. إرسال للـ Server
        const response = await createTimetable(formData);
        const sessionFromServer = mapResponseToSession(response.data);

        // ✅ 5. استبدال الـ temp session بالـ real session
        setSessions((prev) =>
          prev.map((s) => (s._id === tempId ? sessionFromServer : s))
        );

        const dayName = getDayNameFromDate(formData.sessionDate);
        const dateDisplay = formatDateShort(formData.sessionDate);
        
        showSuccessToast(
          `تم إضافة موعد ${formData.note || ''} يوم ${dayName} (${dateDisplay}) بنجاح ✓`
        );

        return true;
      } catch (error: any) {
        // ❌ Rollback في حالة الخطأ
        setSessions(previousSessionsRef.current);
        
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
  // ✏️ تعديل موعد موجود (Optimistic Update)
  // ============================================
  const editSession = useCallback(
    async (sessionId: string, formData: SessionFormData) => {
      // ✅ 1. Validation قبل الإرسال
      const validation = validateSessionData(formData);
      if (!validation.isValid) {
        await showErrorMessage("❌ بيانات غير صحيحة", validation.errors.join('\n'));
        return false;
      }

      // ✅ 2. حفظ الـ state الحالي للـ rollback
      let previousSession: Session | undefined;
      setSessions((prev) => {
        previousSessionsRef.current = prev;
        previousSession = prev.find((s) => s._id === sessionId);
        
        // ✅ 3. Optimistic Update
        return prev.map((s) =>
          s._id === sessionId
            ? {
                ...s,
                sessionDate: formData.sessionDate,
                day: getDayNameFromDate(formData.sessionDate),
                startHour: formData.startHour,
                endHour: formData.endHour,
                note: formData.note || s.note,
                description: formData.description || s.description,
                sessionType: formData.sessionType || s.sessionType,
                groupId: formData.groupId || s.groupId,
              }
            : s
        );
      });

      try {
        // ✅ 4. إرسال للـ Server
        const response = await updateTimetable(sessionId, formData);
        const sessionFromServer = mapResponseToSession(response.data);

        // ✅ 5. تحديث بالبيانات الفعلية من الـ Server
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? sessionFromServer : s))
        );

        showSuccessToast("تم تحديث موعد الحلقة بنجاح ✓");

        return true;
      } catch (error: any) {
        // ❌ Rollback في حالة الخطأ
        setSessions(previousSessionsRef.current);
        
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
  // 🗑️ حذف موعد (Optimistic Update)
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
        // ✅ 1. حفظ الـ state الحالي للـ rollback
        setSessions((prev) => {
          previousSessionsRef.current = prev;
          // ✅ 2. Optimistic Delete
          return prev.filter((s) => s._id !== session._id);
        });

        try {
          // ✅ 3. إرسال للـ Server
          await deleteTimetable(session._id);

          showSuccessToast("تم حذف الموعد بنجاح ✓");

          return true;
        } catch (error: any) {
          // ❌ Rollback في حالة الخطأ
          setSessions(previousSessionsRef.current);
          
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
