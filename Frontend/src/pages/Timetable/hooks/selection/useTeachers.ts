// ============================================================================
// useTeachers - هوك لجلب قائمة المعلمين
// ============================================================================

import { useState, useEffect, useMemo } from "react";
import { getAllTeachers, type Teacher } from "@/Api/teacherApi";
import { showErrorMessage } from "@/utils/sweetalertUtils";

interface UseTeachersProps {
  isOpen: boolean;
  enabled?: boolean;
  onlyWithGroups?: boolean; // جلب المعلمين الذين لديهم حلقات فقط
}

export const useTeachers = ({ isOpen, enabled = true, onlyWithGroups = false }: UseTeachersProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  // Memoize filters to prevent unnecessary re-fetches
  const filters = useMemo(() => {
    return onlyWithGroups ? { group: 'withGroups' } : undefined;
  }, [onlyWithGroups]);

  // جلب قائمة المعلمين فقط عند فتح النافذة
  useEffect(() => {
    if (!isOpen || !enabled) return;
    
    // فقط إذا كانت القائمة فارغة
    if (teachers.length > 0) return;

    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const response = await getAllTeachers(filters);
        if (response.success && response.data) {
          setTeachers(response.data);
        }
      } catch (error: any) {
        const errorMsg = error?.response?.data?.message || error?.message || "حدث خطأ في تحميل قائمة المعلمين";
        await showErrorMessage("❌ خطأ في تحميل المعلمين", errorMsg);
      } finally {
        setLoadingTeachers(false);
      }
    };
    
    fetchTeachers();
  }, [isOpen, enabled, filters, teachers.length]);

  return {
    teachers,
    loadingTeachers,
  };
};
