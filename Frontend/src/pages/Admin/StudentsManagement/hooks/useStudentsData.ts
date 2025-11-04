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

  const fetchStudents = useCallback(async (retryAttempt = 0) => {
    setIsLoading(true);
    setError(null);
    setRetryCount(retryAttempt);

    try {
      const startTime = performance.now();
      const result = await getAllStudents();

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      if (result.success && result.data) {
        const cleanedStudents = result.data.map((student: ApiStudent) => ({
          ...student,
          firstName: student.firstName || "",
          lastName: student.lastName || "",
          fatherName: student.fatherName || "",
          idNumber: student.idNumber || "",
          teacher: student.teacher || "غير محدد",
          group: student.group || "غير محدد",
          gender: student.gender || "غير محدد",
          age: student.age || 0,
        }));

        console.log(
          `✅ تم تحميل ${cleanedStudents.length} طالب بنجاح في ${duration}ms`
        );
        setStudents(cleanedStudents);
        setError(null);
        setRetryCount(0);
      } else {
        throw new Error(result.message || "البيانات المستلمة غير صحيحة");
      }
    } catch (error: unknown) {
      console.error("❌ خطأ في تحميل الطلاب:", error);
      let errorMessage = "حدث خطأ في تحميل البيانات";

      if (error instanceof Error) {
        if (error.name === "AbortError" || error.message === "canceled") {
          setIsLoading(false);
          return;
        } else {
          errorMessage = error.message || "خطأ غير محدد";
        }
      }

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
