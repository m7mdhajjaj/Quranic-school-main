import { useState, useMemo } from "react";
import type {
  Group,
  SortField,
  SortOrder,
  TeacherFilter,
  CapacityFilter,
  StatusFilter,
  OccupancyFilter,
  DayFilter,
  TimeFilter,
} from "../types";

export const useGroupsFilters = (groups: Group[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherFilter>("all");
  const [capacityFilter, setCapacityFilter] = useState<CapacityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [occupancyFilter, setOccupancyFilter] =
    useState<OccupancyFilter>("all");
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [groupsPerPage, setGroupsPerPage] = useState(10);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedTeacher !== "all") count++;
    if (capacityFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (occupancyFilter !== "all") count++;
    if (dayFilter !== "all") count++;
    if (timeFilter !== "all") count++;
    if (searchTerm) count++;
    return count;
  }, [
    selectedTeacher,
    capacityFilter,
    statusFilter,
    occupancyFilter,
    dayFilter,
    timeFilter,
    searchTerm,
  ]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Enhanced filtering and sorting with multiple criteria
  const filteredAndSortedGroups = useMemo(() => {
    console.log("🔍 بدء الفلترة المتقدمة...", {
      totalGroups: groups.length,
      activeFilters: {
        teacher: selectedTeacher,
        capacity: capacityFilter,
        status: statusFilter,
        occupancy: occupancyFilter,
        day: dayFilter,
        time: timeFilter,
        search: searchTerm,
      },
    });

    const filtered = groups.filter((group) => {
      // 1. البحث النصي المتقدم
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (group.name || "").toLowerCase().includes(searchLower) ||
        (group.description || "").toLowerCase().includes(searchLower) ||
        (group.teacher || "").toLowerCase().includes(searchLower) ||
        (group.schedule || "").toLowerCase().includes(searchLower) ||
        // البحث في جدول الأوقات
        (group.timetable &&
          group.timetable.some(
            (session) =>
              session.day.toLowerCase().includes(searchLower) ||
              session.startHour.toLowerCase().includes(searchLower) ||
              session.endHour.toLowerCase().includes(searchLower)
          ));

      // 2. فلتر المعلم
      const matchesTeacher =
        selectedTeacher === "all" || group.teacher === selectedTeacher;

      // 3. فلتر السعة
      const matchesCapacity =
        capacityFilter === "all" ||
        (capacityFilter === "small" && (group.capacity || 0) <= 15) ||
        (capacityFilter === "medium" &&
          (group.capacity || 0) > 15 &&
          (group.capacity || 0) <= 25) ||
        (capacityFilter === "large" && (group.capacity || 0) > 25);

      // 4. فلتر الحالة (نشط/غير نشط)
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && group.isActive) ||
        (statusFilter === "inactive" && !group.isActive);

      // 5. فلتر الإشغال
      const occupancyPercentage = group.capacity
        ? ((group.currentStudents || 0) / group.capacity) * 100
        : 0;
      const matchesOccupancy =
        occupancyFilter === "all" ||
        (occupancyFilter === "empty" && (group.currentStudents || 0) === 0) ||
        (occupancyFilter === "low" &&
          occupancyPercentage > 0 &&
          occupancyPercentage <= 50) ||
        (occupancyFilter === "medium" &&
          occupancyPercentage > 50 &&
          occupancyPercentage <= 80) ||
        (occupancyFilter === "high" &&
          occupancyPercentage > 80 &&
          occupancyPercentage < 100) ||
        (occupancyFilter === "full" && occupancyPercentage >= 100);

      // 6. فلتر اليوم
      const matchesDay =
        dayFilter === "all" ||
        (group.timetable &&
          group.timetable.some((session) => session.day === dayFilter));

      // 7. فلتر الوقت
      const matchesTime =
        timeFilter === "all" ||
        (timeFilter === "morning" &&
          group.timetable &&
          group.timetable.some((session) => {
            const startHour = parseInt(session.startHour.split(":")[0]);
            return startHour >= 6 && startHour < 12;
          })) ||
        (timeFilter === "afternoon" &&
          group.timetable &&
          group.timetable.some((session) => {
            const startHour = parseInt(session.startHour.split(":")[0]);
            return startHour >= 12 && startHour < 18;
          })) ||
        (timeFilter === "evening" &&
          group.timetable &&
          group.timetable.some((session) => {
            const startHour = parseInt(session.startHour.split(":")[0]);
            return startHour >= 18 && startHour < 24;
          }));

      return (
        matchesSearch &&
        matchesTeacher &&
        matchesCapacity &&
        matchesStatus &&
        matchesOccupancy &&
        matchesDay &&
        matchesTime
      );
    });

    // الترتيب المحسن
    filtered.sort((a, b) => {
      let compareResult = 0;

      if (sortField === "name") {
        compareResult = (a.name || "").localeCompare(b.name || "", "ar");
      } else if (sortField === "teacher") {
        compareResult = (a.teacher || "").localeCompare(b.teacher || "", "ar");
      } else if (sortField === "capacity") {
        compareResult = (a.capacity || 0) - (b.capacity || 0);
      }

      return sortOrder === "asc" ? compareResult : -compareResult;
    });

    console.log("✅ نتيجة الفلترة المتقدمة:", {
      إجمالي_الحلقات: groups.length,
      الحلقات_المفلترة: filtered.length,
      الفلاتر_النشطة: activeFiltersCount,
    });

    return filtered;
  }, [
    groups,
    searchTerm,
    selectedTeacher,
    capacityFilter,
    statusFilter,
    occupancyFilter,
    dayFilter,
    timeFilter,
    sortField,
    sortOrder,
    activeFiltersCount,
  ]);

  // Pagination
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = filteredAndSortedGroups.slice(
    indexOfFirstGroup,
    indexOfLastGroup
  );
  const totalPages = Math.ceil(filteredAndSortedGroups.length / groupsPerPage);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedTeacher("all");
    setCapacityFilter("all");
    setStatusFilter("all");
    setOccupancyFilter("all");
    setDayFilter("all");
    setTimeFilter("all");
    setCurrentPage(1);
  };

  return {
    // Search & Filters
    searchTerm,
    setSearchTerm,
    selectedTeacher,
    setSelectedTeacher,
    capacityFilter,
    setCapacityFilter,
    statusFilter,
    setStatusFilter,
    occupancyFilter,
    setOccupancyFilter,
    dayFilter,
    setDayFilter,
    timeFilter,
    setTimeFilter,

    // Sorting
    sortField,
    sortOrder,
    handleSort,

    // Pagination
    currentPage,
    setCurrentPage,
    groupsPerPage,
    setGroupsPerPage,

    // Results
    filteredAndSortedGroups,
    currentGroups,
    totalPages,
    activeFiltersCount,
    resetFilters,
  };
};
