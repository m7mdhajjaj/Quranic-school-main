import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import {
  getFilteredSections,
  getFilteredMarks,
  getStudentAverages,
} from "@/Api/dailyMarksApi";
import type { Section, Mark } from "@/Api/dailyMarksApi";
import { StudentHeader } from "@/app/(tabs)/dailyMarks/components/StudentHeader";
import { AveragesBar } from "@/app/(tabs)/dailyMarks/components/AveragesBar";
import { SectionsTable } from "@/app/(tabs)/dailyMarks/components/SectionsTable";
import { MonthYearFilter } from "@/app/(tabs)/dailyMarks/components/MonthYearFilter";

interface Averages {
  reviewAverage: number;
  memorizationAverage: number;
  overallAverage: number;
  totalMarks: number;
}

export const StudentView = () => {
  const { user: currentUser } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [averages, setAverages] = useState<Averages>({
    reviewAverage: 0,
    memorizationAverage: 0,
    overallAverage: 0,
    totalMarks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear()
  );

  const loadData = async () => {
    if (!currentUser?._id) return;

    try {
      setLoading(true);

      // Fetch sections for student
      const sectionsResponse = await getFilteredSections({
        month: selectedMonth,
        year: selectedYear,
        search: "",
        group: "",
      });

      if (sectionsResponse.success && sectionsResponse.data) {
        setSections(sectionsResponse.data);
      }

      // Fetch marks for student
      const marksResponse = await getFilteredMarks({
        studentId: currentUser._id,
        month: selectedMonth,
        year: selectedYear,
        search: "",
        group: "",
      });

      if (marksResponse.success && marksResponse.data) {
        setMarks(marksResponse.data);
      }

      // Fetch averages
      const averagesResponse = await getStudentAverages(currentUser._id, {
        month: selectedMonth,
        year: selectedYear,
      });

      if (averagesResponse.success && averagesResponse.data) {
        setAverages(averagesResponse.data);
      }
    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?._id, selectedMonth, selectedYear]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل العلامات...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#10b981"]}
          tintColor="#10b981"
        />
      }>
      <StudentHeader sectionsCount={sections.length} />

      {/* Month/Year Filter */}
      <View style={styles.filterContainer}>
        <MonthYearFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </View>

      {/* Averages Section */}
      {sections.length > 0 && (
        <View style={styles.averagesContainer}>
          <AveragesBar
            reviewAverage={averages.reviewAverage}
            memorizationAverage={averages.memorizationAverage}
            overallAverage={averages.overallAverage}
            totalMarks={averages.totalMarks}
          />
        </View>
      )}

      {/* Sections Table */}
      <View style={styles.tableContainer}>
        <SectionsTable sections={sections} marks={marks} isTeacher={false} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  filterContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  averagesContainer: {
    padding: 16,
  },
  tableContainer: {
    padding: 16,
  },
});
