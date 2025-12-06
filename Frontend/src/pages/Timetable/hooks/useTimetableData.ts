// ============================================================================
// useTimetableData - هوك لجلب وإدارة بيانات الجدول
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { getAllSessions } from "@/Api/TimeTable.Api";
import type { Session } from "../types/timetable.types";
import { getCurrentUser, getUserRole } from "../utils/timetableHelpers";

export const useTimetableData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);

  const user = getCurrentUser();
  const role = getUserRole();

  // جلب الحصص من الـ API - Backend يقوم بالفلترة
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllSessions();
      
      // Backend يرجع البيانات مفلترة حسب المستخدم
      if (!Array.isArray(response) && response.success) {
        setSessions(response.timetables || []);
        setTeacherGroups(response.teacherGroups || []);
      } else {
        // Fallback للـ API القديم
        const data = Array.isArray(response) ? response : [];
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError("حدث خطأ في تحميل الحصص");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
