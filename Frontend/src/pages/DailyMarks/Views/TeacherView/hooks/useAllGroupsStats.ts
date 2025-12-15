import { useMemo } from "react";
import { useGroupStats } from "../../../hooks/useGroupStats";

/**
 * Custom hook لجلب إحصائيات جميع الحلقات بشكل متوازي
 * يستخدم useGroupStats الموجود مسبقاً لكل حلقة
 */
export const useAllGroupsStats = (
  teacherGroups: string[],
  selectedGroup: string | null,
  selectedMonth: number | null,
  selectedYear: number | null
) => {
  // جلب إحصائيات كل الحلقات بشكل موحد
  const groupsStats = teacherGroups.reduce((acc, group) => {
    // استخدام hook مشترك لكل حلقة
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { stats, loading } = useGroupStats(
      group,
      selectedMonth,
      selectedYear,
      !selectedGroup || selectedGroup === 'all'
    );
    
    acc[group] = {
      studentsCount: stats?.studentsCount || 0,
      sectionsCount: stats?.sectionsCount || 0,
      loading,
    };
    
    return acc;
  }, {} as Record<string, { studentsCount: number; sectionsCount: number; loading: boolean }>);

  // دمج الحلقات مع إحصائياتها
  const groupsWithStats = useMemo(() => {
    return teacherGroups.map((group) => {
      const stats = groupsStats[group] || { studentsCount: 0, sectionsCount: 0, loading: false };
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
  const isAnyGroupLoading = Object.values(groupsStats).some(stat => stat.loading);

  return {
    groupsWithStats,
    isAnyGroupLoading,
  };
};
