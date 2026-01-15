import { useState, useMemo, useCallback } from "react";
import type { Secretary, SortField, SortOrder, GenderFilter, ViewMode } from "../types";

export const useSecretariesFilters = (secretaries: Secretary[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("secretaryId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);

  // Handle sort
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }, [sortField]);

  // Toggle filters
  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setGenderFilter("all");
    setAgeRange([0, 100]);
  }, []);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (genderFilter !== "all") count++;
    if (ageRange[0] !== 0 || ageRange[1] !== 100) count++;
    return count;
  }, [genderFilter, ageRange]);

  // Filtered and sorted secretaries
  const filteredSecretaries = useMemo(() => {
    let result = [...secretaries];

    // Filter by search term
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(search) ||
          s.lastName?.toLowerCase().includes(search) ||
          s.email?.toLowerCase().includes(search) ||
          s.phoneNumber?.includes(search) ||
          s.idNumber?.includes(search) ||
          s.secretaryId?.toString().includes(search)
      );
    }

    // Filter by gender
    if (genderFilter !== "all") {
      result = result.filter(
        (s) =>
          s.gender === genderFilter ||
          (genderFilter === "ذكر" && s.gender === "male") ||
          (genderFilter === "أنثى" && s.gender === "female")
      );
    }

    // Filter by age range
    if (ageRange[0] !== 0 || ageRange[1] !== 100) {
      result = result.filter((s) => {
        const age = s.age || 0;
        return age >= ageRange[0] && age <= ageRange[1];
      });
    }

    // Sort
    result.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "secretaryId":
          aValue = a.secretaryId || 0;
          bValue = b.secretaryId || 0;
          break;
        case "firstName":
          aValue = a.firstName || "";
          bValue = b.firstName || "";
          break;
        case "age":
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case "email":
          aValue = a.email || "";
          bValue = b.email || "";
          break;
        default:
          aValue = a.secretaryId || 0;
          bValue = b.secretaryId || 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue, "ar")
          : bValue.localeCompare(aValue, "ar");
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return result;
  }, [secretaries, searchQuery, genderFilter, ageRange, sortField, sortOrder]);

  return {
    searchQuery,
    setSearchQuery,
    genderFilter,
    setGenderFilter,
    viewMode,
    setViewMode,
    sortField,
    sortOrder,
    handleSort,
    filteredSecretaries,
    showFilters,
    setShowFilters,
    toggleFilters,
    ageRange,
    setAgeRange,
    activeFiltersCount,
    resetFilters,
  };
};
