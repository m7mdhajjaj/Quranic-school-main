// ============================================================================
// Reports/useReportData.ts - Custom Hook for Report Data Management
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { getStudentMarks, getAverageMarks } from "@/Api/reportApi";
import { getProfile } from "@/Api/profileApi";
import { getTeacherGroupsForPointsGame } from "@/Api/pointsGameApi";

interface Group {
  _id: string;
  name: string;
  totalStudents: number;
}

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
  groups: Group[];
  selectedGroupId: string;
  setSelectedGroupId: (groupId: string) => void;
}

export const useReportData = (): UseReportDataReturn => {
  // تعيين الشهر والسنة الحالية تلقائياً
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(
    currentDate.getFullYear()
  );
  const [userRole, setUserRole] = useState<string>("teacher");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    data: [],
  });
  const [userId, setUserId] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  // Load teacher groups
  const loadTeacherGroups = useCallback(async () => {
    try {
      const groupsData = await getTeacherGroupsForPointsGame();
      setGroups(groupsData || []);
      if (groupsData && groupsData.length > 0) {
        setSelectedGroupId(groupsData[0]._id);
      }
    } catch (error) {
      console.error("خطأ في تحميل حلقات المعلم:", error);
    }
  }, []);

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
          ...(currentRole === "teacher" &&
            selectedGroupId && { groupId: selectedGroupId }),
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
    [selectedMonth, selectedYear, userRole, userId, selectedGroupId]
  );

  // Initialize component and load user data
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        setUserRole(profile.role || "teacher");
        setUserId(profile._id || "");

        // Load teacher groups if teacher
        if (profile.role === "teacher") {
          await loadTeacherGroups();
        }

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

  // Reload data when filters or selectedGroupId change
  useEffect(() => {
    if (!loading && userId) {
      loadChartData();
    }
  }, [selectedMonth, selectedYear, selectedGroupId]);

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
    groups,
    selectedGroupId,
    setSelectedGroupId,
  };
};
