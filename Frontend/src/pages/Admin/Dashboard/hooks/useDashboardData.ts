import { useState, useCallback } from "react";
import type { DashboardStats, GroupDistribution } from "../types";

export const useDashboardData = () => {
  const [stats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalGroups: 0,
    totalExams: 0,
    averageExamMarks: 0,
    activeStudents: 0,
    attendanceRate: 0,
  });

  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [refreshing] = useState(false);

  const fetchStats = useCallback((_force?: boolean) => {
    // TODO: Implement API call
    // dashboardAPI.getStats()
  }, []);

  const groupsDistribution: GroupDistribution[] = [];

  return {
    stats,
    isLoading,
    error,
    refreshing,
    fetchStats,
    groupsDistribution,
  };
};
