import { useState, useMemo } from "react";
import type { AttendanceStudent } from "../types/absence.types";

interface UseStudentFiltersProps {
  students: AttendanceStudent[];
}

/**
 * Hook لإدارة الفلترة والبحث للطلاب
 */
export const useStudentFilters = ({
  students,
}: UseStudentFiltersProps) => {
  const [groupFilter, setGroupFilter] = useState<string>("");
  const [nameQuery, setNameQuery] = useState<string>("");

  // Visible students (filtered)
  const visibleStudents = useMemo(() => {
    let list = [...students];
    
    // تطبيق فلتر الحلقة (عرض طلاب الحلقة المختارة فقط)
    list = list.filter((s) => (s.group ?? "") === groupFilter);
    
    // تطبيق البحث بالاسم
    if (nameQuery.trim()) {
      const q = nameQuery.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    
    return list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [students, groupFilter, nameQuery]);

  return {
    groupFilter,
    setGroupFilter,
    nameQuery,
    setNameQuery,
    visibleStudents,
  };
};
