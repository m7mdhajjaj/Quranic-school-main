// ============================================================================
// useTeachers - هوك لجلب قائمة المعلمين
// ============================================================================

import { useState, useEffect } from "react";
import { getAllTeachers, type Teacher } from "@/Api/teacherApi";

interface UseTeachersProps {
  isOpen: boolean;
  enabled?: boolean;
  onlyWithGroups?: boolean; // جلب المعلمين الذين لديهم حلقات فقط
}

export const useTeachers = ({ isOpen, enabled = true, onlyWithGroups = false }: UseTeachersProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  // جلب قائمة المعلمين فقط عند فتح النافذة
  useEffect(() => {
    if (!isOpen || !enabled) return;
    
    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        // إذا كان onlyWithGroups = true، جلب المعلمين الذين لديهم حلقات فقط
        const filters = onlyWithGroups ? { group: 'withGroups' } : undefined;
        const response = await getAllTeachers(filters);
        if (response.success && response.data) {
          setTeachers(response.data);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoadingTeachers(false);
      }
    };
    
    // فقط إذا كانت القائمة فارغة
    if (teachers.length === 0) {
      fetchTeachers();
    }
  }, [isOpen, enabled, onlyWithGroups, teachers.length]);

  return {
    teachers,
    loadingTeachers,
  };
};
