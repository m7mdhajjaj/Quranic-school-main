// ============================================================================
// useGroupSelection Hook - إدارة اختيار الحلقة والتنقل
// ============================================================================

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { Group } from "../types/warnings";

interface UseGroupSelectionProps {
  fetchGroupStudentsWarnings: (group: Group) => Promise<Group>;
  groups: Group[];
}

export const useGroupSelection = ({
  fetchGroupStudentsWarnings,
  groups,
}: UseGroupSelectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const lastLoadedGroupIdRef = useRef<string | null>(null);

  // ✅ استعادة الحلقة المختارة من URL عند التحميل ومزامنة الحالة
  useEffect(() => {
    const groupId = searchParams.get('groupId');
    
    if (groupId && groups.length > 0) {
      // تحميل الحلقة فقط إذا كانت مختلفة عن آخر حلقة تم تحميلها
      if (lastLoadedGroupIdRef.current !== groupId) {
        const group = groups.find(g => g._id === groupId);
        if (group) {
          lastLoadedGroupIdRef.current = groupId;
          (async () => {
            try {
              setLoadingStudents(true);
              setSelectedGroup(group);
              const updatedGroup = await fetchGroupStudentsWarnings(group);
              // ✅ التحقق من أننا لا نزال في نفس الحلقة قبل التحديث
              if (lastLoadedGroupIdRef.current === groupId && updatedGroup) {
                setSelectedGroup(updatedGroup);
              }
            } finally {
              // ✅ التحقق من أننا لا نزال في نفس الحلقة قبل إيقاف التحميل
              if (lastLoadedGroupIdRef.current === groupId) {
                setLoadingStudents(false);
              }
            }
          })();
        }
      }
    } else {
      // ✅ إذا لم يكن هناك groupId في URL، امسح الحالة فوراً
      lastLoadedGroupIdRef.current = null;
      setSelectedGroup(null);
    }
  }, [groups, searchParams, fetchGroupStudentsWarnings]);

  // ✅ التعامل مع اختيار الحلقة - محسّن بـ useCallback
  const handleGroupSelect = useCallback(async (group: Group) => {
    try {
      setLoadingStudents(true);
      setSelectedGroup(group);
      
      // ✅ حفظ ID الحلقة في URL
      setSearchParams({ groupId: group._id });
      
      // ✅ جلب البيانات مع الإنذارات
      const updatedGroup = await fetchGroupStudentsWarnings(group);
      if (updatedGroup) {
        setSelectedGroup(updatedGroup);
      }
    } finally {
      setLoadingStudents(false);
    }
  }, [fetchGroupStudentsWarnings, setSearchParams]);

  // ✅ تحديث بيانات الحلقة الحالية بدون إظهار Loading (Silent Refresh)
  const refreshCurrentGroup = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      // لا نضع setLoadingStudents(true) هنا لمنع الوميض
      const updatedGroup = await fetchGroupStudentsWarnings(selectedGroup);
      if (updatedGroup) {
        setSelectedGroup(prev => {
          // الحفاظ على نفس الكائن إذا لم يتغير لتجنب إعادة الرندر غير الضروري
          if (JSON.stringify(prev) === JSON.stringify(updatedGroup)) return prev;
          return updatedGroup;
        });
      }
    } catch (error) {
      console.error("Error refreshing group data:", error);
    }
  }, [selectedGroup, fetchGroupStudentsWarnings]);

  // ✅ العودة للحلقات - محسّن بـ useCallback
  const handleBack = useCallback(() => {
    // ✅ امسح الحالة والـ ref فوراً قبل تحديث URL
    lastLoadedGroupIdRef.current = null;
    setSelectedGroup(null);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('groupId');
      return newParams;
    });
  }, [setSearchParams]);

  return {
    selectedGroup,
    loadingStudents,
    handleGroupSelect,
    refreshCurrentGroup,
    handleBack,
  };
};
