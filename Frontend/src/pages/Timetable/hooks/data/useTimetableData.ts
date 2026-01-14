// ============================================================================
// useTimetableData - هوك لجلب وإدارة بيانات الجدول من Backend
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)
// ✅ Data Validation: التحقق من صحة البيانات قبل العرض

import { useState, useEffect, useCallback, useMemo } from "react";
import { getTimetables } from "@/Api/TimeTable.Api";
import type { Session } from "../../types/timetable.types";
import { getCurrentUser, getUserRole, getDayNameFromDate } from "../../utils";
import { showErrorMessage } from "@/utils/sweetalertUtils";

// ============================================================================
// ✅ Helper: تحويل وتنظيف بيانات الـ API
// ============================================================================
const sanitizeSession = (t: any): Session | null => {
  try {
    // التحقق من وجود البيانات الأساسية
    if (!t._id || !t.sessionDate || !t.startHour || !t.endHour) {
      console.warn('⚠️ Session missing required fields:', t._id);
      return null;
    }

    // التحقق من صحة التاريخ
    const sessionDate = new Date(t.sessionDate);
    if (isNaN(sessionDate.getTime())) {
      console.warn('⚠️ Invalid sessionDate:', t.sessionDate);
      return null;
    }

    // تنظيف وتنسيق البيانات
    return {
      _id: t._id,
      sessionDate: t.sessionDate,
      day: t.day || getDayNameFromDate(t.sessionDate),
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
    console.error('❌ Error sanitizing session:', error);
    return null;
  }
};

export const useTimetableData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const user = getCurrentUser();
  const role = getUserRole();

  // ============================================
  // 📡 جلب الحصص من الـ Backend API
  // ============================================
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب المواعيد
      const response = await getTimetables();
      
      if (response.success && response.data) {
        // ✅ تحويل وتنظيف البيانات مع validation
        const sessionsData = response.data
          .map(sanitizeSession)
          .filter((s): s is Session => s !== null);
        
        // ⚠️ تحذير إذا تم تجاهل بعض البيانات
        const skippedCount = response.data.length - sessionsData.length;
        if (skippedCount > 0) {
          console.warn(`⚠️ Skipped ${skippedCount} invalid sessions`);
        }
        
        setSessions(sessionsData);
        setLastFetch(new Date());
        
        // استخراج أسماء الحلقات للمعلم
        const groupNames = [...new Set(sessionsData.map((s) => s.note).filter(Boolean))] as string[];
        setTeacherGroups(groupNames);
      } else {
        setSessions([]);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || "حدث خطأ في تحميل الحصص";
      setError(errorMsg);
      await showErrorMessage("❌ خطأ في تحميل البيانات", errorMsg);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب البيانات عند التحميل الأول
  useEffect(() => {
    fetchSessions();
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
