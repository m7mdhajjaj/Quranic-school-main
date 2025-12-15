import { useState, useEffect, useCallback } from "react";
import { getAllTeachers, getTeacherStats } from "@/Api/teacherApi";
import type { Teacher, ApiStats, TeacherFiltersParams } from "../types";
import { useTeachersSocket } from "@/Socket/StatusSocket";

export const useTeachersData = (hasPermission: boolean) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);

  // تحديث حالة المعلم لحظياً عند تغيير حالته
  const handleTeacherStatusChange = useCallback((data: { userId: string; isActive: boolean; lastSeen: string }) => {
    console.log('🔄 Updating teacher status:', data);
    
    setTeachers(prevTeachers => 
      prevTeachers.map(teacher => 
        teacher._id === data.userId 
          ? { ...teacher, isActive: data.isActive, lastSeen: new Date(data.lastSeen) }
          : teacher
      )
    );
  }, []);

  // استخدام Socket للتحديثات اللحظية
  useTeachersSocket(handleTeacherStatusChange);

  const fetchTeachers = useCallback(async (retryAttempt = 0, filters?: TeacherFiltersParams) => {
    setIsLoading(true);
    setError(null);
    setRetryCount(retryAttempt);

    try {
      const startTime = performance.now();
      
      // جلب المعلمين والإحصائيات بالتوازي
      const [teachersResult, statsResult] = await Promise.all([
        getAllTeachers(filters),
        getTeacherStats()
      ]);

      if (teachersResult.success && teachersResult.data) {
        const duration = (performance.now() - startTime).toFixed(2);
        console.log(`✅ تم تحميل ${teachersResult.data.length} معلم بنجاح في ${duration}ms`);
        setTeachers(teachersResult.data);
        
        // حفظ الإحصائيات من الـ API
        if (statsResult.success && statsResult.data) {
          setApiStats(statsResult.data as ApiStats);
        }
        
        setError(null);
        setRetryCount(0);
      } else {
        throw new Error(teachersResult.message || "فشل في تحميل بيانات المعلمين");
      }
    } catch (error: unknown) {
      console.error("خطأ في تحميل المعلمين:", error);

      if (error instanceof Error && (error.name === "AbortError" || error.message === "canceled")) {
        setIsLoading(false);
        return;
      }

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
    onTeacherStatusChange: handleTeacherStatusChange, // expose for manual updates
  };
};
