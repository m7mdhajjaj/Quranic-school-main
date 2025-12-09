import { useMemo } from "react";
import type { Student, StudentStats, ApiStats } from "../types";

export const calculateStats = (
  students: Student[],
  apiStats: ApiStats | null
): StudentStats => {
  // Backend sends all stats - just use them directly
  if (apiStats) {
    return {
      total: apiStats.totalStudents || students.length,
      male: apiStats.maleStudents || 0,
      female: apiStats.femaleStudents || 0,
      active: apiStats.activeStudents || 0,
      inactive: (apiStats.totalStudents || students.length) - (apiStats.activeStudents || 0),
      avgAge: "0", // Backend should calculate this
    };
  }

  // Fallback only if no API stats (shouldn't happen)
  return {
    total: students.length,
    male: 0,
    female: 0,
    active: 0,
    inactive: students.length,
    avgAge: "0",
  };
};

export const useStudentsStats = (
  students: Student[],
  apiStats: ApiStats | null
) => {
  return useMemo(
    () => calculateStats(students, apiStats),
    [students.length, apiStats] // Only depend on length, not full array
  );
};
