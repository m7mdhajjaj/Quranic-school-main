import { useState, useEffect, useCallback } from "react";
import { getFilteredMarks, getFilteredSections } from "@/Api/dailyMarksApi";
import type { Section, Mark } from "../types/types";

/**
 * Custom hook for fetching filtered marks and sections
 * Uses the new filtered API endpoints
 */
export const useFilteredMarksData = (
  selectedStudentId: string | null,
  selectedGroup: string,
  selectedMonth: number,
  selectedYear: number,
  searchQuery: string,
  enabled: boolean = true
) => {
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
        search: searchQuery,
        group: selectedGroup,
        studentId: selectedStudentId,
      });

      // Fetch sections and marks in parallel
      const [sectionsResponse, marksResponse] = await Promise.all([
        getFilteredSections({
          month: selectedMonth,
          year: selectedYear,
          search: searchQuery || undefined,
          group: selectedGroup,
        }),
        getFilteredMarks({
          month: selectedMonth,
          year: selectedYear,
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
  }, [enabled, selectedStudentId, selectedGroup, selectedMonth, selectedYear, searchQuery]);

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
