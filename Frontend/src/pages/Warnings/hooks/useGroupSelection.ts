// ============================================================================
// useGroupSelection Hook - إدارة اختيار الحلقة والتنقل
// ============================================================================

import { useState } from "react";
import type { Group } from "../types/warnings";

interface UseGroupSelectionProps {
  fetchGroupStudentsWarnings: (group: Group) => Promise<Group>;
}

export const useGroupSelection = ({
  fetchGroupStudentsWarnings,
}: UseGroupSelectionProps) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // التعامل مع اختيار الحلقة
  const handleGroupSelect = async (group: Group) => {
    const updatedGroup = await fetchGroupStudentsWarnings(group);
    if (updatedGroup) {
      setSelectedGroup(updatedGroup);
    }
  };

  // العودة للحلقات
  const handleBack = () => {
    setSelectedGroup(null);
  };

  return {
    selectedGroup,
    handleGroupSelect,
    handleBack,
  };
};
