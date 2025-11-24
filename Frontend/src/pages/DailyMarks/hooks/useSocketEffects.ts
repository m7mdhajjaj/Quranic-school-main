import { useEffect } from "react";

interface UseSocketEffectsProps {
  socketLastUpdate: unknown;
  lastNotification: { type: string } | null;
  currentUser: { role: string; _id: string } | null;
  selectedStudentId: string | null;
  refetchMarks: (studentId?: string) => Promise<void>;
  refetchSections: () => Promise<void>;
}

/**
 * Custom hook for handling socket-based side effects
 * Manages real-time updates via socket connections
 */
export const useSocketEffects = ({
  socketLastUpdate,
  lastNotification,
  currentUser,
  selectedStudentId,
  refetchMarks,
  refetchSections,
}: UseSocketEffectsProps) => {
  
  // Initial marks fetch when student is selected
  useEffect(() => {
    if (!currentUser) return;
    refetchMarks(selectedStudentId || undefined);
  }, [selectedStudentId, currentUser, refetchMarks]);

  // Refetch marks on socket updates
  useEffect(() => {
    if (!socketLastUpdate || !currentUser) return;
    refetchMarks(selectedStudentId || undefined);
  }, [socketLastUpdate, currentUser, selectedStudentId, refetchMarks]);

  // Listen to notifications and refetch sections when assignment notification received
  useEffect(() => {
    if (!lastNotification || !currentUser) return;
    
    // Only refetch for assignment notifications (sections related)
    if (lastNotification.type === "assignment") {
      console.log("📚 Section notification received, refetching sections...");
      refetchSections();
    }
  }, [lastNotification, currentUser, refetchSections]);
};
