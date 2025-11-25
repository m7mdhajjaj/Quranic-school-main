import { useState, useEffect } from "react";
import { getStudentAverages } from "@/Api/dailyMarksApi";

/**
 * Custom hook for fetching student averages from backend
 */
export const useStudentAverages = (
  studentId: string | null,
  selectedGroup: string,
  selectedMonth: number,
  selectedYear: number,
  enabled: boolean = true
) => {
  const [averages, setAverages] = useState({
    reviewAverage: 0,
    memorizationAverage: 0,
    overallAverage: 0,
    totalMarks: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAverages = async () => {
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

      setLoading(true);
      setError(null);

      try {
        console.log("📊 Fetching averages from backend:", {
          studentId,
          month: selectedMonth,
          year: selectedYear,
          group: selectedGroup,
        });
        console.log("🔍 Enabled:", enabled, "StudentId:", studentId, "Group:", selectedGroup);

        const response = await getStudentAverages(studentId, {
          month: selectedMonth,
          year: selectedYear,
          group: selectedGroup,
        });

        if (response.success && response.data) {
          setAverages({
            reviewAverage: response.data.reviewAverage,
            memorizationAverage: response.data.memorizationAverage,
            overallAverage: response.data.overallAverage,
            totalMarks: response.data.totalMarks,
          });
          console.log("✅ Averages loaded:", response.data);
        } else {
          console.warn("⚠️ Failed to load averages:", response.message);
          setError(response.message || "فشل تحميل المعدلات");
        }
      } catch (err) {
        console.error("❌ Error fetching averages:", err);
        setError("حدث خطأ أثناء تحميل المعدلات");
      } finally {
        setLoading(false);
      }
    };

    fetchAverages();
  }, [enabled, studentId, selectedGroup, selectedMonth, selectedYear]);

  return {
    averages,
    loading,
    error,
  };
};
