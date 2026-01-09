/**
 * Reports Screen
 * Shows monthly averages for students and teachers
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useReportData } from "@/hooks/useReportData";
import { ReportFilters, ReportChart } from "@/components/reports";

export default function ReportsScreen() {
  const {
    loading,
    userRole,
    chartData,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    groups,
    selectedGroupId,
    setSelectedGroupId,
  } = useReportData();

  return (
    <LinearGradient
      colors={["#F8FAFC", "#E2E8F0", "#F1F5F9"]}
      style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 التقارير والإحصائيات</Text>
          <Text style={styles.subtitle}>تتبع أداء الطلاب ومعدلات الحلقات</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ReportFilters
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            userRole={userRole}
            groups={groups}
            selectedGroupId={selectedGroupId}
            onGroupChange={setSelectedGroupId}
          />
        </View>

        {/* Loading indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>جاري تحميل التقارير...</Text>
          </View>
        ) : (
          /* Chart */
          <ReportChart
            labels={chartData.labels}
            data={chartData.data}
            userRole={userRole}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  filtersContainer: {
    paddingHorizontal: 16,
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
});
