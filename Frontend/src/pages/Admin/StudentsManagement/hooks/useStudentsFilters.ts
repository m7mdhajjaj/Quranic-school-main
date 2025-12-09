import { useState, useEffect, useCallback, useMemo } from "react";
import { searchStudents } from "@/Api/studentApi";
import type { Student, SortField, SortOrder, GroupsFilter } from "../types";

export const useStudentsFilters = (
  students: Student[],
  fetchStudents: (retryAttempt?: number, filters?: any) => Promise<void>
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [groupsFilter, setGroupsFilter] = useState<GroupsFilter>("all");
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("studentId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(1000); // عرض 1000 طالب في الصفحة
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGender !== "all") count++;
    if (groupsFilter !== "all") count++;
    if (ageRange[0] !== 0 || ageRange[1] !== 100) count++;
    if (searchTerm) count++;
    if (selectedTeacher !== "all") count++;
    if (selectedGroup !== "all") count++;
    return count;
  }, [selectedGender, groupsFilter, ageRange, searchTerm, selectedTeacher, selectedGroup]);

  // Enhanced search function using API
  const handleSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        await fetchStudents();
        return;
      }

      try {
        const result = await searchStudents(term);
        if (result.success && result.data) {
          // This would need to be handled by the parent component
          console.log("Search results:", result.data);
        }
      } catch (error) {
        console.error("❌ خطأ في البحث:", error);
      }
    },
    [fetchStudents]
  );

  // Removed - search is now handled by the main filter effect below

  // Helper to build filters object - avoid duplication
  const buildFiltersObject = useCallback(() => {
    const filters: any = {};
    
    if (selectedGender !== "all") filters.gender = selectedGender;
    if (ageRange[0] !== 0) filters.minAge = ageRange[0];
    if (ageRange[1] !== 100) filters.maxAge = ageRange[1];
    if (groupsFilter !== "all") filters.group = groupsFilter;
    if (selectedTeacher !== "all") filters.teacher = selectedTeacher;
    if (selectedGroup !== "all") filters.groupId = selectedGroup;
    if (searchTerm?.trim()) filters.search = searchTerm.trim();
    if (sortField) {
      filters.sortBy = sortField;
      filters.sortOrder = sortOrder;
    }
    
    return filters;
  }, [selectedGender, ageRange, groupsFilter, selectedTeacher, selectedGroup, searchTerm, sortField, sortOrder]);

  // Server-side filtering - all filtering done in backend
  useEffect(() => {
    const applyFilters = async () => {
      const filters = buildFiltersObject();
      await fetchStudents(0, filters);
    };

    const debounceTimer = setTimeout(() => {
      applyFilters();
    }, 300); // Debounce for 300ms - faster response

    return () => clearTimeout(debounceTimer);
  }, [buildFiltersObject, fetchStudents]);

  // No client-side filtering needed - backend handles everything
  const filteredAndSortedStudents = useMemo(() => students, [students]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedGender,
    groupsFilter,
    ageRange,
    sortField,
    sortOrder,
    selectedTeacher,
    selectedGroup,
  ]);

  // Server handles pagination - we just display what we get
  const currentStudents = filteredAndSortedStudents;
  const totalPages = 1; // Backend handles this

  // Handle sort
  const handleSort = (columnKey: string) => {
    if (sortField === columnKey) {
      // Toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortField(columnKey as SortField);
      setSortOrder("asc");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedGender("all");
    setGroupsFilter("all");
    setAgeRange([0, 100]);
    setSelectedTeacher("all");
    setSelectedGroup("all");
    setCurrentPage(1);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedGender,
    setSelectedGender,
    groupsFilter,
    setGroupsFilter,
    ageRange,
    setAgeRange,
    showFilters,
    setShowFilters,
    currentPage,
    setCurrentPage,
    studentsPerPage,
    setStudentsPerPage,
    activeFiltersCount,
    filteredAndSortedStudents,
    currentStudents,
    totalPages,
    resetFilters,
    selectedTeacher,
    setSelectedTeacher,
    selectedGroup,
    setSelectedGroup,
    sortField,
    sortOrder,
    handleSort,
    buildFiltersObject, // Export for use in export function
  };
};
