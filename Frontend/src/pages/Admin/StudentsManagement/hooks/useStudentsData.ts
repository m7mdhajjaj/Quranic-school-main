import { useState, useEffect, useCallback } from "react";
import {
  getAllStudents,
  getStudentStats,
  type Student as ApiStudent,
} from "@/Api/studentApi";
import type { Student, ApiStats } from "../types";

export const useStudentsData = (hasPermission: boolean) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      const result = await getAllStudents(filters);

      if (!result.success || !result.data) {
        throw new Error(result.message || "البيانات المستلمة غير صحيحة");
      }

      // Optimize: avoid unnecessary spread and map operations
      const cleanedStudents = result.data.map((student: ApiStudent) => {
        // Only add defaults for missing fields
        const cleaned: any = { ...student };
        if (!cleaned.firstName) cleaned.firstName = "";
        if (!cleaned.lastName) cleaned.lastName = "";
        if (!cleaned.fatherName) cleaned.fatherName = "";
        if (!cleaned.idNumber) cleaned.idNumber = "";
        if (!cleaned.teacher) cleaned.teacher = "غير محدد";
        if (!cleaned.group) cleaned.group = "غير محدد";
        if (!cleaned.gender) cleaned.gender = "غير محدد";
        if (!cleaned.age) cleaned.age = 0;
        return cleaned;
      });

      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`✅ تم تحميل ${cleanedStudents.length} طالب بنجاح في ${duration}ms`);
      
      setStudents(cleanedStudents);
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
    const loadStats = async () => {
      try {
        const result = await getStudentStats();
        if (result.success && result.data) {
          setApiStats(result.data);
        }
      } catch (error) {
        console.error("❌ خطأ في تحميل الإحصائيات:", error);
      }
    };
    if (students.length > 0) {
      loadStats();
    }
  }, [students.length]);

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
