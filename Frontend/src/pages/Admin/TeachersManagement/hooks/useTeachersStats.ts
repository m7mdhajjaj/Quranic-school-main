import { useMemo } from "react";
import type { Teacher, TeacherStats, ApiStats } from "../types";

export const useTeachersStats = (
  teachers: Teacher[],
  apiStats: ApiStats | null
): TeacherStats => {
  return useMemo(() => {
    const maleCount = teachers.filter((t) => t.gender === "ذكر").length;
    const femaleCount = teachers.filter((t) => t.gender === "أنثى").length;
    const activeCount = teachers.filter((t) => t.isActive).length;
    const withGroupsCount = teachers.filter(
      (t) => t.groups && Array.isArray(t.groups) && t.groups.length > 0
    ).length;
    const withoutGroupsCount = teachers.length - withGroupsCount;
    const avgAge =
      teachers.length > 0
        ? (
            teachers.reduce((sum, t) => sum + (t.age || 0), 0) / teachers.length
          ).toFixed(1)
        : 0;

    return {
      total: teachers.length,
      active: activeCount,
      inactive: teachers.length - activeCount,
      male: maleCount,
      female: femaleCount,
      withGroups: withGroupsCount,
      withoutGroups: withoutGroupsCount,
      avgAge,
    };
  }, [teachers, apiStats]);
};
