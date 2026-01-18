// ============================================================================
// Admin Dashboard Screen - لوحة الإحصائيات (للأدمن)
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Users, UserCheck, BookOpen, TrendingUp } from "lucide-react-native";
import {
  fetchDashboardStats,
  type DashboardStats,
  fetchDashboardCharts,
} from "@/Api/dashboardApi";
import { AddStudentModal } from "@/components/students/AddStudentModal";
import { AddTeacherModal } from "@/components/teachers/AddTeacherModal";
import { AddGroupModal } from "@/components/groups/AddGroupModal";
import type { Student } from "@/types/student.types";
import type { Teacher } from "@/Api/teacherApi";
import type { Group } from "@/Api/groupApi";
import { getAllTeachers } from "@/Api/teacherApi";

interface ChartData {
  groupDistribution: { name: string; count: number; percentage: number }[];
  genderDistribution: { label: string; count: number; percentage: number }[];
}

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalGroups: 0,
    totalExams: 0,
    totalActivities: 0,
    totalNews: 0,
    totalAssistants: 0,
    totalSecretaries: 0,
    averageMarks: 0,
    averageExamMarks: 0,
    activeStudents: 0,
    attendanceRate: 0,
    upcomingExams: 0,
    recentMarksCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charts data
  const [chartsData, setChartsData] = useState<ChartData>({
    groupDistribution: [],
    genderDistribution: [],
  });
  const [loadingCharts, setLoadingCharts] = useState(true);

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Load dashboard stats
  const loadStats = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetchDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || "فشل في جلب الإحصائيات");
      }
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadTeachers();
    loadCharts();
  }, []);

  // Load teachers for AddGroupModal
  const loadTeachers = async () => {
    try {
      const response = await getAllTeachers();
      if (response.success && response.data) {
        setTeachers(response.data);
      }
    } catch (err) {
      console.error("Error loading teachers:", err);
    }
  };

  // Load charts data
  const loadCharts = async () => {
    try {
      setLoadingCharts(true);
      const data = await fetchDashboardCharts();
      if (data.success && data.data) {
        setChartsData(data.data);
      }
    } catch (err) {
      console.error("Error loading charts:", err);
    } finally {
      setLoadingCharts(false);
    }
  };

  const onRefresh = () => {
    loadStats(true);
    loadCharts();
  };

  // Modal handlers
  const handleStudentModalSuccess = () => {
    setShowStudentModal(false);
    loadStats(true);
  };

  const handleTeacherModalSuccess = () => {
    setShowTeacherModal(false);
    loadStats(true);
  };

  const handleGroupModalSuccess = () => {
    setShowGroupModal(false);
    loadStats(true);
  };

  // Error state
  if (error && !loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>لوحة الإحصائيات</Text>
        <Text style={styles.headerSubtitle}>نظرة شاملة على أداء المنصة</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        {/* Total Students */}
        <View style={[styles.statCard, styles.statCard1]}>
          <View style={styles.statIconContainer}>
            <Users size={28} color="#ffffff" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>إجمالي الطلاب</Text>
            <Text style={styles.statValue}>{stats.totalStudents}</Text>
          </View>
        </View>

        {/* Total Teachers */}
        <View style={[styles.statCard, styles.statCard2]}>
          <View style={styles.statIconContainer}>
            <UserCheck size={28} color="#ffffff" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>إجمالي المعلمين</Text>
            <Text style={styles.statValue}>{stats.totalTeachers}</Text>
          </View>
        </View>

        {/* Total Groups */}
        <View style={[styles.statCard, styles.statCard3]}>
          <View style={styles.statIconContainer}>
            <BookOpen size={28} color="#ffffff" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>عدد الحلقات</Text>
            <Text style={styles.statValue}>{stats.totalGroups}</Text>
          </View>
        </View>

        {/* Total Assistants */}
        <View style={[styles.statCard, styles.statCard4]}>
          <View style={styles.statIconContainer}>
            <Users size={28} color="#ffffff" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>مساعدي المدرس</Text>
            <Text style={styles.statValue}>{stats.totalAssistants}</Text>
          </View>
        </View>

        {/* Total Secretaries */}
        <View style={[styles.statCard, styles.statCard5]}>
          <View style={styles.statIconContainer}>
            <UserCheck size={28} color="#ffffff" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>السكرتير</Text>
            <Text style={styles.statValue}>{stats.totalSecretaries}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowStudentModal(true)}>
            <View style={styles.quickActionIcon}>
              <Users size={24} color="#10b981" />
            </View>
            <Text style={styles.quickActionText}>إضافة طالب</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowTeacherModal(true)}>
            <View style={styles.quickActionIcon}>
              <UserCheck size={24} color="#10b981" />
            </View>
            <Text style={styles.quickActionText}>إضافة معلم</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowGroupModal(true)}>
            <View style={styles.quickActionIcon}>
              <BookOpen size={24} color="#10b981" />
            </View>
            <Text style={styles.quickActionText}>إضافة حلقة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/admin/assistants')}>
            <View style={styles.quickActionIcon}>
              <Users size={24} color="#10b981" />
            </View>
            <Text style={styles.quickActionText}>إضافة مساعد</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/admin/secretaries')}>
            <View style={styles.quickActionIcon}>
              <UserCheck size={24} color="#10b981" />
            </View>
            <Text style={styles.quickActionText}>إضافة سكرتير</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Additional Stats */}
      {stats.activeStudents > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إحصائيات إضافية</Text>
          <View style={styles.additionalStatsContainer}>
            <View style={styles.additionalStatCard}>
              <View style={styles.additionalStatIcon}>
                <TrendingUp size={20} color="#10b981" />
              </View>
              <View style={styles.additionalStatContent}>
                <Text style={styles.additionalStatLabel}>الطلاب النشطون</Text>
                <Text style={styles.additionalStatValue}>
                  {stats.activeStudents}
                </Text>
              </View>
            </View>

            {stats.attendanceRate > 0 && (
              <View style={styles.additionalStatCard}>
                <View style={styles.additionalStatIcon}>
                  <UserCheck size={20} color="#10b981" />
                </View>
                <View style={styles.additionalStatContent}>
                  <Text style={styles.additionalStatLabel}>نسبة الحضور</Text>
                  <Text style={styles.additionalStatValue}>
                    {Math.round(stats.attendanceRate)}%
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Charts Section */}
      {loadingCharts ? (
        <View style={styles.chartsContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <>
          {/* Group Distribution */}
          {chartsData.groupDistribution.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>📊 توزيع الطلاب حسب الحلقات</Text>
              <View style={styles.chartCard}>
                {chartsData.groupDistribution.map((item, index) => {
                  const total = chartsData.groupDistribution.reduce(
                    (sum, g) => sum + g.count,
                    0
                  );
                  const percentage =
                    total > 0 ? Math.round((item.count / total) * 100) : 0;

                  return (
                    <View key={index} style={styles.distributionItem}>
                      <View style={styles.distributionHeader}>
                        <Text style={styles.distributionLabel}>
                          {item.name}
                        </Text>
                        <Text style={styles.distributionValue}>
                          {item.count} طالب ({percentage}%)
                        </Text>
                      </View>
                      <View style={styles.distributionBarContainer}>
                        <View
                          style={[
                            styles.distributionBar,
                            {
                              width: `${percentage}%`,
                              backgroundColor: [
                                "#10b981",
                                "#059669",
                                "#047857",
                                "#065f46",
                                "#064e3b",
                              ][index % 5],
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Gender Distribution */}
          {chartsData.genderDistribution.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>👥 توزيع الطلاب حسب الجنس</Text>
              <View style={styles.chartCard}>
                {chartsData.genderDistribution.map((item, index) => {
                  const total = chartsData.genderDistribution.reduce(
                    (sum, g) => sum + g.count,
                    0
                  );
                  const percentage =
                    total > 0 ? Math.round((item.count / total) * 100) : 0;
                  const genderName = item.label === "male" ? "ذكور" : "إناث";
                  const color = item.label === "male" ? "#3b82f6" : "#ec4899";

                  return (
                    <View key={index} style={styles.distributionItem}>
                      <View style={styles.distributionHeader}>
                        <Text style={styles.distributionLabel}>
                          {genderName}
                        </Text>
                        <Text style={styles.distributionValue}>
                          {item.count} طالب ({percentage}%)
                        </Text>
                      </View>
                      <View style={styles.distributionBarContainer}>
                        <View
                          style={[
                            styles.distributionBar,
                            { width: `${percentage}%`, backgroundColor: color },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </>
      )}

      {/* Coming Soon Section */}
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoonTitle}>قريباً</Text>
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonText}>🏆 أفضل الطلاب والمعلمين</Text>
        </View>
      </View>

      {/* Modals */}
      <AddStudentModal
        visible={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onSuccess={handleStudentModalSuccess}
      />

      <AddTeacherModal
        visible={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
        onSuccess={handleTeacherModalSuccess}
      />

      <AddGroupModal
        visible={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onSuccess={handleGroupModalSuccess}
        teachers={teachers}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  errorContainer: {
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#f87171",
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#b91c1c",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Header
  header: {
    padding: 20,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },

  // Stats Grid
  statsGrid: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCard1: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  statCard2: {
    borderLeftWidth: 4,
    borderLeftColor: "#059669",
  },
  statCard3: {
    borderLeftWidth: 4,
    borderLeftColor: "#047857",
  },
  statCard4: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  statCard5: {
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionButton: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },

  // Additional Stats
  additionalStatsContainer: {
    gap: 12,
  },
  additionalStatCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  additionalStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  additionalStatContent: {
    flex: 1,
  },
  additionalStatLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  additionalStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },

  // Charts
  chartsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center",
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  distributionItem: {
    marginBottom: 16,
  },
  distributionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  distributionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  distributionValue: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  distributionBarContainer: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  distributionBar: {
    height: "100%",
    borderRadius: 4,
  },

  // Coming Soon
  comingSoonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  comingSoonCard: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  comingSoonText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
  },
});
