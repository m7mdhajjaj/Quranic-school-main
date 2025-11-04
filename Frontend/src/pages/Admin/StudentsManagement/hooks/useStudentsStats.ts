import { useMemo } from "react";
import type { Student, StudentStats, ApiStats } from "../types";

export const calculateStats = (
  students: Student[],
  apiStats: ApiStats | null
): StudentStats => {
  const maleCount = students.filter((s) => s.gender === "ذكر").length;
  const femaleCount = students.filter((s) => s.gender === "أنثى").length;
  const avgAge =
    students.length > 0
      ? (
          students.reduce((sum, s) => sum + (s.age || 0), 0) / students.length
        ).toFixed(1)
      : 0;

  const withGroupCount = students.filter(
    (s) =>
      s.group &&
      s.group.trim() !== "" &&
      s.group.toLowerCase() !== "غير محدد" &&
      s.group.toLowerCase() !== "undefined" &&
      s.group !== null
  ).length;
  const withoutGroupCount = students.length - withGroupCount;

  if (apiStats) {
    const apiActiveStudents = apiStats.activeStudents || withGroupCount;
    const apiInactiveStudents =
      (apiStats.totalStudents || students.length) - apiActiveStudents;

    return {
      total: apiStats.totalStudents || students.length,
      male: apiStats.maleStudents || maleCount,
      female: apiStats.femaleStudents || femaleCount,
      active: apiActiveStudents,
      inactive: apiInactiveStudents,
      avgAge: avgAge,
    };
  }

  return {
    total: students.length,
    male: maleCount,
    female: femaleCount,
    active: withGroupCount,
    inactive: withoutGroupCount,
    avgAge,
  };
};

export const useStudentsStats = (
  students: Student[],
  apiStats: ApiStats | null
) => {
  return useMemo(
    () => calculateStats(students, apiStats),
    [students, apiStats]
  );
};
