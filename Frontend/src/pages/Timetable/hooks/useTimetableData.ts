// ============================================================================
// useTimetableData - هوك لجلب وإدارة بيانات الجدول من Backend
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)

import { useState, useEffect, useCallback } from "react";
import { getTimetables } from "@/Api/TimeTable.Api";
import type { Session } from "../types/timetable.types";
import { getCurrentUser, getUserRole } from "../utils";

export const useTimetableData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);

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
        console.log(`📅 تم جلب ${response.data.length} موعد من الباك إند`);
        // ⚠️ تحويل Timetable[] إلى Session[]
        const sessionsData = response.data.map((t: any) => ({
          _id: t._id,
          sessionDate: t.sessionDate,
          day: t.day,
          startHour: t.startHour,
          endHour: t.endHour,
          note: t.note,
          description: t.description,
          sessionType: t.sessionType,
          groupId: typeof t.groupId === 'object' ? t.groupId?._id : t.groupId,
          // ✅ استخراج اسم الحلقة بشكل صحيح
          groupName: typeof t.groupId === 'object' ? t.groupId?.name : t.note,
          teacherId: t.teacherId,
          sectionId: typeof t.sectionId === 'object' ? t.sectionId?._id : t.sectionId,
          // ✅ معلومات المقطع المُحسّنة من Backend
          sectionDetails: t.sectionDetails || null,
          sectionInfo: t.sectionId ? {
            memorizationSection: t.sectionId?.memorizationSection,
            reviewSection: t.sectionId?.reviewSection,
            marksStatus: t.sectionId?.marksStatus,
          } : null,
        }));
        setSessions(sessionsData);
        
        // استخراج أسماء الحلقات للمعلم
        const groupNames = [...new Set(sessionsData.map((s: any) => s.note).filter(Boolean))] as string[];
        setTeacherGroups(groupNames);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("❌ Error fetching sessions:", error);
      setError("حدث خطأ في تحميل الحصص");
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
    refetchSessions: fetchSessions,
  };
};
