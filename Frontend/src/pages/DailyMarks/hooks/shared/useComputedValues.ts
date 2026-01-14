import { useMemo, useCallback } from "react";
import type { Student, Section } from "../types/types";

interface UseComputedValuesProps {
  students: Student[];
  selectedStudentId: string | null;
  sections: Section[];
}

interface UseComputedValuesReturn {
  getSelectedStudent: () => Student | null;
  sectionsCount: number;
}

/**
 * Custom hook for computed values and derived state
 * 
 * @description
 * - Provides memoized computed values to avoid unnecessary recalculations
 * - Handles student selection and sections count
 * - Note: Averages calculation moved to backend API (useStudentAverages hook)
 * 
 * @param {Student[]} students - List of all students
 * @param {string | null} selectedStudentId - Currently selected student ID
 * @param {Section[]} sections - List of sections
 * 
 * @returns {UseComputedValuesReturn} Computed values and helper functions
 */
export const useComputedValues = ({
  students,
  selectedStudentId,
  sections,
}: UseComputedValuesProps): UseComputedValuesReturn => {
  
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
