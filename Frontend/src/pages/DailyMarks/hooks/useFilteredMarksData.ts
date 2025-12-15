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
 * 
 * @param {string | null} selectedStudentId - Selected student ID
 * @param {string} selectedGroup - Selected group name
 * @param {number} selectedMonth - Selected month (1-12)
 * @param {number} selectedYear - Selected year
 * @param {number | null} selectedDay - Selected day (1-31) or null for all days
 * @param {string} searchQuery - Search query for filtering
 * @param {boolean} enabled - Whether to fetch data (default: true)
 * 
 * @returns {UseFilteredMarksDataReturn} Sections, marks, and data management functions
 */
export const useFilteredMarksData = (
  selectedStudentId: string | null,
  selectedGroup: string,
  selectedMonth: number,
  selectedYear: number,
  selectedDay: number | null,
  searchQuery: string,
  enabled: boolean = true
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

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching filtered data:", {
        month: selectedMonth,
        year: selectedYear,
        day: selectedDay,
        search: searchQuery,
        group: selectedGroup,
        studentId: selectedStudentId,
      });

      // Fetch sections and marks in parallel
      const [sectionsResponse, marksResponse] = await Promise.all([
        getFilteredSections({
          month: selectedMonth,
          year: selectedYear,
          day: selectedDay || undefined,
          search: searchQuery || undefined,
          group: selectedGroup,
        }),
        getFilteredMarks({
          month: selectedMonth,
          year: selectedYear,
          day: selectedDay || undefined,
          search: searchQuery || undefined,
          group: selectedGroup,
          studentId: selectedStudentId || undefined,
          limit: 500, // Increased limit for better performance
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
  }, [enabled, selectedStudentId, selectedGroup, selectedMonth, selectedYear, selectedDay, searchQuery]);

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
