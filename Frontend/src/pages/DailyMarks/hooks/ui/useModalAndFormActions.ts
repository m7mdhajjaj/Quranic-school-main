import { useCallback } from "react";
import type { Section, Mark, Student } from "../types/types";

interface UseModalAndFormActionsProps {
  // State setters - Modal visibility
  setIsAddMarkModalOpen: (value: boolean) => void;
  setIsUpdateMarkModalOpen: (value: boolean) => void;
  setIsEditSectionModalOpen: (value: boolean) => void;
  
  // State setters - Selected data
  setSelectedSection: (section: Section | null) => void;
  setSelectedStudent: (student: Student | null) => void;
  setEditingMark: (mark: Mark | null) => void;
  setEditingSection: React.Dispatch<React.SetStateAction<Section | null>>;
  setSelectedSectionsForBulk: React.Dispatch<React.SetStateAction<string[]>>;
  
  // State setters - Form data
  setNewSection: React.Dispatch<React.SetStateAction<Omit<Section, "_id">>>;
  setNewMark: React.Dispatch<React.SetStateAction<{ reviewMark: number; memorizationMark: number }>>;
}

interface UseModalAndFormActionsReturn {
  // Modal Actions
  openAddMarkModal: (section: Section, student?: Student) => void;
  openUpdateMarkModal: (mark: Mark, section: Section, student?: Student) => void;
  openEditSectionModal: (section: Section) => void;
  toggleSectionSelection: (sectionId: string) => void;
  
  // Form Input Handlers
  handleSectionInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleEditSectionInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleMarkInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

/**
 * Custom hook for modal actions and form input handlers
 * 
 * @description
 * - Merged hook combining modal actions and form input handlers
 * - Manages modal visibility and selected data
 * - Handles form input changes for sections and marks
 * - Replaces: useModalActions + useInputHandlers
 * 
 * @param {UseModalAndFormActionsProps} props - State setters for modals and forms
 * 
 * @returns {UseModalAndFormActionsReturn} Modal actions and input handlers
 */
export const useModalAndFormActions = ({
  setIsAddMarkModalOpen,
  setIsUpdateMarkModalOpen,
  setIsEditSectionModalOpen,
  setSelectedSection,
  setSelectedStudent,
  setEditingMark,
  setEditingSection,
  setSelectedSectionsForBulk,
  setNewSection,
  setNewMark,
}: UseModalAndFormActionsProps): UseModalAndFormActionsReturn => {
  
  // ========== Modal Actions ==========
  
  const openAddMarkModal = useCallback((section: Section, student?: Student) => {
    setSelectedSection(section);
    if (student) {
      setSelectedStudent(student);
    }
    setNewMark({
      reviewMark: 8,
      memorizationMark: 8,
    });
    setIsAddMarkModalOpen(true);
  }, [setSelectedSection, setSelectedStudent, setNewMark, setIsAddMarkModalOpen]);

  const openUpdateMarkModal = useCallback((mark: Mark, section: Section, student?: Student) => {
    setEditingMark(mark);
    setSelectedSection(section);
    if (student) {
      setSelectedStudent(student);
    }
    setNewMark({
      reviewMark: mark.reviewMark || 8,
      memorizationMark: mark.memorizationMark || 8,
    });
    setIsUpdateMarkModalOpen(true);
  }, [setEditingMark, setSelectedSection, setSelectedStudent, setNewMark, setIsUpdateMarkModalOpen]);

  const openEditSectionModal = useCallback((section: Section) => {
    setEditingSection({ ...section });
    setIsEditSectionModalOpen(true);
  }, [setEditingSection, setIsEditSectionModalOpen]);

  const toggleSectionSelection = useCallback((sectionId: string) => {
    setSelectedSectionsForBulk((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, [setSelectedSectionsForBulk]);

  // ========== Form Input Handlers ==========
  
  const handleSectionInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewSection((prev) => ({ ...prev, [name]: value }));
  }, [setNewSection]);

  const handleEditSectionInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditingSection((prev: Section | null) => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  }, [setEditingSection]);

  const handleMarkInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewMark((prev) => ({ ...prev, [name]: Number(value) }));
  }, [setNewMark]);

  return {
    // Modal Actions
    openAddMarkModal,
    openUpdateMarkModal,
    openEditSectionModal,
    toggleSectionSelection,
    
    // Form Input Handlers
    handleSectionInputChange,
    handleEditSectionInputChange,
    handleMarkInputChange,
  };
};
