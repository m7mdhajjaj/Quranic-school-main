import { useState, useCallback } from "react";
import type { TeacherAssistant } from "../types";

export interface UseTeacherAssistantSelectionReturn {
  // Selection State
  selectedIds: Set<string>;
  
  // Selection Actions
  handleToggleSelection: (id: string) => void;
  handleToggleSelectAll: (allIds: string[]) => void;
  clearSelection: () => void;
  
  // Computed
  isAllSelected: (totalCount: number) => boolean;
  selectedCount: number;
}

export const useTeacherAssistantSelection = (): UseTeacherAssistantSelectionReturn => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleToggleSelectAll = useCallback((allIds: string[]) => {
    setSelectedIds(prev => {
      if (prev.size === allIds.length) {
        return new Set(); // Deselect all
      } else {
        return new Set(allIds); // Select all
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = useCallback((totalCount: number) => {
    return selectedIds.size === totalCount && totalCount > 0;
  }, [selectedIds.size]);

  return {
    selectedIds,
    handleToggleSelection,
    handleToggleSelectAll,
    clearSelection,
    isAllSelected,
    selectedCount: selectedIds.size,
  };
};
