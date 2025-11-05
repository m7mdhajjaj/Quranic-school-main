import { useState, useCallback, useRef } from "react";
import { getAllGroups, type Group } from "@/Api/groupApi";

export const useGroupsData = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  // Fetch groups with optimized loading and student count
  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🚀 بدء تحميل بيانات الحلقات مع عدد الطلاب المحسن...");
      const startTime = performance.now();

      const result = await getAllGroups();

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      if (result.success && result.data) {
        const cleanedGroups = result.data.map(
          (group: Group & { teacherName?: string }) => ({
            ...group,
            name: group.name || "",
            // دعم البيانات القديمة: استخدم teacherName إذا كان teacher غير موجود
            teacher: group.teacher || group.teacherName || "غير محدد",
            capacity: group.capacity || 30,
            description: group.description || "",
            schedule: group.schedule || "غير محدد",
            isActive: group.isActive !== false,
            currentStudents: group.currentStudents || 0, // عدد الطلاب المشتركين
          })
        );
        const totalStudents = cleanedGroups.reduce(
          (sum, g) => sum + (g.currentStudents || 0),
          0
        );

        console.log(
          `✅ تم تحميل ${cleanedGroups.length} حلقة مع ${totalStudents} طالب مشترك في ${duration}ms`
        );
        console.log(
          `⚡ سرعة التحميل: ${(
            (cleanedGroups.length / parseFloat(duration)) *
            1000
          ).toFixed(0)} حلقة/ثانية`
        );
        console.log("📊 إحصائيات سريعة:", {
          totalGroups: cleanedGroups.length,
          totalStudents,
          avgStudentsPerGroup: (totalStudents / cleanedGroups.length).toFixed(
            1
          ),
        });

        setGroups(cleanedGroups);
        setError(null);
      } else {
        throw new Error(result.message || "البيانات المستلمة غير صحيحة");
      }
    } catch (error: unknown) {
      console.error(`❌ خطأ في تحميل الحلقات:`, error);

      let errorMessage = "حدث خطأ في تحميل البيانات";

      if (error instanceof Error) {
        errorMessage = error.message || "خطأ غير محدد";
      }

      setError(errorMessage);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshGroups = useCallback(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    setGroups,
    isLoading,
    error,
    fetchGroups,
    refreshGroups,
    initialLoadDone,
  };
};
