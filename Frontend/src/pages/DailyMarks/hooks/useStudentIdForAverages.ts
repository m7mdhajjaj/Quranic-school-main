import { useMemo } from "react";
import type { LoggedInUser } from "../types/types";

/**
 * Custom hook to determine the correct student ID for fetching averages
 * - For students: returns their own ID from currentUser
 * - For teachers: returns the selected student ID
 */
export const useStudentIdForAverages = (
  currentUser: LoggedInUser | null,
  selectedStudentId: string | null
): string | null => {
  return useMemo(() => {
    if (!currentUser) return null;
    
    return currentUser.role === 'student' 
      ? currentUser._id 
      : selectedStudentId;
  }, [currentUser?.role, currentUser?._id, selectedStudentId]);
};
