import { useState, useEffect, useCallback } from "react";
import { getGroupStudents } from "@/Api/groupApi";
import type { Student } from "@/Api/studentApi";

interface UseGroupStudentsOptions {
  search?: string;
  gender?: 'ذكر' | 'أنثى' | 'male' | 'female';
}

export const useGroupStudents = (
  groupId: string | null,
  options?: UseGroupStudentsOptions
) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>("");

  const fetchStudents = useCallback(async () => {
    if (!groupId) {
      setStudents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getGroupStudents(
        groupId,
        true,
        options?.search,
        options?.gender
      );

      if (!result.success || !result.data) {
        throw new Error(result.message || "فشل في جلب الطلاب");
      }

      // تحويل البيانات إلى نوع Student
      const studentsData = (result.data.students || []) as Student[];
      setStudents(studentsData);
      setGroupName(result.data.group?.name || "");
      setError(null);
    } catch (err) {
      console.error("❌ خطأ في جلب طلاب الحلقة:", err);
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء جلب الطلاب";
      setError(errorMessage);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [groupId, options?.search, options?.gender]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    groupName,
    isLoading,
    error,
    refetch: fetchStudents,
  };
};
