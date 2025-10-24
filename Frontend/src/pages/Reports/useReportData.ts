// ============================================================================
// Reports/useReportData.ts - Custom Hook for Report Data Management
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { getStudentMarks, getAverageMarks } from "../../Api/reportApi";
import { getProfile } from "../../Api/profileApi";

interface ChartData {
  labels: string[];
  data: number[];
}

interface UseReportDataReturn {
  loading: boolean;
  userRole: string;
  userId: string;
  chartData: ChartData;
  selectedMonth: number | null;
  selectedYear: number | null;
  setSelectedMonth: (month: number | null) => void;
  setSelectedYear: (year: number | null) => void;
  loadChartData: () => Promise<void>;
}

export const useReportData = (): UseReportDataReturn => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("teacher");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    data: [],
  });
  const [userId, setUserId] = useState<string>("");

  // Load chart data based on filters
  const loadChartData = useCallback(
    async (role?: string, id?: string) => {
      try {
        const currentRole = role || userRole;
        const currentUserId = id || userId;

        const params = {
          month: selectedMonth || undefined,
          year: selectedYear || undefined,
          ...(currentRole === "student" && { studentId: currentUserId }),
        };

        const data =
          currentRole === "student"
            ? await getStudentMarks(params)
            : await getAverageMarks(params);
        setChartData(data);
      } catch (error) {
        console.error("خطأ في تحميل بيانات الرسم البياني:", error);
      }
    },
    [selectedMonth, selectedYear, userRole, userId]
  );

  // Initialize component and load user data
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        setUserRole(profile.role || "teacher");
        setUserId(profile._id || "");
        await loadChartData(profile.role, profile._id);
      } catch (error) {
        console.error("خطأ في تحميل بيانات المستخدم:", error);
        setUserRole("teacher");
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    if (!loading && userId) {
      loadChartData();
    }
  }, [selectedMonth, selectedYear, userRole, userId, loading, loadChartData]);

  return {
    loading,
    userRole,
    userId,
    chartData,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    loadChartData,
  };
};
