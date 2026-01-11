// ============================================================================
// useStudentsData - Hook لجلب بيانات الطلاب
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { getAllStudents } from "@/Api/studentApi";
import type { Student, StudentsQueryParams } from "@/types/student.types";

export const useStudentsData = (
  queryParams: StudentsQueryParams = {},
  autoRefresh = true
) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllStudents(queryParams);

      if (result.success && result.data) {
        setStudents(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.message || "فشل في جلب الطلاب");
      }
    } catch (err: any) {
      setError(err?.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchStudents();

    if (autoRefresh) {
      const interval = setInterval(fetchStudents, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchStudents, autoRefresh]);

  return {
    students,
    loading,
    error,
    pagination,
    refetch: fetchStudents,
  };
};
