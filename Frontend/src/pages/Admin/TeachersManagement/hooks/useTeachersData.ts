import { useState, useEffect, useCallback } from "react";
import { getAllTeachers } from "@/Api/teacherApi";
import type { Teacher, ApiStats } from "../types";

export const useTeachersData = (hasPermission: boolean) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [apiStats] = useState<ApiStats | null>(null);

  const fetchTeachers = useCallback(async (retryAttempt = 0) => {
    setIsLoading(true);
    setError(null);
    setRetryCount(retryAttempt);

    try {
      const result = await getAllTeachers();

      if (result.success && result.data) {
        console.log(`✅ تم تحميل ${result.data.length} معلم بنجاح`);
        setTeachers(result.data);
        setError(null);
        setRetryCount(0);
      } else {
        throw new Error(result.message || "فشل في تحميل بيانات المعلمين");
      }
    } catch (error: unknown) {
      console.error("خطأ في تحميل المعلمين:", error);

      let errorMessage = "حدث خطأ في تحميل البيانات";

      if (error instanceof Error) {
        if (
          error.message.includes("Network Error") ||
          error.message.includes("ERR_CONNECTION_REFUSED")
        ) {
          errorMessage =
            "لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم الخلفي على البورت 5005";
        } else {
          errorMessage = error.message || "خطأ غير محدد";
        }
      }

      setError(errorMessage);
      setTeachers([]);
      console.log("❌ فشل في تحميل بيانات المعلمين:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    fetchTeachers();
  }, [hasPermission, fetchTeachers]);

  return {
    teachers,
    setTeachers,
    isLoading,
    error,
    retryCount,
    apiStats,
    fetchTeachers,
  };
};
