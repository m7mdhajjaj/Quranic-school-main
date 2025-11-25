import { useState, useCallback, useTransition, useEffect } from "react";
import type { LoggedInUser } from "../types/types";

/**
 * Custom hook for managing student and group selection
 * Handles optimistic UI updates with transitions and auto-selection
 */
export const useStudentSelection = (
  currentUser: LoggedInUser | null,
  teacherGroups: string[],
  loading: boolean
) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Auto-select group for students
  useEffect(() => {
    if (currentUser?.role === 'student' && currentUser.group && !selectedGroup) {
      console.log('🎓 Setting student group:', currentUser.group);
      setSelectedGroup(currentUser.group);
    }
  }, [currentUser, selectedGroup]);

  // Auto-select first group for teachers
  useEffect(() => {
    if (teacherGroups.length > 0 && !selectedGroup && !loading) {
      console.log('🎯 Auto-selecting first group:', teacherGroups[0]);
      setSelectedGroup(teacherGroups[0]);
    }
  }, [teacherGroups, selectedGroup, loading]);

  // Reset student selection when group changes
  useEffect(() => {
    setSelectedStudentId(null);
  }, [selectedGroup]);

  // Optimistic student selection
  const handleStudentSelect = useCallback((studentId: string) => {
    // Update UI immediately
    setSelectedStudentId(studentId);
    // Mark as pending for heavy operations
    startTransition(() => {
      // Heavy re-renders happen in transition
    });
  }, []);

  return {
    selectedStudentId,
    setSelectedStudentId,
    selectedGroup,
    setSelectedGroup,
    isPending,
    handleStudentSelect,
  };
};
