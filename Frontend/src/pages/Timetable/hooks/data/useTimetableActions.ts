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
}: UseTimetableActionsProps) => {
  
  // ✅ Ref لحفظ الـ state السابق للـ rollback - يُحفظ قبل أي تعديل
  const previousSessionsRef = useRef<Session[]>([]);
  
  // ✅ Ref لتتبع حالة العمليات الجارية - لمنع race conditions
  const operationInProgressRef = useRef<boolean>(false);
  
  // ============================================
  // 🔄 Helper: تحويل Response إلى Session (DRY)
  // ============================================
  const mapResponseToSession = useMemo(() => {
    return (data: any): Session => {
      const currentUser = getCurrentUser();
      
      // ✅ استخراج sectionDetails من sectionId المُـpopulated
      let sectionDetails = data.sectionDetails;
      if (!sectionDetails && data.sectionId && typeof data.sectionId === 'object') {
        sectionDetails = {
          memorizationSection: data.sectionId.memorizationSection,
          reviewSection: data.sectionId.reviewSection,
          marksStatus: data.sectionId.marksStatus,
        };
      }
      
      const session: Session = {
        _id: data._id,
        sessionDate: data.sessionDate,
        day: data.day,
        startHour: data.startHour,
        endHour: data.endHour,
        note: data.note,
        description: data.description,
        sessionType: data.sessionType,
        groupId: typeof data.groupId === 'object' ? data.groupId?._id : data.groupId,
        groupName: typeof data.groupId === 'object' ? data.groupId?.name : data.note,
        teacherId: typeof data.teacherId === 'string' && currentUser && currentUser._id === data.teacherId
          ? {
              _id: currentUser._id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName || ''
            } as any
          : data.teacherId,
        sectionId: typeof data.sectionId === 'object' ? data.sectionId?._id : data.sectionId,
        sectionDetails: sectionDetails,
      };
      
      return session;
    };
  }, []);
  
  // ============================================
  // ➕ إضافة موعد جديد (Optimistic Update)
  // ============================================
  const addSession = useCallback(
    async (formData: SessionFormData) => {
      // ✅ منع العمليات المتزامنة
      if (operationInProgressRef.current) {
        console.warn('⚠️ Operation already in progress');
        return false;
      }
      operationInProgressRef.current = true;
      
      // ✅ 1. Validation قبل الإرسال
      const validation = validateSessionData(formData);
      if (!validation.isValid) {
        operationInProgressRef.current = false;
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

      // ✅ 3. حفظ الـ state الحالي قبل التعديل
      let savedPreviousSessions: Session[] = [];
      setSessions((prev) => {
        savedPreviousSessions = [...prev];
        previousSessionsRef.current = savedPreviousSessions;
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

        operationInProgressRef.current = false;
        return true;
      } catch (error: any) {
        // ❌ Rollback في حالة الخطأ - استخدام النسخة المحفوظة
        setSessions(savedPreviousSessions);
        
        if (error?.isConflict) {
          await showErrorMessage("⚠️ تعارض في المواعيد", error.message);
          operationInProgressRef.current = false;
          return false;
        }

        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "حدث خطأ أثناء حفظ الحلقة";

        await showErrorMessage("❌ خطأ في حفظ الموعد", errorMsg);

        operationInProgressRef.current = false;
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
      // ✅ منع العمليات المتزامنة
      if (operationInProgressRef.current) {
        console.warn('⚠️ Operation already in progress');
        return false;
      }
      operationInProgressRef.current = true;
      
      // ✅ 1. Validation قبل الإرسال
      const validation = validateSessionData(formData);
      if (!validation.isValid) {
        operationInProgressRef.current = false;
        await showErrorMessage("❌ بيانات غير صحيحة", validation.errors.join('\n'));
        return false;
      }

      // ✅ 2. حفظ الـ state الحالي قبل التعديل - خارج الـ setState callback
      let savedPreviousSessions: Session[] = [];
      setSessions((prev) => {
        savedPreviousSessions = [...prev];
        previousSessionsRef.current = savedPreviousSessions;
        
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

        operationInProgressRef.current = false;
        return true;
      } catch (error: any) {
        // ❌ Rollback في حالة الخطأ - استخدام النسخة المحفوظة
        setSessions(savedPreviousSessions);
        
        if (error?.isConflict) {
          await showErrorMessage("⚠️ تعارض في المواعيد", error.message);
          operationInProgressRef.current = false;
          return false;
        }

        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "حدث خطأ أثناء تحديث الحلقة";

        await showErrorMessage("❌ خطأ في تحديث الموعد", errorMsg);

        operationInProgressRef.current = false;
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
      // ✅ منع العمليات المتزامنة
      if (operationInProgressRef.current) {
        console.warn('⚠️ Operation already in progress');
        return false;
      }
      
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
        operationInProgressRef.current = true;
        
        // ✅ 1. حفظ الـ state الحالي قبل التعديل
        let savedPreviousSessions: Session[] = [];
        setSessions((prev) => {
          savedPreviousSessions = [...prev];
          previousSessionsRef.current = savedPreviousSessions;
          // ✅ 2. Optimistic Delete
          return prev.filter((s) => s._id !== session._id);
        });

        try {
          // ✅ 3. إرسال للـ Server
          await deleteTimetable(session._id);

          showSuccessToast("تم حذف الموعد بنجاح ✓");

          operationInProgressRef.current = false;
          return true;
        } catch (error: any) {
          // ❌ Rollback في حالة الخطأ - استخدام النسخة المحفوظة
          setSessions(savedPreviousSessions);
          
          const errorMsg =
            error?.response?.data?.message ||
            error?.message ||
            "حدث خطأ أثناء حذف الحلقة";
          
          await showErrorMessage("❌ خطأ في حذف الموعد", errorMsg);
          operationInProgressRef.current = false;
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
