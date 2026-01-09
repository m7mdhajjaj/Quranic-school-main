/**
 * Ranking Screen
 * Shows student ranking based on monthly averages
 */

import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRankingData } from "@/hooks/useRankingData";
import {
  generateAvailableYears,
  getCurrentPeriod,
  getMonthName,
} from "@/utils/rankingHelpers";
import type { User } from "@/types/ranking.types";
import { FilterPanel } from "@/components/ranking/FilterPanel";
import { Podium } from "@/components/ranking/Podium";
import { RankingList } from "@/components/ranking/RankingList";

export default function RankingScreen() {
  // Get user from AsyncStorage
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  // Get current period
  const currentPeriod = getCurrentPeriod();

  // State management
  const [selectedMonth, setSelectedMonth] = useState(currentPeriod.month);
  const [selectedYear, setSelectedYear] = useState(currentPeriod.year);
  const [availableYears] = useState(generateAvailableYears());
  const [selectedGroup, setSelectedGroup] = useState("");

  // Update selectedGroup when user loads
  useEffect(() => {
    if (user) {
      if (user.role === "student") {
        setSelectedGroup(user.group || "");
      } else if (user.role === "teacher" && user.groups?.[0]) {
        setSelectedGroup(user.groups[0].name);
      }
    }
  }, [user]);

  // Fetch ranking data
  const { students, teacherGroups, loading, error } = useRankingData(
    selectedMonth,
    selectedYear,
    selectedGroup,
    user
  );

  // Update selectedGroup when teacherGroups are loaded
  useEffect(() => {
    if (user?.role === "teacher" && teacherGroups && teacherGroups.length > 0) {
      if (!selectedGroup || !teacherGroups.includes(selectedGroup)) {
        setSelectedGroup(teacherGroups[0]);
      }
    }
  }, [teacherGroups, selectedGroup, user]);

  // Get top three students who have marks
  const studentsWithMarks = students.filter(
    (student) => student.totalMarks > 0
  );
  const topThreeStudents = studentsWithMarks.slice(0, 3);
  const showPodium = topThreeStudents.length >= 3;

  return (
    <LinearGradient
      colors={["#F8FAFC", "#E2E8F0", "#F1F5F9"]}
      style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏆 الترتيب الشهري</Text>
          <Text style={styles.subtitle}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
          {studentsWithMarks.length > 0 && (
            <Text style={styles.count}>
              عدد الطلاب: {studentsWithMarks.length}
            </Text>
          )}
        </View>

        {/* Filter Panel */}
        <FilterPanel
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedGroup={selectedGroup}
          availableYears={availableYears}
          user={user}
          teacherGroups={teacherGroups}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onGroupChange={setSelectedGroup}
        />

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>جاري تحميل الترتيب...</Text>
          </View>
        )}

        {/* Error message */}
        {!loading && error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Main content when data is loaded */}
        {!loading && !error && (
          <>
            {/* Empty state */}
            {students.length === 0 || studentsWithMarks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>لا توجد بيانات</Text>
                <Text style={styles.emptyDescription}>
                  لا توجد علامات مسجلة لـ {getMonthName(selectedMonth)}{" "}
                  {selectedYear}
                </Text>
              </View>
            ) : (
              <>
                {/* Info message when less than 3 students */}
                {!showPodium &&
                  studentsWithMarks.length > 0 &&
                  studentsWithMarks.length < 3 && (
                    <View style={styles.infoContainer}>
                      <Text style={styles.infoText}>
                        يوجد {studentsWithMarks.length} طالب فقط بعلامات في هذا
                        الشهر. يتطلب عرض المنصة 3 طلاب على الأقل.
                      </Text>
                    </View>
                  )}

                {/* Olympic-style podium for top 3 */}
                {showPodium && <Podium topThreeStudents={topThreeStudents} />}

                {/* All students list */}
                <RankingList students={studentsWithMarks} />
              </>
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 8,
  },
  count: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  infoContainer: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 16,
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  infoText: {
    color: "#1E40AF",
    fontSize: 14,
    textAlign: "center",
  },
});
