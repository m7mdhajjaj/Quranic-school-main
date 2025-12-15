import { useMemo } from "react";
import type { Student } from "../types/types";

interface UseFilteredStudentsProps {
  students: Student[];
  selectedGroup: string;
}

/**
 * Custom hook for filtering students by selected group
 * 
 * @description
 * - Filters students based on selected group
 * - Normalizes strings for case-insensitive comparison
 * - Memoized for performance optimization
 * 
 * @param {Student[]} students - List of all students
 * @param {string} selectedGroup - Selected group name
 * 
 * @returns {Student[]} Filtered students belonging to selected group
 */
export const useFilteredStudents = ({ students, selectedGroup }: UseFilteredStudentsProps): Student[] => {
  const filteredStudents = useMemo(() => {
    if (!selectedGroup) {
      return [];
    }

    const normalizeString = (str: string | undefined | null) => {
      if (!str) return "";
      return str.trim().toLowerCase();
    };

    const normalizedSelectedGroup = normalizeString(selectedGroup);

    return students.filter(
      (s) => normalizeString(s.group) === normalizedSelectedGroup
    );
  }, [selectedGroup, students]);

  return filteredStudents;
};
