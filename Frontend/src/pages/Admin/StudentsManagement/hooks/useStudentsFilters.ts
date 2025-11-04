import { useState, useEffect, useCallback, useMemo } from "react";
import { searchStudents } from "@/Api/studentApi";
import type { Student, SortField, SortOrder, GroupsFilter } from "../types";

export const useStudentsFilters = (
  students: Student[],
  fetchStudents: () => Promise<void>
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [groupsFilter, setGroupsFilter] = useState<GroupsFilter>("all");
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField] = useState<SortField>("studentId");
  const [sortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGender !== "all") count++;
    if (groupsFilter !== "all") count++;
    if (ageRange[0] !== 0 || ageRange[1] !== 100) count++;
    if (searchTerm) count++;
    return count;
  }, [selectedGender, groupsFilter, ageRange, searchTerm]);

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

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.length > 2) {
        handleSearch(searchTerm);
      } else if (searchTerm === "") {
        fetchStudents();
      }
    }, 800);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, handleSearch, fetchStudents]);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      if (groupsFilter === "withGroups") {
        if (
          !student.group ||
          student.group.trim() === "" ||
          student.group === "غير محدد"
        ) {
          return false;
        }
      } else if (groupsFilter === "withoutGroups") {
        if (
          student.group &&
          student.group.trim() !== "" &&
          student.group !== "غير محدد"
        ) {
          return false;
        }
      }

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (student.firstName || "").toLowerCase().includes(searchLower) ||
        (student.lastName || "").toLowerCase().includes(searchLower) ||
        (student.fatherName || "").toLowerCase().includes(searchLower) ||
        (student.idNumber || "").includes(searchLower) ||
        student.studentId.toString().includes(searchLower) ||
        (student.teacher || "").toLowerCase().includes(searchLower) ||
        (student.group || "").toLowerCase().includes(searchLower);

      const matchesGender =
        selectedGender === "all" || student.gender === selectedGender;
      const matchesAge =
        (student.age || 0) >= ageRange[0] && (student.age || 0) <= ageRange[1];

      return matchesSearch && matchesGender && matchesAge;
    });

    filtered.sort((a, b) => {
      let compareResult = 0;

      if (sortField === "studentId") {
        compareResult = a.studentId - b.studentId;
      } else if (sortField === "firstName") {
        compareResult = a.firstName.localeCompare(b.firstName, "ar");
      } else if (sortField === "age") {
        compareResult = (a.age || 0) - (b.age || 0);
      } else if (sortField === "group") {
        compareResult = a.group.localeCompare(b.group, "ar");
      }

      return sortOrder === "asc" ? compareResult : -compareResult;
    });

    return filtered;
  }, [
    students,
    searchTerm,
    selectedGender,
    groupsFilter,
    ageRange,
    sortField,
    sortOrder,
  ]);

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
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredAndSortedStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(
    filteredAndSortedStudents.length / studentsPerPage
  );

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedGender("all");
    setGroupsFilter("all");
    setAgeRange([0, 100]);
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
  };
};
