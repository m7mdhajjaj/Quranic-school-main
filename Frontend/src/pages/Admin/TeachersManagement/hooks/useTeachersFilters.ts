import { useState, useEffect, useMemo, useCallback } from "react";
import type { SortField, SortOrder, GroupsFilter, TeacherFiltersParams } from "../types";

export const useTeachersFilters = (
  fetchTeachers: (retryAttempt?: number, filters?: TeacherFiltersParams) => Promise<void>
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [groupsFilter, setGroupsFilter] = useState<GroupsFilter>("all");
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("teacherId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGender !== "all") count++;
    if (groupsFilter !== "all") count++;
    if (ageRange[0] !== 0 || ageRange[1] !== 100) count++;
    if (searchTerm) count++;
    return count;
  }, [selectedGender, groupsFilter, ageRange, searchTerm]);

  // Helper to build filters object
  const buildFiltersObject = useCallback((): TeacherFiltersParams => {
    const filters: TeacherFiltersParams = {};
    
    if (selectedGender !== "all") filters.gender = selectedGender;
    if (ageRange[0] !== 0) filters.minAge = ageRange[0];
    if (ageRange[1] !== 100) filters.maxAge = ageRange[1];
    if (groupsFilter !== "all") filters.group = groupsFilter;
    if (searchTerm?.trim()) filters.search = searchTerm.trim();
    if (sortField) {
      filters.sortBy = sortField;
      filters.sortOrder = sortOrder;
    }
    filters.page = currentPage;
    filters.limit = 1000;
    
    return filters;
  }, [selectedGender, ageRange, groupsFilter, searchTerm, sortField, sortOrder, currentPage]);

  // Server-side filtering - كل الفلترة تتم في الـ Backend
  useEffect(() => {
    const applyFilters = async () => {
      const filters = buildFiltersObject();
      console.log('🔍 Applying filters:', filters);
      await fetchTeachers(0, filters);
    };

    const debounceTimer = setTimeout(() => {
      applyFilters();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(debounceTimer);
  }, [buildFiltersObject, fetchTeachers]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedGender,
    groupsFilter,
    ageRange,
    sortField,
    sortOrder,
  ]);

  // Handle sort
  const handleSort = (columnKey: string) => {
    if (sortField === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
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
    setCurrentPage(1);
    setSortField("teacherId");
    setSortOrder("asc");
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
    sortField,
    sortOrder,
    handleSort,
    currentPage,
    setCurrentPage,
    activeFiltersCount,
    resetFilters,
    buildFiltersObject,
  };
};
