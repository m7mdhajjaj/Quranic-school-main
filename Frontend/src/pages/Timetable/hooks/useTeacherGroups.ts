// ============================================================================
// useTeacherGroups - هوك لجلب حلقات معلم معين
// ============================================================================

import { useState, useEffect } from "react";
import { getGroupsByTeacherIdWithFilters } from "@/Api/groupApi";

interface UseTeacherGroupsProps {
  teacherId: string | undefined;
  isOpen: boolean;
  enabled?: boolean;
}

/**
 * هوك لجلب حلقات معلم معين من الـ API
 * @param teacherId - معرف المعلم
 * @param isOpen - هل المودال مفتوح (لتفادي الطلبات غير الضرورية)
 * @param enabled - تفعيل/تعطيل الجلب
 */
export const useTeacherGroups = ({ 
  teacherId, 
  isOpen, 
  enabled = true 
}: UseTeacherGroupsProps) => {
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  useEffect(() => {
    // لا نجلب إذا:
    // 1. المودال مغلق
    // 2. الـ hook معطل
    // 3. لا يوجد معرف معلم
    if (!isOpen || !enabled || !teacherId) {
      setTeacherGroups([]);
      return;
    }

    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const response = await getGroupsByTeacherIdWithFilters(
          teacherId,
          'all',
          false
        );
        
        if (response.success && response.data) {
          const groupNames = response.data.groups.map(g => g.name);
          setTeacherGroups(groupNames);
        } else {
          setTeacherGroups([]);
        }
      } catch (error) {
        console.error("Error fetching teacher groups:", error);
        setTeacherGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [teacherId, isOpen, enabled]);

  return {
    teacherGroups,
    loadingGroups,
  };
};
