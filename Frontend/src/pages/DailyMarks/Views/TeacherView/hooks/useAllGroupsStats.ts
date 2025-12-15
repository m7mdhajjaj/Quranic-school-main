import { useState, useEffect, useMemo } from "react";
import { getGroupStats } from "@/Api/dailyMarksApi";

interface GroupStatsData {
  studentsCount: number;
  sectionsCount: number;
  loading: boolean;
}

/**
 * Custom hook لجلب إحصائيات جميع الحلقات بشكل متوازي
 * يستخدم useEffect و useState لجلب البيانات بشكل صحيح
 */
export const useAllGroupsStats = (
  teacherGroups: string[],
  selectedGroup: string | null,
  selectedMonth: number | null,
  selectedYear: number | null
) => {
  const [groupsStats, setGroupsStats] = useState<
    Record<string, GroupStatsData>
  >({});

  // جلب إحصائيات كل الحلقات بشكل متوازي
  useEffect(() => {
    // لا تجلب إذا كان هناك group محدد
    if (selectedGroup && selectedGroup !== "all") {
      setGroupsStats({});
      return;
    }

    // لا تجلب إذا لم تكن هناك حلقات
    if (!teacherGroups || teacherGroups.length === 0) {
      setGroupsStats({});
      return;
    }

    let isMounted = true;

    // جلب إحصائيات كل الحلقات بشكل متوازي
    const fetchAllStats = async () => {
      // تعيين loading state لكل حلقة
      setGroupsStats((prev) => {
        const newStats: Record<string, GroupStatsData> = {};
        teacherGroups.forEach((group) => {
          newStats[group] = {
            studentsCount: prev[group]?.studentsCount || 0,
            sectionsCount: prev[group]?.sectionsCount || 0,
            loading: true,
          };
        });
        return newStats;
      });

      try {
        // جلب كل الإحصائيات بشكل متوازي
        const statsPromises = teacherGroups.map(async (group) => {
          try {
            const response = await getGroupStats(
              group,
              selectedMonth || undefined,
              selectedYear || undefined
            );

            if (!isMounted) return null;

            if (response.success && response.data) {
              return {
                group,
                studentsCount: response.data.studentsCount,
                sectionsCount: response.data.sectionsCount,
              };
            }
            return {
              group,
              studentsCount: 0,
              sectionsCount: 0,
            };
          } catch (error) {
            console.error(`❌ Error fetching stats for group ${group}:`, error);
            return {
              group,
              studentsCount: 0,
              sectionsCount: 0,
            };
          }
        });

        const results = await Promise.all(statsPromises);

        if (!isMounted) return;

        // تحديث الإحصائيات
        const newStats: Record<string, GroupStatsData> = {};
        results.forEach((result) => {
          if (result) {
            newStats[result.group] = {
              studentsCount: result.studentsCount,
              sectionsCount: result.sectionsCount,
              loading: false,
            };
          }
        });

        setGroupsStats(newStats);
      } catch (error) {
        console.error("❌ Error fetching all groups stats:", error);
        if (isMounted) {
          setGroupsStats((prev) => {
            const newStats: Record<string, GroupStatsData> = {};
            teacherGroups.forEach((group) => {
              newStats[group] = {
                studentsCount: prev[group]?.studentsCount || 0,
                sectionsCount: prev[group]?.sectionsCount || 0,
                loading: false,
              };
            });
            return newStats;
          });
        }
      }
    };

    fetchAllStats();

    return () => {
      isMounted = false;
    };
  }, [teacherGroups, selectedGroup, selectedMonth, selectedYear]);

  // دمج الحلقات مع إحصائياتها
  const groupsWithStats = useMemo(() => {
    return teacherGroups.map((group) => {
      const stats = groupsStats[group] || {
        studentsCount: 0,
        sectionsCount: 0,
        loading: false,
      };
      return {
        name: group,
        studentsCount: stats.studentsCount || 0,
        sectionsCount: stats.sectionsCount || 0,
        hasStudents: stats.studentsCount > 0,
        loading: stats.loading,
      };
    });
  }, [teacherGroups, groupsStats]);

  // التحقق إذا كان أي حلقة ما زالت تحمل
  const isAnyGroupLoading = useMemo(() => {
    return Object.values(groupsStats).some((stat) => stat.loading);
  }, [groupsStats]);

  return {
    groupsWithStats,
    isAnyGroupLoading,
  };
};
