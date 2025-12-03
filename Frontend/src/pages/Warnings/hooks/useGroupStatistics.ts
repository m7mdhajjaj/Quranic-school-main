// ============================================================================
// useGroupStatistics Hook - حساب إحصائيات الحلقة
// ============================================================================

import { useCallback } from 'react';
import type { Group } from '../types/warnings';

export interface GroupStatistics {
  groupName: string;
  totalStudents: number;
  studentsWithWarnings: number;
  totalWarnings: number;
  warningsByType: {
    warning: number;
    first: number;
    second: number;
    third: number;
    expulsion: number;
  };
  topStudents: Array<{
    name: string;
    warningsCount: number;
  }>;
  studentsDetails?: Array<{
    _id: string;
    name: string;
    warningsCount: number;
    warningsOnlyCount: number;
    existingWarningTypes: string[];
  }>;
}

// ✅ Constants extracted outside for performance
const INITIAL_WARNINGS_BY_TYPE = {
  warning: 0,
  first: 0,
  second: 0,
  third: 0,
  expulsion: 0,
} as const;

const TOP_STUDENTS_LIMIT = 5;

export const useGroupStatistics = () => {
  // ✅ Optimized with useCallback for stable reference
  const calculateGroupStatistics = useCallback((group: Group): GroupStatistics => {
    const students = group.students || [];
    
    // ✅ Initialize with spread to avoid mutation
    const warningsByType = { ...INITIAL_WARNINGS_BY_TYPE };
    let totalWarnings = 0;
    let studentsWithWarningsCount = 0;

    // ✅ Single loop optimization - process all data in one pass
    const studentsDetails = students.map((student) => {
      const warningsCount = student.warningsCount || 0;
      const warningsOnlyCount = student.warningsOnlyCount || 0;
      const existingWarningTypes = student.existingWarningTypes || [];
      
      // Count total warnings
      totalWarnings += warningsCount;
      
      // Count students with warnings
      if (warningsCount > 0) {
        studentsWithWarningsCount++;
      }
      
      // Count warnings by type
      existingWarningTypes.forEach((type) => {
        if (type in warningsByType) {
          warningsByType[type as keyof typeof warningsByType]++;
        }
      });
      
      // Add warning-only count
      warningsByType.warning += warningsOnlyCount;
      
      // Return student details for table
      return {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        warningsCount,
        warningsOnlyCount,
        existingWarningTypes,
      };
    });

    // ✅ Calculate top students from already processed data
    const topStudents = studentsDetails
      .filter((s) => s.warningsCount > 0)
      .sort((a, b) => b.warningsCount - a.warningsCount)
      .slice(0, TOP_STUDENTS_LIMIT)
      .map((s) => ({
        name: s.name,
        warningsCount: s.warningsCount,
      }));

    return {
      groupName: group.name,
      totalStudents: students.length,
      studentsWithWarnings: studentsWithWarningsCount,
      totalWarnings,
      warningsByType,
      topStudents,
      studentsDetails,
    };
  }, []);

  return { calculateGroupStatistics };
};
