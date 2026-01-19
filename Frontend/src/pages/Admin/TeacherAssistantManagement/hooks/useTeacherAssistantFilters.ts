import { useState, useCallback, useMemo } from "react";
import { DEFAULT_VALUES } from "../constants";
import type { TeacherAssistantFiltersParams } from "@/Api/teacherAssistantApi";
import type { GenderFilter, GroupsAssignmentFilter, SortField, SortOrder } from "../types";

export interface UseTeacherAssistantFiltersReturn {
  // Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  genderFilter: GenderFilter;
  setGenderFilter: (filter: GenderFilter) => void;
  groupsAssignmentFilter: GroupsAssignmentFilter;
  setGroupsAssignmentFilter: (filter: GroupsAssignmentFilter) => void;
  ageRange: [number, number];
  setAgeRange: (range: [number, number]) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  
  // Computed Values
  activeFiltersCount: number;
  filtersParams: TeacherAssistantFiltersParams;
  
  // Filter Actions
  resetFilters: () => void;
  toggleFilters: () => void;
  handleSort: (field: SortField) => void;
}

export const useTeacherAssistantFilters = (): UseTeacherAssistantFiltersReturn => {
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [groupsAssignmentFilter, setGroupsAssignmentFilter] = useState<GroupsAssignmentFilter>("all");
  const [ageRange, setAgeRange] = useState<[number, number]>(DEFAULT_VALUES.AGE_RANGE);
  const [sortField, setSortField] = useState<SortField>(DEFAULT_VALUES.SORT_FIELD);
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_VALUES.SORT_ORDER);
  const [showFilters, setShowFilters] = useState(false);

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (genderFilter !== "all") count++;
    if (groupsAssignmentFilter !== "all") count++;
    if (ageRange[0] !== DEFAULT_VALUES.AGE_RANGE[0] || ageRange[1] !== DEFAULT_VALUES.AGE_RANGE[1]) count++;
    return count;
  }, [genderFilter, groupsAssignmentFilter, ageRange]);

  // بناء كائن الفلاتر للباك إند
  const filtersParams: TeacherAssistantFiltersParams = useMemo(() => ({
    search: searchQuery || undefined,
    gender: genderFilter !== "all" ? genderFilter : undefined,
    minAge: ageRange[0] > DEFAULT_VALUES.AGE_RANGE[0] ? ageRange[0] : undefined,
    maxAge: ageRange[1] < DEFAULT_VALUES.AGE_RANGE[1] ? ageRange[1] : undefined,
    hasGroups: groupsAssignmentFilter !== "all" ? groupsAssignmentFilter : undefined,
    sortBy: sortField,
    sortOrder: sortOrder,
  }), [searchQuery, genderFilter, groupsAssignmentFilter, ageRange, sortField, sortOrder]);

  const resetFilters = useCallback(() => {
    setGenderFilter("all");
    setGroupsAssignmentFilter("all");
    setAgeRange(DEFAULT_VALUES.AGE_RANGE);
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }, [sortField]);

  return {
    // State
    searchQuery,
    setSearchQuery,
    genderFilter,
    setGenderFilter,
    groupsAssignmentFilter,
    setGroupsAssignmentFilter,
    ageRange,
    setAgeRange,
    sortField,
    sortOrder,
    showFilters,
    setShowFilters,
    
    // Computed
    activeFiltersCount,
    filtersParams,
    
    // Actions
    resetFilters,
    toggleFilters,
    handleSort,
  };
};
