import { useMemo } from "react";
import type { LoggedInUser } from "../types/types";

/**
 * Custom hook to determine the correct student ID for fetching averages
 * 
 * @description
 * - For students: returns their own ID from currentUser
 * - For teachers/admins: returns the selected student ID
 * - Memoized to avoid unnecessary recalculations
 * 
 * @param {LoggedInUser | null} currentUser - Current logged-in user
 * @param {string | null} selectedStudentId - Selected student ID (for teachers)
 * 
 * @returns {string | null} The appropriate student ID for averages calculation
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
