import { useState, useEffect, useCallback } from "react";
import { getGroupsByTeacherIdWithFilters } from "@/Api/groupApi";
import type { GroupsByTeacherResponse, GroupFilter } from "@/Api/groupApi";
import { useAuth } from "@/hooks/useAuth";

export const useTeacherGroups = () => {
  const { user } = useAuth();
  const teacherId = user?._id;
  const role = user?.role;
  const [groups, setGroups] = useState<GroupsByTeacherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async (filter: GroupFilter = 'all') => {
    if (!teacherId || role !== 'teacher') {
      setError("المستخدم غير مصرح له بالوصول");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getGroupsByTeacherIdWithFilters(
        teacherId,
        filter,
        false // لا نحتاج بيانات الطلاب في القائمة الرئيسية
      );

      if (!result.success || !result.data) {
        throw new Error(result.message || "فشل في جلب الحلقات");
      }

      setGroups(result.data);
      setError(null);
    } catch (err) {
      console.error("❌ خطأ في جلب حلقات المعلم:", err);
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء جلب الحلقات";
      setError(errorMessage);
      setGroups(null);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId, role]);

  useEffect(() => {
    if (teacherId && role === 'teacher') {
      fetchGroups('all'); // جلب كل الحلقات (نشطة وغير نشطة)
    }
  }, [teacherId, role, fetchGroups]);

  return {
    groups,
    isLoading,
    error,
    refetch: () => fetchGroups('all'),
  };
};
