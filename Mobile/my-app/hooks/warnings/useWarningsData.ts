import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/Context/AuthContext";
import { getStudentWarnings, getTeacherStatistics } from "@/Api/warningApi";
import { Warning, TeacherStatistics } from "@/types/warning.types";
import { Alert } from "react-native";
import api from "@/Api/api";

interface Group {
  _id: string;
  name: string;
  teacher?: string;
  currentStudents?: number;
}

export const useWarningsData = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [statistics, setStatistics] = useState<TeacherStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  const fetchTeacherGroups = useCallback(async () => {
    if (!user?._id || !isTeacher) return;

    try {
      setLoading(true);
      const response = await api.get(`/groups/teacher/${user._id}`);
      const groupsData = response.data.data || response.data || [];
      setGroups(groupsData);
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل تحميل الحلقات");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, isTeacher]);

  const fetchStudentWarnings = useCallback(async () => {
    if (!user?._id || !isStudent) return;

    try {
      setLoading(true);
      const data = await getStudentWarnings(user._id);
      setWarnings(data);
    } catch (error: any) {
      Alert.alert(
        "خطأ",
        error?.response?.data?.message || "فشل تحميل الإنذارات"
      );
      setWarnings([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, isStudent]);

  const fetchTeacherStats = useCallback(async () => {
    if (!isTeacher) return;

    try {
      const data = await getTeacherStatistics();
      setStatistics(data);
    } catch (error: any) {
      console.log("Error fetching statistics:", error);
    }
  }, [isTeacher]);

  useEffect(() => {
    if (isTeacher) {
      fetchTeacherGroups();
      fetchTeacherStats();
    } else if (isStudent) {
      fetchStudentWarnings();
    }
  }, [
    isTeacher,
    isStudent,
    fetchTeacherGroups,
    fetchStudentWarnings,
    fetchTeacherStats,
  ]);

  return {
    user,
    groups,
    warnings,
    statistics,
    loading,
    isTeacher,
    isStudent,
    refetchData: isTeacher ? fetchTeacherGroups : fetchStudentWarnings,
    fetchTeacherStats,
  };
};
