import { useState, useCallback, useTransition, useEffect } from "react";
import type { LoggedInUser } from "../types/types";

interface UseStudentSelectionReturn {
  selectedStudentId: string | null;
  setSelectedStudentId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedGroup: string;
  setSelectedGroup: React.Dispatch<React.SetStateAction<string>>;
  isPending: boolean;
  handleStudentSelect: (studentId: string) => void;
}

/**
 * Custom hook for managing student and group selection
 * 
 * @description
 * - Handles student and group selection state
 * - Auto-selects group for student users
 * - Resets student selection when group changes
 * - Uses React transitions for optimistic UI updates
 * 
 * @param {LoggedInUser | null} currentUser - Current logged-in user
 * @param {string[]} teacherGroups - List of teacher's groups
 * @param {boolean} loading - Whether data is loading
 * 
 * @returns {UseStudentSelectionReturn} Selection state and handlers
 */
export const useStudentSelection = (
  currentUser: LoggedInUser | null,
  teacherGroups: string[],
  loading: boolean
): UseStudentSelectionReturn => {
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

  // Don't auto-select group - let user choose
  // useEffect(() => {
  //   if (teacherGroups.length > 0 && !selectedGroup && !loading) {
  //     console.log('🎯 Auto-selecting first group:', teacherGroups[0]);
  //     setSelectedGroup(teacherGroups[0]);
  //   }
  // }, [teacherGroups, selectedGroup, loading]);

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
