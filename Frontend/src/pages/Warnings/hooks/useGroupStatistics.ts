// ============================================================================
// useGroupStatistics Hook - حساب إحصائيات الحلقة
// ============================================================================

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
}

export const useGroupStatistics = () => {
  const calculateGroupStatistics = (group: Group): GroupStatistics => {
    const students = group.students || [];
    const studentsWithWarnings = students.filter(
      (s) => (s.warningsCount || 0) > 0
    );

    const warningsByType = {
      warning: 0,
      first: 0,
      second: 0,
      third: 0,
      expulsion: 0,
    };

    let totalWarnings = 0;

    students.forEach((student) => {
      totalWarnings += student.warningsCount || 0;
      student.existingWarningTypes?.forEach((type) => {
        if (type in warningsByType) {
          warningsByType[type as keyof typeof warningsByType]++;
        }
      });
      // حساب التنبيهات
      warningsByType.warning += student.warningsOnlyCount || 0;
    });

    const topStudents = students
      .filter((s) => (s.warningsCount || 0) > 0)
      .sort((a, b) => (b.warningsCount || 0) - (a.warningsCount || 0))
      .slice(0, 5)
      .map((s) => ({
        name: `${s.firstName} ${s.lastName}`,
        warningsCount: s.warningsCount || 0,
      }));

    return {
      groupName: group.name,
      totalStudents: students.length,
      studentsWithWarnings: studentsWithWarnings.length,
      totalWarnings,
      warningsByType,
      topStudents,
    };
  };

  return { calculateGroupStatistics };
};
