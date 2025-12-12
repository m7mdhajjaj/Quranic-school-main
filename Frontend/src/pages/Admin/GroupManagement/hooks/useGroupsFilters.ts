import { useState, useMemo, useCallback } from "react";
import type {
  SortField,
  SortOrder,
  CapacityFilter,
  StatusFilter,
} from "../types";
import type { GroupsQueryParams } from "@/Api/groupApi";

// ✅ هذا الـ hook الآن يدير state الفلاتر فقط - الفلترة الفعلية في Backend
export const useGroupsFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState<CapacityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [groupsPerPage, setGroupsPerPage] = useState(10);

  // ✅ تجميع الفلاتر لإرسالها للـ Backend
  const getFiltersParams = useCallback((): GroupsQueryParams => {
    return {
      search: searchTerm || undefined,
      capacity: capacityFilter !== "all" ? capacityFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      sortBy: sortField,
      sortOrder,
      page: currentPage,
      limit: groupsPerPage,
    };
  }, [
    searchTerm,
    capacityFilter,
    statusFilter,
    sortField,
    sortOrder,
    currentPage,
    groupsPerPage,
  ]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (capacityFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (searchTerm) count++;
    return count;
  }, [
    capacityFilter,
    statusFilter,
    searchTerm,
  ]);

  // Handle sorting
  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      const isSameField = prev === field;
      if (isSameField) {
        setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
      } else {
        setSortOrder("asc");
      }
      return field;
    });
    setCurrentPage(1);
  }, []);

  // ✅ لا حاجة للفلترة في Frontend - Backend يقوم بها
  // نبقي فقط reset function
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setCapacityFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  }, []);

  return useMemo(() => ({
    // Search & Filters
    searchTerm,
    setSearchTerm,
    capacityFilter,
    setCapacityFilter,
    statusFilter,
    setStatusFilter,

    // Sorting
    sortField,
    sortOrder,
    handleSort,

    // Pagination
    currentPage,
    setCurrentPage,
    groupsPerPage,
    setGroupsPerPage,

    // Utility functions
    getFiltersParams,
    activeFiltersCount,
    resetFilters,
  }), [
    searchTerm,
    capacityFilter,
    statusFilter,
    sortField,
    sortOrder,
    currentPage,
    groupsPerPage,
    getFiltersParams,
    activeFiltersCount,
    handleSort,
    resetFilters
  ]);
};
