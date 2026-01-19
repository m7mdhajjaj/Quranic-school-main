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
  const selectedGroupRef = useRef<Group | null>(null);

  // ✅ تحديث الـ ref عند تغيير selectedGroup
  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

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
    const currentGroup = selectedGroupRef.current;
    if (!currentGroup) {
      console.warn('⚠️ No selected group to refresh');
      return;
    }

    console.log('🔄 Refreshing group:', currentGroup.name);
    
    try {
      // ⚡ جلب البيانات المحدثة
      const updatedGroup = await fetchGroupStudentsWarnings(currentGroup);
      if (updatedGroup) {
        console.log('✅ Group refreshed successfully');
        setSelectedGroup(updatedGroup);
        selectedGroupRef.current = updatedGroup;
      }
    } catch (error) {
      console.error("❌ Error refreshing group data:", error);
    }
  }, [fetchGroupStudentsWarnings]);

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
