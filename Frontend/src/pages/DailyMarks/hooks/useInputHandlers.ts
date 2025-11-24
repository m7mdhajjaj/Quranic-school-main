import { useCallback } from "react";
import type { Section } from "../types/types";

interface UseInputHandlersProps {
  setNewSection: React.Dispatch<React.SetStateAction<Omit<Section, "_id">>>;
  setEditingSection: React.Dispatch<React.SetStateAction<Section | null>>;
  setNewMark: React.Dispatch<React.SetStateAction<{ reviewMark: number; memorizationMark: number }>>;
}

/**
 * Custom hook for managing form input change handlers
 * Centralizes all input change logic
 */
export const useInputHandlers = ({
  setNewSection,
  setEditingSection,
  setNewMark,
}: UseInputHandlersProps) => {
  
  // Handle section input changes
  const handleSectionInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewSection((prev) => ({ ...prev, [name]: value }));
  }, [setNewSection]);

  // Handle edit section input changes
  const handleEditSectionInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditingSection((prev) => prev ? { ...prev, [name]: value } : null);
  }, [setEditingSection]);

  // Handle mark input changes
  const handleMarkInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewMark((prev) => ({ ...prev, [name]: Number(value) }));
  }, [setNewMark]);

  return {
    handleSectionInputChange,
    handleEditSectionInputChange,
    handleMarkInputChange,
  };
};
