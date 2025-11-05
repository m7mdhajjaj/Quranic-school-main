import { useState, useCallback, useRef } from "react";
import { getAllTeachers } from "@/Api/teacherApi";
import type { Group } from "../types";

export const useTeachers = (groups: Group[]) => {
  const [allTeachers, setAllTeachers] = useState<string[]>([]);
  const teachersFetched = useRef(false);

  // Fetch all teachers for filter dropdown
  const fetchTeachers = useCallback(async () => {
    if (teachersFetched.current) return; // Prevent multiple fetches

    try {
      console.log("🔍 بدء جلب المعلمين للفلتر...");
      const result = await getAllTeachers();
      console.log("📊 نتيجة جلب المعلمين:", result);

      if (result.success && result.data && Array.isArray(result.data)) {
        console.log("✅ عدد المعلمين:", result.data.length);

        if (result.data.length === 0) {
          console.warn("⚠️ لا يوجد معلمين في قاعدة البيانات");
          teachersFetched.current = true;
          return;
        }

        // استخراج أسماء المعلمين: firstName + lastName
        const teacherNames = result.data
          .map((teacher: any) => {
            // جرب مختلف التنسيقات
            if (teacher.name) return teacher.name;
            if (teacher.firstName && teacher.lastName) {
              return `${teacher.firstName} ${teacher.lastName}`;
            }
            if (teacher.firstName) return teacher.firstName;
            return null;
          })
          .filter(Boolean)
          .sort();

        console.log("📝 أسماء المعلمين:", teacherNames);
        setAllTeachers(teacherNames);
        teachersFetched.current = true;
      } else {
        console.warn("⚠️ استجابة غير صالحة من الخادم:", result);
        teachersFetched.current = true;
      }
    } catch (error) {
      console.error("❌ خطأ في جلب المعلمين:", error);
      teachersFetched.current = true;
    }
  }, []);

  // Fallback: Use teachers from groups if API returns empty
  const fallbackToGroupTeachers = useCallback(() => {
    if (
      teachersFetched.current &&
      allTeachers.length === 0 &&
      groups.length > 0
    ) {
      const teachersFromGroups = [
        ...new Set(groups.map((g) => g.teacher).filter(Boolean)),
      ].sort();
      if (teachersFromGroups.length > 0) {
        console.log(
          "📋 استخدام المعلمين من الحلقات كخطة احتياطية:",
          teachersFromGroups
        );
        setAllTeachers(teachersFromGroups);
      }
    }
  }, [allTeachers.length, groups]);

  return {
    allTeachers,
    fetchTeachers,
    fallbackToGroupTeachers,
  };
};
