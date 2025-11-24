import { useState, useEffect } from "react";
import type { Section, Mark, Student } from "../types/types";

interface UseDailyMarksStateProps {
  students: Student[];
  teacherGroups: string[];
}

export const useDailyMarksState = ({ students, teacherGroups }: UseDailyMarksStateProps) => {
  // Selection States
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  // Modal States
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isAddingSectionLoading, setIsAddingSectionLoading] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isAddMarkModalOpen, setIsAddMarkModalOpen] = useState(false);
  const [isAddingMarkLoading, setIsAddingMarkLoading] = useState(false);
  const [isUpdateMarkModalOpen, setIsUpdateMarkModalOpen] = useState(false);
  const [isUpdatingMarkLoading, setIsUpdatingMarkLoading] = useState(false);
  const [isEditingSectionLoading, setIsEditingSectionLoading] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Selected Data States
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
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

  // Auto-select first group when teacher groups are loaded
  useEffect(() => {
    if (teacherGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(teacherGroups[0]);
    }
  }, [teacherGroups, selectedGroup]);

  // Filter students by selected group
  useEffect(() => {
    if (selectedGroup) {
      const normalizeString = (str: string | undefined | null) => {
        if (!str) return "";
        return str.trim().toLowerCase();
      };
      const normalizedSelectedGroup = normalizeString(selectedGroup);

      const filtered = students.filter(
        (s) => normalizeString(s.group) === normalizedSelectedGroup
      );

      setFilteredStudents(filtered);
      setSelectedStudentId(null);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedGroup, students]);

  return {
    // Selection
    selectedStudentId,
    setSelectedStudentId,
    selectedGroup,
    setSelectedGroup,
    filteredStudents,
    
    // Modals
    isAddSectionModalOpen,
    setIsAddSectionModalOpen,
    isEditSectionModalOpen,
    setIsEditSectionModalOpen,
    isAddingSectionLoading,
    setIsAddingSectionLoading,
    isBulkUpdateModalOpen,
    setIsBulkUpdateModalOpen,
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
    
    // Selected Data
    selectedSection,
    setSelectedSection,
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
