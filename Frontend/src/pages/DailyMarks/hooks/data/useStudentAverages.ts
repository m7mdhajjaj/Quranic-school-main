import { useState, useEffect, useCallback } from "react";
import { getStudentAverages } from "@/Api/DailyMark/dailyMarksApi";

interface StudentAverages {
  reviewAverage: number;
  memorizationAverage: number;
  overallAverage: number;
  totalMarks: number;
}

interface UseStudentAveragesReturn {
  averages: StudentAverages;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching student averages from backend
 * 
 * @description
 * - Fetches review, memorization, and overall averages for a student
 * - Filters by month, year, and group
 * - Auto-updates when filters or student selection changes
 * - Defaults to current month/year when filters are null
 * 
 * @param {string | null} studentId - Student ID to fetch averages for
 * @param {string} selectedGroup - Selected group name
 * @param {number | null} selectedMonth - Selected month (1-12) or null for current month
 * @param {number | null} selectedYear - Selected year or null for current year
 * @param {boolean} enabled - Whether to fetch data (default: true)
 * 
 * @returns {UseStudentAveragesReturn} Student averages and loading state
 */
export const useStudentAverages = (
  studentId: string | null,
  selectedGroup: string,
  selectedMonth: number | null,
  selectedYear: number | null,
  enabled: boolean = true
): UseStudentAveragesReturn => {
  const [averages, setAverages] = useState({
    reviewAverage: 0,
    memorizationAverage: 0,
    overallAverage: 0,
    totalMarks: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAverages = useCallback(async () => {
    // Don't fetch if disabled or no student selected
    if (!enabled || !studentId) {
      setAverages({
        reviewAverage: 0,
        memorizationAverage: 0,
        overallAverage: 0,
        totalMarks: 0,
      });
      return;
    }

    // Use current month/year as defaults if not specified
    const now = new Date();
    const monthToUse = selectedMonth ?? now.getMonth() + 1; // getMonth() returns 0-11
    const yearToUse = selectedYear ?? now.getFullYear();

    setLoading(true);
    setError(null);

    try {
      const response = await getStudentAverages(studentId, {
        month: monthToUse,
        year: yearToUse,
        group: selectedGroup,
      });

      if (response.success && response.data) {
        setAverages({
          reviewAverage: response.data.reviewAverage,
          memorizationAverage: response.data.memorizationAverage,
          overallAverage: response.data.overallAverage,
          totalMarks: response.data.totalMarks,
        });
      } else {
        setError(response.message || "فشل تحميل المعدلات");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحميل المعدلات");
    } finally {
      setLoading(false);
    }
  }, [enabled, studentId, selectedGroup, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAverages();
  }, [fetchAverages]);

  return {
    averages,
    loading,
    error,
    refetch: fetchAverages,
  };
};
