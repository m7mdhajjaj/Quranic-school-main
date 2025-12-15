import { useState, useCallback } from "react";

interface UseGroupsListLogicProps {
  onGroupClick: (groupId: string, groupName: string) => void;
}

export const useGroupsListLogic = ({ onGroupClick }: UseGroupsListLogicProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [timetableModal, setTimetableModal] = useState<{
    isOpen: boolean;
    groupId: string;
    groupName: string;
  }>({
    isOpen: false,
    groupId: "",
    groupName: "",
  });

  const handleTimetableClick = useCallback((e: React.MouseEvent, groupId: string, groupName: string) => {
    e.stopPropagation(); // Prevent card onClick from firing
    setTimetableModal({
      isOpen: true,
      groupId,
      groupName,
    });
  }, []);

  const handleCloseTimetableModal = useCallback(() => {
    setTimetableModal({
      isOpen: false,
      groupId: "",
      groupName: "",
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    timetableModal,
    handleTimetableClick,
    handleCloseTimetableModal,
  };
};
