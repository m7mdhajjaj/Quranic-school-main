import { useMemo, useCallback } from "react";
import type { Student, Section, Mark } from "../types/types";

interface UseComputedValuesProps {
  students: Student[];
  selectedStudentId: string | null;
  sections: Section[];
  marks: Mark[];
  currentUserId?: string;
  calculateAverages: (marks: Mark[], studentId: string | null) => {
    memorizationAverage: number;
    reviewAverage: number;
    overallAverage: number;
    totalMarks: number;
  };
}

/**
 * Custom hook for computed values and derived state
 * Handles memoized calculations and helpers
 */
export const useComputedValues = ({
  students,
  selectedStudentId,
  sections,
  marks,
  currentUserId,
  calculateAverages,
}: UseComputedValuesProps) => {
  
  // Get selected student object
  const getSelectedStudent = useCallback(() => {
    return students.find((s) => s._id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Calculate student averages
  const averages = useMemo(() => 
    calculateAverages(marks, currentUserId || selectedStudentId),
    [marks, currentUserId, selectedStudentId, calculateAverages]
  );

  // Get filtered sections count
  const sectionsCount = useMemo(() => sections.length, [sections]);

  return {
    getSelectedStudent,
    averages,
    sectionsCount,
  };
};
