// ============================================================================
// useTimetableData - هوك لجلب وإدارة بيانات الجدول من Backend
// ============================================================================
// يجلب الحصص من الـ API مع الفلترة التلقائية حسب دور المستخدم:
// - الطالب: يرى حلقته فقط
// - المعلم: يرى حلقاته فقط
// - الإداري: يرى جميع الحلقات

import { useState, useEffect, useCallback } from "react";
import { getAllSessions } from "@/Api/TimeTable.Api";
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
  // Backend يقوم تلقائياً بفلترة البيانات حسب المستخدم (Student/Teacher/Admin)
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب المواعيد مع فلترة الأسبوع الحالي (الباك إند يفلتر)
      const response = await getAllSessions({ weekFilter: 'current' });
      
      // ✅ الـ API الجديد يرجع object مع success
      if (!Array.isArray(response) && response.success) {
        console.log(`📅 تم جلب ${response.timetables?.length || 0} موعد من الباك إند`);
        setSessions(response.timetables || []);
        setTeacherGroups(response.teacherGroups || []); // للمعلم: أسماء حلقاته
      } else {
        // 🔄 Fallback للـ API القديم (array مباشر)
        const data = Array.isArray(response) ? response : [];
        setSessions(data);
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
    refetchSessions: fetchSessions, // للاستدعاء يدوياً عند الحاجة
  };
};
