// ============================================================================
// useTimetableData - هوك لجلب وإدارة بيانات الجدول
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { getAllSessions } from "../../../Api/sessionApi";
import { getAllGroups } from "../../../Api/groupApi";
import type { Session } from "../types/timetable.types";
import {
  getCurrentUser,
  getUserRole,
  getTeacherPossibleNames,
  isTeacherMatch,
} from "../utils/timetableHelpers";

export const useTimetableData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);

  const user = getCurrentUser();
  const role = getUserRole();

  // جلب الحصص من الـ API
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllSessions();
      let filteredData = Array.isArray(data) ? data : [];

      // فلترة حسب دور المستخدم
      const currentUser = getCurrentUser();
      const currentRole = getUserRole();

      if (currentRole === "student" && currentUser?.group) {
        filteredData = filteredData.filter(
          (session) => session.note === currentUser.group
        );
      } else if (currentRole === "teacher" && currentUser) {
        try {
          const groupsRes = await getAllGroups();
          if (groupsRes.success && Array.isArray(groupsRes.data)) {
            const possibleNames = getTeacherPossibleNames(currentUser);
            const teacherGroupsData = groupsRes.data.filter((group: any) => {
              return (
                group.teacher && isTeacherMatch(group.teacher, possibleNames)
              );
            });
            const teacherGroupNames = teacherGroupsData.map((g: any) => g.name);

            if (teacherGroupNames.length > 0) {
              filteredData = filteredData.filter((session) =>
                teacherGroupNames.includes(session.note)
              );
            } else {
              filteredData = [];
            }
          }
        } catch (e) {
          console.error("خطأ في جلب حلقات المعلم:", e);
          filteredData = [];
        }
      }

      setSessions(filteredData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError("حدث خطأ في تحميل الحصص");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []); // إزالة dependencies لمنع إعادة التشغيل المستمر

  // جلب حلقات المعلم
  const fetchTeacherGroups = useCallback(async () => {
    const currentUser = getCurrentUser();
    const currentRole = getUserRole();

    if (currentRole !== "teacher" || !currentUser) {
      setTeacherGroups([]);
      return;
    }

    try {
      const groupsRes = await getAllGroups();
      if (!groupsRes.success || !Array.isArray(groupsRes.data)) {
        setTeacherGroups([]);
        return;
      }

      const possibleNames = getTeacherPossibleNames(currentUser);
      const teacherGroupsData = groupsRes.data.filter((group: any) => {
        return group.teacher && isTeacherMatch(group.teacher, possibleNames);
      });

      const groupNames = teacherGroupsData
        .map((g: any) => g.name)
        .sort((a: string, b: string) => a.localeCompare(b, "ar"));

      setTeacherGroups(groupNames);
    } catch (error) {
      console.error("خطأ في جلب حلقات المعلم:", error);
      setTeacherGroups([]);
    }
  }, []); // إزالة dependencies

  useEffect(() => {
    fetchSessions();
    fetchTeacherGroups();
  }, []); // تشغيل مرة واحدة فقط عند التحميل

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
