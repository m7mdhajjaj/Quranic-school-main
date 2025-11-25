import { useMemo, useCallback } from "react";
import type { Student, Section } from "../types/types";

interface UseComputedValuesProps {
  students: Student[];
  selectedStudentId: string | null;
  sections: Section[];
}

/**
 * Custom hook for computed values and derived state
 * Note: Averages calculation moved to backend API (useStudentAverages hook)
 */
export const useComputedValues = ({
  students,
  selectedStudentId,
  sections,
}: UseComputedValuesProps) => {
  
  // Get selected student object
  const getSelectedStudent = useCallback(() => {
    return students.find((s) => s._id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Get filtered sections count
  const sectionsCount = useMemo(() => sections.length, [sections]);

  return {
    getSelectedStudent,
    sectionsCount,
  };
};
