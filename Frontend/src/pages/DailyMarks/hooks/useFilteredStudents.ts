import { useMemo } from "react";
import type { Student } from "../types/types";

interface UseFilteredStudentsProps {
  students: Student[];
  selectedGroup: string;
}

/**
 * Custom hook for filtering students by selected group
 */
export const useFilteredStudents = ({ students, selectedGroup }: UseFilteredStudentsProps) => {
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
