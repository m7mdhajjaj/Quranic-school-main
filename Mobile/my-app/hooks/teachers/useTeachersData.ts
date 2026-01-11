// ============================================================================
// useTeachersData - Hook لإدارة بيانات المعلمين
// ============================================================================

import { useState, useCallback, useRef } from "react";
import { getAllTeachers } from "@/Api/teacherApi";
import type { Teacher, TeachersQueryParams } from "@/types/teacher.types";

export const useTeachersData = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const fetchTeachers = useCallback(async (params?: TeachersQueryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("📡 جلب المعلمين مع فلاتر:", params);
      const response = await getAllTeachers(params);

      if (response.success && response.data) {
        console.log("✅ تم جلب المعلمين:", response.data.length);
        setTeachers(response.data);
      } else {
        console.error("❌ فشل جلب المعلمين:", response.message);
        setError(response.message || "فشل في جلب المعلمين");
        setTeachers([]);
      }
    } catch (err: any) {
      console.error("❌ خطأ في جلب المعلمين:", err);
      setError(err?.message || "حدث خطأ غير متوقع");
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    teachers,
    setTeachers,
    isLoading,
    error,
    fetchTeachers,
    initialLoadDone,
  };
};
