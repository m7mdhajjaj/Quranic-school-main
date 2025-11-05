import { useState, useEffect, useMemo } from "react";
import type { Teacher, SortField, SortOrder, GroupsFilter } from "../types";

export const useTeachersFilters = (teachers: Teacher[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [groupsFilter, setGroupsFilter] = useState<GroupsFilter>("all");
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("teacherId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [teachersPerPage, setTeachersPerPage] = useState(10);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGender !== "all") count++;
    if (groupsFilter !== "all") count++;
    if (ageRange[0] !== 0 || ageRange[1] !== 100) count++;
    if (searchTerm) count++;
    return count;
  }, [selectedGender, groupsFilter, ageRange, searchTerm]);

  // Filter and sort teachers
  const filteredAndSortedTeachers = useMemo(() => {
    const filtered = teachers.filter((teacher) => {
      // Groups filter
      const hasGroups =
        teacher.groups &&
        Array.isArray(teacher.groups) &&
        teacher.groups.length > 0;

      if (groupsFilter === "withGroups" && !hasGroups) return false;
      if (groupsFilter === "withoutGroups" && hasGroups) return false;

      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (teacher.firstName || "").toLowerCase().includes(searchLower) ||
        (teacher.lastName || "").toLowerCase().includes(searchLower) ||
        (teacher.fatherName || "").toLowerCase().includes(searchLower) ||
        (teacher.idNumber || "").includes(searchLower) ||
        teacher.teacherId.toString().includes(searchLower) ||
        (teacher.email || "").toLowerCase().includes(searchLower) ||
        (teacher.phoneNumber || "").includes(searchLower);

      // Gender filter
      const matchesGender =
        selectedGender === "all" || teacher.gender === selectedGender;

      // Age filter
      const matchesAge = teacher.age
        ? teacher.age >= ageRange[0] && teacher.age <= ageRange[1]
        : true;

      return matchesSearch && matchesGender && matchesAge;
    });

    // Sort
    filtered.sort((a, b) => {
      let compareResult = 0;

      if (sortField === "teacherId") {
        compareResult = a.teacherId - b.teacherId;
      } else if (sortField === "firstName") {
        compareResult = a.firstName.localeCompare(b.firstName, "ar");
      } else if (sortField === "age") {
        compareResult = (a.age || 0) - (b.age || 0);
      } else if (sortField === "email") {
        compareResult = a.email.localeCompare(b.email);
      }

      return sortOrder === "asc" ? compareResult : -compareResult;
    });

    return filtered;
  }, [
    teachers,
    searchTerm,
    selectedGender,
    groupsFilter,
    ageRange,
    sortField,
    sortOrder,
  ]);

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

  // Pagination
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredAndSortedTeachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher
  );
  const totalPages = Math.ceil(
    filteredAndSortedTeachers.length / teachersPerPage
  );

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedGender("all");
    setGroupsFilter("all");
    setAgeRange([0, 100]);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
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
    teachersPerPage,
    setTeachersPerPage,
    activeFiltersCount,
    filteredAndSortedTeachers,
    currentTeachers,
    totalPages,
    resetFilters,
  };
};
