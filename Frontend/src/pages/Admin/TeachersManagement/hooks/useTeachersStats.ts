import { useMemo } from "react";
import type { Teacher, TeacherStats, ApiStats } from "../types";

export const useTeachersStats = (
  teachers: Teacher[],
  apiStats: ApiStats | null
): TeacherStats => {
  return useMemo(() => {
    // إذا كانت الإحصائيات موجودة من الـ API، استخدمها
    if (apiStats) {
      return {
        total: apiStats.total || teachers.length,
        male: apiStats.male || teachers.filter((t) => t.gender === "ذكر").length,
        female: apiStats.female || teachers.filter((t) => t.gender === "أنثى").length,
        withGroups: apiStats.withGroups || teachers.filter(
          (t) => t.groups && Array.isArray(t.groups) && t.groups.length > 0
        ).length,
        withoutGroups: apiStats.withoutGroups || (teachers.length - (apiStats.withGroups || 0)),
        avgAge: apiStats.avgAge || (
          teachers.length > 0
            ? (
                teachers.reduce((sum, t) => sum + (t.age || 0), 0) / teachers.length
              ).toFixed(1)
            : "0"
        ),
      };
    }

    // Fallback: حساب الإحصائيات من البيانات المحلية
    const maleCount = teachers.filter((t) => t.gender === "ذكر").length;
    const femaleCount = teachers.filter((t) => t.gender === "أنثى").length;
    const withGroupsCount = teachers.filter(
      (t) => t.groups && Array.isArray(t.groups) && t.groups.length > 0
    ).length;
    const withoutGroupsCount = teachers.length - withGroupsCount;
    const avgAge =
      teachers.length > 0
        ? (
            teachers.reduce((sum, t) => sum + (t.age || 0), 0) / teachers.length
          ).toFixed(1)
        : "0";

    return {
      total: teachers.length,
      male: maleCount,
      female: femaleCount,
      withGroups: withGroupsCount,
      withoutGroups: withoutGroupsCount,
      avgAge,
    };
  }, [teachers, apiStats]);
};
