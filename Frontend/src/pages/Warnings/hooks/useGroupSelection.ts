// ============================================================================
// useGroupSelection Hook - إدارة اختيار الحلقة والتنقل
// ============================================================================

import { useState, useCallback } from "react";
import type { Group } from "../types/warnings";

interface UseGroupSelectionProps {
  fetchGroupStudentsWarnings: (group: Group) => Promise<Group>;
}

export const useGroupSelection = ({
  fetchGroupStudentsWarnings,
}: UseGroupSelectionProps) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // ✅ التعامل مع اختيار الحلقة - محسّن بـ useCallback
  const handleGroupSelect = useCallback(async (group: Group) => {
    const updatedGroup = await fetchGroupStudentsWarnings(group);
    if (updatedGroup) {
      setSelectedGroup(updatedGroup);
    }
  }, [fetchGroupStudentsWarnings]);

  // ✅ العودة للحلقات - محسّن بـ useCallback
  const handleBack = useCallback(() => {
    setSelectedGroup(null);
  }, []);

  return {
    selectedGroup,
    handleGroupSelect,
    handleBack,
  };
};
