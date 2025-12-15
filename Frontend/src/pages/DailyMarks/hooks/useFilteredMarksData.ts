import { useState, useEffect, useCallback } from "react";
import { getFilteredMarks, getFilteredSections } from "@/Api/dailyMarksApi";
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
  endDate: string | null = null
): UseFilteredMarksDataReturn => {
  const [sections, setSections] = useState<Section[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch filtered data based on current filters
  const fetchFilteredData = useCallback(async () => {
    // Don't fetch if disabled or no group is selected
    if (!enabled || !selectedGroup) {
      setSections([]);
      setMarks([]);
      return;
    }

    // Use current month/year as defaults if not specified
    const now = new Date();
    const monthToUse = selectedMonth ?? now.getMonth() + 1; // getMonth() returns 0-11
    const yearToUse = selectedYear ?? now.getFullYear();

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching filtered data:", {
        month: monthToUse,
        year: yearToUse,
        day: selectedDay,
        search: searchQuery,
        group: selectedGroup,
        studentId: selectedStudentId,
        startDate,
        endDate,
      });

      // Fetch sections and marks in parallel
      const [sectionsResponse, marksResponse] = await Promise.all([
        getFilteredSections({
          month: monthToUse,
          year: yearToUse,
          day: selectedDay || undefined,
          search: searchQuery || undefined,
          group: selectedGroup,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        getFilteredMarks({
          month: monthToUse,
          year: yearToUse,
          day: selectedDay || undefined,
          search: searchQuery || undefined,
          group: selectedGroup,
          studentId: selectedStudentId || undefined,
          limit: 500, // Increased limit for better performance
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);

      if (sectionsResponse.success && sectionsResponse.data) {
        setSections(sectionsResponse.data);
        console.log(`✅ Loaded ${sectionsResponse.data.length} filtered sections`);
      } else {
        console.warn("⚠️ Failed to load sections:", sectionsResponse.message);
        setSections([]);
      }

      if (marksResponse.success && marksResponse.data) {
        setMarks(marksResponse.data);
        console.log(`✅ Loaded ${marksResponse.data.length} filtered marks`);
      } else {
        console.warn("⚠️ Failed to load marks:", marksResponse.message);
        setMarks([]);
      }
    } catch (err) {
      console.error("❌ Error fetching filtered data:", err);
      setError("حدث خطأ أثناء تحميل البيانات");
      setSections([]);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, selectedStudentId, selectedGroup, selectedMonth, selectedYear, selectedDay, searchQuery, startDate, endDate]);

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
  };
};
