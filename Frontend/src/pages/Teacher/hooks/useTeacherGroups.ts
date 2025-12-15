import { useState, useEffect, useCallback } from "react";
import { getGroupsByTeacherIdWithFilters } from "@/Api/groupApi";
import type { GroupsByTeacherResponse, GroupFilter } from "@/Api/groupApi";
import { useAuth } from "@/hooks/useAuth";

export const useTeacherGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupsByTeacherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async (filter: GroupFilter = 'all') => {
    if (!user?._id || user.role !== 'teacher') {
      setError("المستخدم غير مصرح له بالوصول");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getGroupsByTeacherIdWithFilters(
        user._id,
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
  }, [user]);

  useEffect(() => {
    if (user?._id && user.role === 'teacher') {
      fetchGroups('all'); // جلب كل الحلقات (نشطة وغير نشطة)
    }
  }, [user, fetchGroups]);

  return {
    groups,
    isLoading,
    error,
    refetch: () => fetchGroups('all'),
  };
};
