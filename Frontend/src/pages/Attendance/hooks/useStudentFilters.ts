import { useState, useMemo, useEffect, useRef } from "react";
import type { AttendanceStudent } from "../types/absence.types";

interface UseStudentFiltersProps {
  students: AttendanceStudent[];
  groupsAvailable: string[];
  itemsPerPage?: number;
}

/**
 * Hook لإدارة الفلترة والبحث والـ pagination للطلاب
 */
export const useStudentFilters = ({
  students,
  groupsAvailable,
  itemsPerPage = 10,
}: UseStudentFiltersProps) => {
  const [groupFilter, setGroupFilter] = useState<string>("");
  const [nameQuery, setNameQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Auto-select first group if current filter is not available
  // استخدام ref لتجنب re-renders غير ضرورية
  const prevGroupsAvailable = useRef<string[]>([]);
  
  useEffect(() => {
    // فقط إذا تغيرت المجموعات فعلياً
    const groupsChanged = 
      prevGroupsAvailable.current.length !== groupsAvailable.length ||
      !prevGroupsAvailable.current.every((g: string, i: number) => g === groupsAvailable[i]);
    
    if (groupsChanged) {
      prevGroupsAvailable.current = groupsAvailable;
      
      // اختيار أول حلقة تلقائياً
      if (!groupsAvailable.includes(groupFilter) && groupsAvailable.length > 0) {
        setGroupFilter(groupsAvailable[0]);
      }
    }
  }, [groupsAvailable, groupFilter]);

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

  // Paginated students
  const paginatedStudents = useMemo(() => {
    if (visibleStudents.length <= itemsPerPage) {
      return visibleStudents;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return visibleStudents.slice(startIndex, endIndex);
  }, [visibleStudents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(visibleStudents.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [groupFilter, nameQuery]);

  return {
    groupFilter,
    setGroupFilter,
    nameQuery,
    setNameQuery,
    currentPage,
    setCurrentPage,
    visibleStudents,
    paginatedStudents,
    totalPages,
    itemsPerPage,
  };
};
