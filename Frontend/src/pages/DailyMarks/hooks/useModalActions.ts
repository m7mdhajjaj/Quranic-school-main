import type { Section, Mark } from "../types/types";

interface UseModalActionsProps {
  setSelectedSection: (section: Section | null) => void;
  setNewMark: (mark: { reviewMark: number; memorizationMark: number }) => void;
  setIsAddMarkModalOpen: (value: boolean) => void;
  setEditingMark: (mark: Mark | null) => void;
  setIsUpdateMarkModalOpen: (value: boolean) => void;
  setEditingSection: (section: Section | null) => void;
  setIsEditSectionModalOpen: (value: boolean) => void;
  setSelectedSectionsForBulk: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useModalActions = ({
  setSelectedSection,
  setNewMark,
  setIsAddMarkModalOpen,
  setEditingMark,
  setIsUpdateMarkModalOpen,
  setEditingSection,
  setIsEditSectionModalOpen,
  setSelectedSectionsForBulk,
}: UseModalActionsProps) => {
  
  const openAddMarkModal = (section: Section) => {
    setSelectedSection(section);
    setNewMark({
      reviewMark: 8,
      memorizationMark: 8,
    });
    setIsAddMarkModalOpen(true);
  };

  const openUpdateMarkModal = (mark: Mark, section: Section) => {
    setEditingMark(mark);
    setSelectedSection(section);
    setNewMark({
      reviewMark: mark.reviewMark || 8,
      memorizationMark: mark.memorizationMark || 8,
    });
    setIsUpdateMarkModalOpen(true);
  };

  const openEditSectionModal = (section: Section) => {
    setEditingSection({ ...section });
    setIsEditSectionModalOpen(true);
  };

  const toggleSectionSelection = (sectionId: string) => {
    setSelectedSectionsForBulk((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return {
    openAddMarkModal,
    openUpdateMarkModal,
    openEditSectionModal,
    toggleSectionSelection,
  };
};
