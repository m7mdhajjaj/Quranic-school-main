import { useState, useEffect, useCallback } from "react";
import { getFilteredMarks, getFilteredSections } from "@/Api/DailyMark/dailyMarksApi";
import type { Section, Mark } from "../types/types";

interface UseFilteredMarksDataReturn {
  sections: Section[];
  marks: Mark[];
  loading: boolean;
  error: string | null;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setMarks: React.Dispatch<React.SetStateAction<Mark[]>>;
  refetch: (studentId?: string) => Promise<void>;
  refetchSections: () => Promise<void>;
  refetchMarksOnly: () => Promise<void>;
  refetchSectionsOnly: () => Promise<void>;
}

/**
 * Custom hook for fetching filtered marks and sections
 * 
 * @description
 * - Uses the new filtered API endpoints
 * - Fetches data based on selected filters (month, year, day, search, group)
 * - Provides refetch functions for real-time updates
 * - Optimized with parallel API calls
 * - Defaults to current month/year when filters are null
 * 
 * @param {string | null} selectedStudentId - Selected student ID
 * @param {string} selectedGroup - Selected group name
 * @param {number | null} selectedMonth - Selected month (1-12) or null for current month
 * @param {number | null} selectedYear - Selected year or null for current year
 * @param {number | null} selectedDay - Selected day (1-31) or null for all days
 * @param {string} searchQuery - Search query for filtering
 * @param {boolean} enabled - Whether to fetch data (default: true)
 * @param {string | null} startDate - Start date for range filtering
 * @param {string | null} endDate - End date for range filtering
 * 
 * @returns {UseFilteredMarksDataReturn} Sections, marks, and data management functions
 */
export const useFilteredMarksData = (
  selectedStudentId: string | null,
  selectedGroup: string,
  selectedMonth: number | null,
  selectedYear: number | null,
  selectedDay: number | null,
  searchQuery: string,
  enabled: boolean = true,
  startDate: string | null = null,
  endDate: string | null = null,
  period: 'week' | 'all' = 'all' // New parameter
): UseFilteredMarksDataReturn => {
  const [sections, setSections] = useState<Section[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getFilters = useCallback(() => {
    const now = new Date();
    const monthToUse = selectedMonth ?? now.getMonth() + 1;
    const yearToUse = selectedYear ?? now.getFullYear();

    return {
      monthToUse,
      yearToUse,
      day: selectedDay || undefined,
      search: searchQuery || undefined,
      group: selectedGroup,
      studentId: selectedStudentId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      period: period // Add period to filters
    };
  }, [
    selectedMonth,
    selectedYear,
    selectedDay,
    searchQuery,
    selectedGroup,
    selectedStudentId,
    startDate,
    endDate,
    period
  ]);

  const fetchSectionsOnly = useCallback(async () => {
    if (!enabled || !selectedGroup) {
      setSections([]);
      return;
    }

    const f = getFilters();
    const sectionsResponse = await getFilteredSections({
      month: f.monthToUse,
      year: f.yearToUse,
      day: f.day,
      search: f.search,
      group: f.group,
      startDate: f.startDate,
      endDate: f.endDate,
      period: f.period // Pass period to API
    });

    if (sectionsResponse.success && sectionsResponse.data) {
      setSections(sectionsResponse.data);
    } else {
      console.warn("⚠️ Failed to load sections:", sectionsResponse.message);
      setSections([]);
    }
  }, [enabled, selectedGroup, getFilters]);

  const fetchMarksOnly = useCallback(async () => {
    if (!enabled || !selectedGroup) {
      setMarks([]);
      return;
    }

    const f = getFilters();
    const marksResponse = await getFilteredMarks({
      month: f.monthToUse,
      year: f.yearToUse,
      day: f.day,
      search: f.search,
      group: f.group,
      studentId: f.studentId,
      limit: 500,
      startDate: f.startDate,
      endDate: f.endDate,
    });

    if (marksResponse.success && marksResponse.data) {
      setMarks(marksResponse.data);
    } else {
      console.warn("⚠️ Failed to load marks:", marksResponse.message);
      setMarks([]);
    }
  }, [enabled, selectedGroup, getFilters]);

  // Fetch filtered data based on current filters
  const fetchFilteredData = useCallback(async () => {
    // Don't fetch if disabled or no group is selected
    if (!enabled || !selectedGroup) {
      setSections([]);
      setMarks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const f = getFilters();
      // Fetch sections and marks in parallel
      const [sectionsResponse, marksResponse] = await Promise.all([
        getFilteredSections({
          month: f.monthToUse,
          year: f.yearToUse,
          day: f.day,
          search: f.search,
          group: f.group,
          startDate: f.startDate,
          endDate: f.endDate,
          period: f.period,
        }),
        getFilteredMarks({
          month: f.monthToUse,
          year: f.yearToUse,
          day: f.day,
          search: f.search,
          group: f.group,
          studentId: f.studentId,
          limit: 500, // Increased limit for better performance
          startDate: f.startDate,
          endDate: f.endDate,
        }),
      ]);

      if (sectionsResponse.success && sectionsResponse.data) {
        setSections(sectionsResponse.data);
      } else {
        setSections([]);
      }

      if (marksResponse.success && marksResponse.data) {
        setMarks(marksResponse.data);
      } else {
        setMarks([]);
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحميل البيانات");
      setSections([]);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, selectedGroup, getFilters]);

  // Fetch data when filters change
  useEffect(() => {
    fetchFilteredData();
  }, [fetchFilteredData]);

  // Refetch function for manual refresh (matches socket effects signature)
  const refetch = useCallback(async (_studentId?: string) => {
    await fetchFilteredData();
  }, [fetchFilteredData]);

  // Refetch sections (matches socket effects signature)
  const refetchSections = useCallback(async () => {
    await fetchFilteredData();
  }, [fetchFilteredData]);

  return {
    sections,
    marks,
    loading,
    error,
    setSections,
    setMarks,
    refetch,
    refetchSections,
    refetchMarksOnly: async () => {
      await fetchMarksOnly();
    },
    refetchSectionsOnly: async () => {
      await fetchSectionsOnly();
    },
  };
};
