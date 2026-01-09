/**
 * Custom Hook for Report Data Management
 * Manages loading and filtering of report data
 */

import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getStudentMarks,
  getAverageMarks,
  getTeacherGroups,
} from "@/Api/reportApi";
import type {
  UseReportDataReturn,
  Group,
  ChartData,
} from "@/types/report.types";

export const useReportData = (): UseReportDataReturn => {
  // Set current month and year automatically
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
      const groupsData = await getTeacherGroups();
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
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const profile = JSON.parse(userJson);
          setUserRole(profile.role || "teacher");
          setUserId(profile._id || "");

          // Load teacher groups if teacher
          if (profile.role === "teacher") {
            await loadTeacherGroups();
          }

          await loadChartData(profile.role, profile._id);
        }
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
