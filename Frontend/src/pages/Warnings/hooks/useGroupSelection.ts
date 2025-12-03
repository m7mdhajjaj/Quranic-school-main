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
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ✅ التعامل مع اختيار الحلقة - محسّن بـ useCallback
  const handleGroupSelect = useCallback(async (group: Group) => {
    try {
      setLoadingStudents(true);
      setSelectedGroup(group);
      
      // ✅ جلب البيانات مع الإنذارات
      const updatedGroup = await fetchGroupStudentsWarnings(group);
      if (updatedGroup) {
        setSelectedGroup(updatedGroup);
      }
    } finally {
      setLoadingStudents(false);
    }
  }, [fetchGroupStudentsWarnings]);

  // ✅ العودة للحلقات - محسّن بـ useCallback
  const handleBack = useCallback(() => {
    setSelectedGroup(null);
  }, []);

  return {
    selectedGroup,
    loadingStudents,
    handleGroupSelect,
    handleBack,
  };
};
