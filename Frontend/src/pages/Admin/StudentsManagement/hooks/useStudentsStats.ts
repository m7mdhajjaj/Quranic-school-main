import { useMemo } from "react";
import type { Student, StudentStats, ApiStats } from "../types";

export const calculateStats = (
  students: Student[],
  apiStats: ApiStats | null
): StudentStats => {
  // Optimize: single loop instead of multiple filters
  let maleCount = 0;
  let femaleCount = 0;
  let totalAge = 0;
  let withGroupCount = 0;

  for (const student of students) {
    // Count gender
    if (student.gender === "ذكر") maleCount++;
    else if (student.gender === "أنثى") femaleCount++;
    
    // Sum age
    totalAge += student.age || 0;
    
    // Count students with groups
    if (
      student.group &&
      student.group.trim() !== "" &&
      student.group.toLowerCase() !== "غير محدد" &&
      student.group.toLowerCase() !== "undefined"
    ) {
      withGroupCount++;
    }
  }

  const avgAge = students.length > 0 ? (totalAge / students.length).toFixed(1) : 0;
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
