import { useState, useCallback, useEffect, useMemo } from "react";
import {
  fetchAllDashboardData,
  fetchDashboardCharts,
  fetchTopStudents,
  fetchTopTeachers,
  type TopStudent,
  type TopTeacher,
} from "@/Api/dashboardApi";
import type {
  DashboardStats,
  ChartsData,
  ProcessedChartData,
} from "../types";
import { DEFAULT_GROUP_COLORS } from "../Types/constants";

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalAssistants: 0,
    totalSecretaries: 0,
    totalGroups: 0,
    totalExams: 0,
    averageExamMarks: 0,
    activeStudents: 0,
    attendanceRate: 0,
  });

  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const [topStudentsData, setTopStudentsData] = useState<TopStudent[]>([]);
  const [topTeachersData, setTopTeachersData] = useState<TopTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [isLoadingTopStudents, setIsLoadingTopStudents] = useState(true);
  const [isLoadingTopTeachers, setIsLoadingTopTeachers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (force?: boolean) => {
    try {
      if (force) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
        setIsLoadingStats(true);
        setIsLoadingCharts(true);
        setIsLoadingTopStudents(true);
        setIsLoadingTopTeachers(true);
      }
      setError(null);

      console.log("🔄 جلب بيانات Dashboard...");

      // جلب البيانات بشكل متوازي مع تحديث loading states منفصلة
      // استخدام Promise.allSettled للسماح بتحميل البيانات بشكل مستقل
      const [statsResponse, chartsResponse, topStudentsResponse, topTeachersResponse] = await Promise.allSettled([
        fetchAllDashboardData(),
        fetchDashboardCharts(),
        fetchTopStudents(),
        fetchTopTeachers(),
      ]);

      // تحديث الإحصائيات - تحديث loading state فوراً عند اكتمال الطلب
      if (statsResponse.status === "fulfilled") {
        setIsLoadingStats(false);
        setStats({
          totalStudents: statsResponse.value.stats.totalStudents || 0,
          totalTeachers: statsResponse.value.stats.totalTeachers || 0,
          totalAssistants: statsResponse.value.stats.totalAssistants || 0,
          totalSecretaries: statsResponse.value.stats.totalSecretaries || 0,
          totalGroups: statsResponse.value.stats.totalGroups || 0,
          totalExams: statsResponse.value.stats.totalExams || 0,
          averageExamMarks: statsResponse.value.stats.averageExamMarks || 0,
          activeStudents: statsResponse.value.stats.activeStudents || 0,
          attendanceRate: statsResponse.value.stats.attendanceRate || 0,
        });
      } else {
        setIsLoadingStats(false);
        console.error("❌ خطأ في جلب الإحصائيات:", statsResponse.reason);
      }

      // تحديث بيانات الرسوم البيانية - تحديث loading state فوراً عند اكتمال الطلب
      if (chartsResponse.status === "fulfilled") {
        setIsLoadingCharts(false);
        setChartsData(chartsResponse.value);
      } else {
        setIsLoadingCharts(false);
        console.error("❌ خطأ في جلب الرسوم البيانية:", chartsResponse.reason);
      }

      // تحديث بيانات أفضل الطلاب - تحديث loading state فوراً عند اكتمال الطلب
      if (topStudentsResponse.status === "fulfilled") {
        setIsLoadingTopStudents(false);
        setTopStudentsData(topStudentsResponse.value.data || []);
      } else {
        setIsLoadingTopStudents(false);
        console.error("❌ خطأ في جلب أفضل الطلاب:", topStudentsResponse.reason);
        // في حالة الفشل، لا نعرض skeleton - نترك البيانات فارغة
        setTopStudentsData([]);
      }

      // تحديث بيانات أفضل المعلمين - تحديث loading state فوراً عند اكتمال الطلب
      if (topTeachersResponse.status === "fulfilled") {
        setIsLoadingTopTeachers(false);
        setTopTeachersData(topTeachersResponse.value.data || []);
      } else {
        setIsLoadingTopTeachers(false);
        console.error("❌ خطأ في جلب أفضل المعلمين:", topTeachersResponse.reason);
        // في حالة الفشل، لا نعرض skeleton - نترك البيانات فارغة
        setTopTeachersData([]);
      }

      // إذا فشل كلا الطلبين، نعرض خطأ
      if (statsResponse.status === "rejected" && chartsResponse.status === "rejected") {
        throw statsResponse.reason || chartsResponse.reason;
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "فشل في جلب البيانات";
      console.error("❌ خطأ في جلب البيانات:", errorMessage);
      setError(errorMessage);
      setIsLoadingStats(false);
      setIsLoadingCharts(false);
      setIsLoadingTopStudents(false);
      setIsLoadingTopTeachers(false);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // جلب البيانات عند التحميل الأول
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // معالجة بيانات توزيع الحلقات
  const groupDistribution: ProcessedChartData = useMemo(() => {
    if (!chartsData?.groupDistribution || chartsData.groupDistribution.length === 0) {
      return { labels: [], data: [], colors: [] };
    }

    return {
      labels: chartsData.groupDistribution.map((g) => g._id || "غير محدد"),
      data: chartsData.groupDistribution.map((g) => g.count),
      colors: chartsData.groupDistribution.map((g, index) =>
        DEFAULT_GROUP_COLORS[index % DEFAULT_GROUP_COLORS.length]
      ),
    };
  }, [chartsData?.groupDistribution]);

  // معالجة بيانات توزيع الجنس
  const genderDistribution: ProcessedChartData = useMemo(() => {
    if (!chartsData?.genderDistribution || chartsData.genderDistribution.length === 0) {
      return {
        labels: ["ذكور", "إناث"],
        data: [0, 0],
        colors: ["from-green-500 to-green-600", "from-rose-400 to-pink-500"],
      };
    }

    // ترتيب ثابت: ذكور أولاً، إناث ثانياً
    const orderedData = [
      chartsData.genderDistribution.find((g) => g._id === "ذكور") || { _id: "ذكور", count: 0 },
      chartsData.genderDistribution.find((g) => g._id === "إناث") || { _id: "إناث", count: 0 },
    ];

    return {
      labels: orderedData.map((g) => g._id || "غير محدد"),
      data: orderedData.map((g) => g.count),
      colors: orderedData.map((g) =>
        g._id === "ذكور"
          ? "from-green-500 to-green-600" // ذكور - أخضر
          : "from-rose-400 to-pink-500" // إناث - وردي
      ),
    };
  }, [chartsData?.genderDistribution]);

  // معالجة بيانات أفضل الطلاب من endpoint الجديد
  const topStudents = useMemo(() => {
    // إذا كان التحميل جارياً، نرجع array فارغ (لإظهار skeleton)
    // إذا انتهى التحميل وكانت البيانات فارغة، نرجع رسالة "لا يوجد بيانات"
    if (isLoadingTopStudents) {
      return [];
    }
    if (!topStudentsData || topStudentsData.length === 0) {
      return [{ name: "لا يوجد بيانات", value: 0 }];
    }
    // تحويل البيانات من TopStudent إلى TopStudent format للـ component
    // تحديد أفضل 5 طلاب فقط
    return topStudentsData.slice(0, 5).map((student) => ({
      name: student.name,
      value: student.totalMarks,
      avgMark: student.averageMark,
      group: student.group,
      userId: student._id,
      userRole: "student",
      user: {
        _id: student._id,
        firstName: student.name?.split(' ')[0] || student.name,
        name: student.name,
        role: "student",
        // إضافة avatar إذا كان موجوداً في البيانات
        avatar: student.avatar,
      },
      // بيانات إضافية للعرض
      memorizationMarks: student.memorizationMarks,
      reviewMarks: student.reviewMarks,
      examMarks: student.examMarks,
    }));
  }, [topStudentsData, isLoadingTopStudents]);

  // معالجة بيانات أفضل المعلمين من endpoint الجديد
  const topTeachers = useMemo(() => {
    // إذا كان التحميل جارياً، نرجع array فارغ (لإظهار skeleton)
    // إذا انتهى التحميل وكانت البيانات فارغة، نرجع رسالة "لا يوجد بيانات"
    if (isLoadingTopTeachers) {
      return [];
    }
    if (!topTeachersData || topTeachersData.length === 0) {
      return [{ name: "لا يوجد بيانات", value: 0 }];
    }
    // تحويل البيانات من TopTeacher إلى TopTeacher format للـ component
    // تحديد أفضل 5 معلمين فقط
    return topTeachersData.slice(0, 5).map((teacher) => ({
      name: teacher.name,
      value: teacher.totalMarks,
      studentCount: teacher.studentCount,
      groups: teacher.groups,
      userId: teacher._id,
      userRole: "teacher",
      user: {
        _id: teacher._id,
        firstName: teacher.name?.split(' ')[0] || teacher.name,
        name: teacher.name,
        role: "teacher",
        // إضافة avatar إذا كان موجوداً في البيانات
        avatar: teacher.avatar,
      },
      // بيانات إضافية للعرض
      memorizationMarks: teacher.memorizationMarks,
      reviewMarks: teacher.reviewMarks,
      examMarks: teacher.examMarks,
      averageMark: teacher.averageMark,
    }));
  }, [topTeachersData, isLoadingTopTeachers]);

  return {
    stats,
    isLoading,
    isLoadingStats,
    isLoadingCharts,
    isLoadingTopStudents,
    isLoadingTopTeachers,
    error,
    refreshing,
    fetchStats,
    chartsData,
    // البيانات المعالجة جاهزة للاستخدام
    groupDistribution,
    genderDistribution,
    topStudents,
    topTeachers,
  };
};
