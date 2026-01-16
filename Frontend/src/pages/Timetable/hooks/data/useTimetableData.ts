// ============================================================================
// useTimetableData - هوك لجلب وإدارة بيانات الجدول من Backend
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)
// ✅ Data Validation: التحقق من صحة البيانات قبل العرض

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getTimetables } from "@/Api/TimeTable.Api";
import type { Session } from "../../types/timetable.types";
import { getCurrentUser, getUserRole, getDayNameFromDate } from "../../utils";
import { showErrorMessage } from "@/utils/sweetalertUtils";

// ============================================================================
// ✅ Helper: تحويل وتنظيف بيانات الـ API
// ============================================================================
const sanitizeSession = (t: any): Session | null => {
  try {
    // التحقق من وجود البيانات الأساسية (sessionDate أو day مطلوب)
    if (!t._id || !t.startHour || !t.endHour) {
      return null;
    }

    // ✅ التحقق: إما sessionDate أو day يجب أن يكون موجود
    if (!t.sessionDate && !t.day) {
      return null;
    }

    // التحقق من صحة التاريخ (إذا موجود)
    let sessionDateStr = t.sessionDate;
    if (sessionDateStr) {
      const sessionDate = new Date(sessionDateStr);
      if (isNaN(sessionDate.getTime())) {
        sessionDateStr = null; // سيتم استخدام day بدلاً منه
      }
    }

    // تنظيف وتنسيق البيانات
    return {
      _id: t._id,
      sessionDate: sessionDateStr || '', // قد يكون فارغ للمواعيد المتكررة
      day: t.day || (sessionDateStr ? getDayNameFromDate(sessionDateStr) : ''),
      startHour: t.startHour?.trim() || '',
      endHour: t.endHour?.trim() || '',
      note: t.note?.trim() || '',
      description: t.description?.trim() || '',
      sessionType: t.sessionType || 'both',
      groupId: typeof t.groupId === 'object' ? t.groupId?._id : t.groupId,
      groupName: typeof t.groupId === 'object' ? t.groupId?.name : t.note,
      teacherId: t.teacherId,
      sectionId: typeof t.sectionId === 'object' ? t.sectionId?._id : t.sectionId,
      sectionDetails: t.sectionDetails || undefined,
      sectionInfo: t.sectionId ? {
        memorizationSection: t.sectionId?.memorizationSection,
        reviewSection: t.sectionId?.reviewSection,
        marksStatus: t.sectionId?.marksStatus,
      } : undefined,
    };
  } catch (error) {
    return null;
  }
};

export const useTimetableData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  
  // ✅ Ref لتتبع حالة الـ mount
  const isMountedRef = useRef<boolean>(true);
  const fetchInProgressRef = useRef<boolean>(false);

  // ✅ Memoize user & role لمنع إعادة حسابهم
  const user = useMemo(() => getCurrentUser(), []);
  const role = useMemo(() => getUserRole(), []);

  // ============================================
  // 📡 جلب الحصص من الـ Backend API
  // ============================================
  const fetchSessions = useCallback(async () => {
    // ✅ منع الـ fetch المتزامن
    if (fetchInProgressRef.current) {
      return;
    }
    
    fetchInProgressRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      // جلب المواعيد
      const response = await getTimetables();
      
      // ✅ تحقق إذا كان الـ component لا يزال mounted
      if (!isMountedRef.current) {
        return;
      }
      
      if (response.success && response.data) {
        // ✅ تحويل وتنظيف البيانات مع validation
        const sessionsData = response.data
          .map(sanitizeSession)
          .filter((s): s is Session => s !== null);
        
        setSessions(sessionsData);
        setLastFetch(new Date());
        
        // استخراج أسماء الحلقات للمعلم
        const groupNames = [...new Set(sessionsData.map((s) => s.note).filter(Boolean))] as string[];
        setTeacherGroups(groupNames);
      } else {
        setSessions([]);
      }
    } catch (error: any) {
      // ✅ تجاهل إذا كان الـ component unmounted
      if (!isMountedRef.current) {
        return;
      }
      
      const errorMsg = error?.response?.data?.message || error?.message || "حدث خطأ في تحميل الحصص";
      setError(errorMsg);
      await showErrorMessage("❌ خطأ في تحميل البيانات", errorMsg);
      setSessions([]);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      fetchInProgressRef.current = false;
    }
  }, []);

  // جلب البيانات عند التحميل الأول
  useEffect(() => {
    isMountedRef.current = true;
    fetchSessions();
    
    // ✅ Cleanup: تحديث حالة الـ mount
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchSessions]);

  return {
    sessions,
    setSessions,
    loading,
    error,
    teacherGroups,
    user,
    role,
    lastFetch,
    refetchSessions: fetchSessions,
  };
};
