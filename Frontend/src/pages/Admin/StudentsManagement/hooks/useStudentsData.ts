import { useState, useEffect, useCallback } from "react";
import {
  getAllStudents,
  getStudentStats,
} from "@/Api/studentApi";
import type { Student, ApiStats } from "../types";

export const useStudentsData = (hasPermission: boolean) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);

  const fetchStudents = useCallback(async (retryAttempt = 0, filters?: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
    group?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    setIsLoading(true);
    setError(null);
    setRetryCount(retryAttempt);

    try {
      const startTime = performance.now();
      
      // Load students and stats in parallel
      const [studentsResult, statsResult] = await Promise.all([
        getAllStudents(filters),
        getStudentStats()
      ]);

      if (!studentsResult.success || !studentsResult.data) {
        throw new Error(studentsResult.message || "البيانات المستلمة غير صحيحة");
      }

      // Update stats immediately
      if (statsResult.success && statsResult.data) {
        setApiStats(statsResult.data);
      }

      // Backend sends clean data with defaults - no need to process
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`✅ تم تحميل ${studentsResult.data.length} طالب بنجاح في ${duration}ms`);
      
      setStudents(studentsResult.data);
      setError(null);
      setRetryCount(0);
    } catch (error: unknown) {
      console.error("❌ خطأ في تحميل الطلاب:", error);
      
      if (error instanceof Error && (error.name === "AbortError" || error.message === "canceled")) {
        setIsLoading(false);
        return;
      }

      const errorMessage = error instanceof Error ? error.message : "حدث خطأ في تحميل البيانات";
      setError(errorMessage);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    fetchStudents();
  }, [hasPermission, fetchStudents]);

  return {
    students,
    setStudents,
    isLoading,
    error,
    retryCount,
    apiStats,
    fetchStudents,
  };
};
