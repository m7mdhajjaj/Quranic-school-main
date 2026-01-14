import { useState } from "react";
import type { Section, Mark, Student } from "../types/types";

interface UseDailyMarksStateReturn {
  // Search Query
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  
  // Modals
  isAddSectionModalOpen: boolean;
  setIsAddSectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditSectionModalOpen: boolean;
  setIsEditSectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAddingSectionLoading: boolean;
  setIsAddingSectionLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isBulkDeleteModalOpen: boolean;
  setIsBulkDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAddMarkModalOpen: boolean;
  setIsAddMarkModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAddingMarkLoading: boolean;
  setIsAddingMarkLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isUpdateMarkModalOpen: boolean;
  setIsUpdateMarkModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUpdatingMarkLoading: boolean;
  setIsUpdatingMarkLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isEditingSectionLoading: boolean;
  setIsEditingSectionLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isBulkUpdating: boolean;
  setIsBulkUpdating: React.Dispatch<React.SetStateAction<boolean>>;
  isBulkDeleting: boolean;
  setIsBulkDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  isBulkMarksModalOpen: boolean;
  setIsBulkMarksModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bulkMarksSection: Section | null;
  setBulkMarksSection: React.Dispatch<React.SetStateAction<Section | null>>;
  
  // Selected Data
  selectedSection: Section | null;
  setSelectedSection: React.Dispatch<React.SetStateAction<Section | null>>;
  selectedStudent: Student | null;
  setSelectedStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  editingMark: Mark | null;
  setEditingMark: React.Dispatch<React.SetStateAction<Mark | null>>;
  editingSection: Section | null;
  setEditingSection: React.Dispatch<React.SetStateAction<Section | null>>;
  selectedSectionsForBulk: string[];
  setSelectedSectionsForBulk: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Forms
  newSection: Omit<Section, "_id">;
  setNewSection: React.Dispatch<React.SetStateAction<Omit<Section, "_id">>>;
  newMark: { reviewMark: number; memorizationMark: number };
  setNewMark: React.Dispatch<React.SetStateAction<{ reviewMark: number; memorizationMark: number }>>;
}

/**
 * Custom hook for managing Daily Marks component state
 * 
 * @description
 * - Centralizes all state management for Daily Marks page
 * - Manages modal visibility and loading states
 * - Handles selected data (sections, students, marks)
 * - Manages form data for adding/editing
 * 
 * @returns {UseDailyMarksStateReturn} All state values and setters
 */
export const useDailyMarksState = (): UseDailyMarksStateReturn => {
  // Search Query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal States
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isAddingSectionLoading, setIsAddingSectionLoading] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkMarksModalOpen, setIsBulkMarksModalOpen] = useState(false);
  const [bulkMarksSection, setBulkMarksSection] = useState<Section | null>(null);
  const [isAddMarkModalOpen, setIsAddMarkModalOpen] = useState(false);
  const [isAddingMarkLoading, setIsAddingMarkLoading] = useState(false);
  const [isUpdateMarkModalOpen, setIsUpdateMarkModalOpen] = useState(false);
  const [isUpdatingMarkLoading, setIsUpdatingMarkLoading] = useState(false);
  const [isEditingSectionLoading, setIsEditingSectionLoading] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Selected Data States
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedSectionsForBulk, setSelectedSectionsForBulk] = useState<string[]>([]);

  // Form States
  const [newSection, setNewSection] = useState<Omit<Section, "_id">>({
    date: new Date().toISOString().split("T")[0],
    memorizationSection: "",
    reviewSection: "",
  });

  const [newMark, setNewMark] = useState({
    reviewMark: 8,
    memorizationMark: 8,
  });

  return {
    // Search Query
    searchQuery,
    setSearchQuery,
    
    // Modals
    isAddSectionModalOpen,
    setIsAddSectionModalOpen,
    isEditSectionModalOpen,
    setIsEditSectionModalOpen,
    isAddingSectionLoading,
    setIsAddingSectionLoading,
    isBulkDeleteModalOpen,
    setIsBulkDeleteModalOpen,
    isAddMarkModalOpen,
    setIsAddMarkModalOpen,
    isAddingMarkLoading,
    setIsAddingMarkLoading,
    isUpdateMarkModalOpen,
    setIsUpdateMarkModalOpen,
    isUpdatingMarkLoading,
    setIsUpdatingMarkLoading,
    isEditingSectionLoading,
    setIsEditingSectionLoading,
    isBulkUpdating,
    setIsBulkUpdating,
    isBulkDeleting,
    setIsBulkDeleting,
    isBulkMarksModalOpen,
    setIsBulkMarksModalOpen,
    bulkMarksSection,
    setBulkMarksSection,
    
    // Selected Data
    selectedSection,
    setSelectedSection,
    selectedStudent,
    setSelectedStudent,
    editingMark,
    setEditingMark,
    editingSection,
    setEditingSection,
    selectedSectionsForBulk,
    setSelectedSectionsForBulk,
    
    // Forms
    newSection,
    setNewSection,
    newMark,
    setNewMark,
  };
};
