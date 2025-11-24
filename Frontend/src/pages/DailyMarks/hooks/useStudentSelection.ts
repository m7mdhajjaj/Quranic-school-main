import { useState, useCallback, useTransition, useEffect } from "react";

/**
 * Custom hook for managing student and group selection
 * Handles optimistic UI updates with transitions
 */
export const useStudentSelection = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [isPending, startTransition] = useTransition();

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
