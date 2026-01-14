/**
 * واجهة الطالب للحضور والغياب
 * يعرض إحصائيات الغياب الأسبوعية والشهرية
 */
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Calendar, CheckCircle, AlertCircle } from "lucide-react-native";
import { MONTH_NAMES } from "@/utils/constants/arabicMonths";
import {
  TotalAbsenceCard,
  WeeklyStatsCard,
  AbsenceRateCard,
} from "../components/StudentStatsCards";
import type {
  MonthlyAbsence,
  WeeklyStats,
  CurrentMonthStats,
} from "../hooks/useAttendanceData";

// ============================================================================
// Types
// ============================================================================

interface StudentViewProps {
  monthlyStats: MonthlyAbsence[];
  weeklyStats: WeeklyStats | null;
  currentMonthStats: CurrentMonthStats | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

type ViewMode = "weekly" | "monthly";

// ============================================================================
// Component
// ============================================================================

export const StudentView: React.FC<StudentViewProps> = ({
  monthlyStats,
  weeklyStats,
  currentMonthStats,
  onRefresh,
  isRefreshing = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // السنوات المتاحة
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }, []);

  // فلترة الإحصائيات الشهرية
  const filteredMonthlyStats = useMemo(() => {
    return monthlyStats.filter((stat) => {
      const lastSpace = stat.month.lastIndexOf(" ");
      if (lastSpace < 0) return false;
      const label = stat.month.substring(0, lastSpace);
      const yy = parseInt(stat.month.substring(lastSpace + 1), 10);
      const mmIndex = MONTH_NAMES.findIndex((x) => x === label);
      return yy === selectedYear && mmIndex === selectedMonthIndex;
    });
  }, [monthlyStats, selectedYear, selectedMonthIndex]);

  // إحصائيات العرض الحالي
  const currentViewStats = useMemo(() => {
    if (viewMode === "weekly") {
      if (!weeklyStats) {
        return { totalDays: 0, absenceCount: 0, rate: 0, absenceDates: [] };
      }
      return {
        totalDays: weeklyStats.totalDays,
        absenceCount: weeklyStats.absenceCount,
        rate: weeklyStats.rate,
        absenceDates: weeklyStats.absenceDates || [],
      };
    } else {
      // الوضع الشهري
      const now = new Date();
      const isCurrentMonth =
        selectedYear === now.getFullYear() &&
        selectedMonthIndex === now.getMonth();

      if (isCurrentMonth && currentMonthStats) {
        return {
          totalDays: currentMonthStats.totalDays,
          absenceCount: currentMonthStats.absenceCount,
          rate: currentMonthStats.rate,
          absenceDates: currentMonthStats.absenceDates || [],
        };
      }

      if (filteredMonthlyStats.length === 0) {
        return { totalDays: 0, absenceCount: 0, rate: 0, absenceDates: [] };
      }

      const monthData = filteredMonthlyStats[0];
      return {
        totalDays: monthData.totalDays,
        absenceCount: monthData.absenceCount,
        rate: monthData.rate,
        absenceDates: monthData.absenceDates || [],
      };
    }
  }, [
    viewMode,
    weeklyStats,
    currentMonthStats,
    filteredMonthlyStats,
    selectedYear,
    selectedMonthIndex,
  ]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={["#10b981"]}
          tintColor="#10b981"
        />
      }>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconContainer}>
              <Calendar size={28} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>سجل الحضور والغياب</Text>
              <Text style={styles.headerSubtitle}>
                تابع إحصائياتك الأسبوعية أو الشهرية
              </Text>
            </View>
          </View>

          {/* View Mode Toggle */}
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              onPress={() => setViewMode("weekly")}
              style={[
                styles.toggleButton,
                viewMode === "weekly" && styles.toggleButtonActive,
              ]}>
              <Text
                style={[
                  styles.toggleButtonText,
                  viewMode === "weekly" && styles.toggleButtonTextActive,
                ]}>
                الأسبوع الحالي
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode("monthly")}
              style={[
                styles.toggleButton,
                viewMode === "monthly" && styles.toggleButtonActive,
              ]}>
              <Text
                style={[
                  styles.toggleButtonText,
                  viewMode === "monthly" && styles.toggleButtonTextActive,
                ]}>
                التقرير الشهري
              </Text>
            </TouchableOpacity>
          </View>

          {/* Month/Year Picker (Monthly Mode Only) */}
          {viewMode === "monthly" && (
            <View style={styles.dateFilters}>
              <View style={styles.filterLabel}>
                <Calendar size={14} color="#ffffff" />
                <Text style={styles.filterLabelText}>تصفية حسب التاريخ</Text>
              </View>
              <View style={styles.pickerRow}>
                <View style={styles.pickerWrapper}>
                  <TouchableOpacity style={styles.picker}>
                    <Text style={styles.pickerText}>
                      {MONTH_NAMES[selectedMonthIndex]}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerWrapper}>
                  <TouchableOpacity style={styles.picker}>
                    <Text style={styles.pickerText}>{selectedYear}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Decorative Elements */}
        <View style={styles.headerDecoration1} />
        <View style={styles.headerDecoration2} />
      </View>

      {/* Section Title */}
      <View style={styles.sectionTitleContainer}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>
          {viewMode === "weekly"
            ? "ملخص الأسبوع الحالي"
            : `إحصائيات شهر ${MONTH_NAMES[selectedMonthIndex]} ${selectedYear}`}
        </Text>
        <View style={[styles.sectionLine, styles.sectionLineRight]} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <TotalAbsenceCard
          count={currentViewStats.absenceCount}
          label={
            viewMode === "weekly"
              ? "غيابات هذا الأسبوع"
              : `غيابات عام ${selectedYear}`
          }
        />
        <WeeklyStatsCard
          totalDays={currentViewStats.totalDays}
          absenceCount={currentViewStats.absenceCount}
          label={viewMode === "weekly" ? "مقاطع هذا الأسبوع" : "إجمالي المقاطع"}
        />
        <AbsenceRateCard
          rate={currentViewStats.rate}
          absenceCount={currentViewStats.absenceCount}
          totalDays={currentViewStats.totalDays}
        />
      </View>

      {/* Absence Dates Section */}
      <View style={styles.datesSection}>
        <View style={styles.datesSectionHeader}>
          <View style={styles.datesSectionIconContainer}>
            <Calendar size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.datesSectionTitle}>
              {viewMode === "weekly"
                ? "تفاصيل غياب الأسبوع"
                : "سجل الحضور الشهري"}
            </Text>
            <Text style={styles.datesSectionSubtitle}>
              {viewMode === "weekly"
                ? "الأيام التي تغيبت فيها خلال هذا الأسبوع"
                : "تفاصيل حضورك وغيابك للشهر المحدد"}
            </Text>
          </View>
        </View>

        <View style={styles.datesSectionContent}>
          {currentViewStats.absenceDates.length > 0 ? (
            <>
              <View style={styles.absenceWarning}>
                <AlertCircle size={16} color="#dc2626" />
                <Text style={styles.absenceWarningText}>
                  فيما يلي تواريخ الغياب المسجلة:
                </Text>
              </View>
              <View style={styles.datesGrid}>
                {currentViewStats.absenceDates.map((date, index) => (
                  <View key={index} style={styles.dateCard}>
                    <View style={styles.dateCardIcon}>
                      <Calendar size={16} color="#dc2626" />
                    </View>
                    <View style={styles.dateCardContent}>
                      <Text style={styles.dateCardDay}>
                        {new Date(date).toLocaleDateString("ar-EG", {
                          weekday: "long",
                        })}
                      </Text>
                      <Text style={styles.dateCardFull}>
                        {new Date(date).toLocaleDateString("ar-EG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyDatesContainer}>
              <View style={styles.emptyDatesIcon}>
                <CheckCircle size={32} color="#10b981" />
              </View>
              <Text style={styles.emptyDatesTitle}>
                {viewMode === "weekly"
                  ? "حضورك مكتمل هذا الأسبوع!"
                  : "لا توجد غيابات هذا الشهر!"}
              </Text>
              <Text style={styles.emptyDatesSubtitle}>
                بداية موفقة، استمر في الالتزام 💪
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Important Note */}
      <View style={styles.noteSection}>
        <View style={styles.noteContent}>
          <View style={styles.noteIcon}>
            <AlertCircle size={20} color="#ffffff" />
          </View>
          <View style={styles.noteTextContent}>
            <Text style={styles.noteTitle}>ملاحظة مهمة</Text>
            <Text style={styles.noteText}>
              الحد المسموح للغياب هو <Text style={styles.noteBold}>10%</Text> من
              أيام الدراسة. تجاوز هذه النسبة قد يؤثر على{" "}
              <Text style={styles.noteBold}>التقييم النهائي</Text> والحصول على
              الشهادة.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#10b981",
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  headerContent: {
    position: "relative",
    zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  headerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  viewModeToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#ffffff",
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.9)",
  },
  toggleButtonTextActive: {
    color: "#10b981",
  },
  dateFilters: {
    marginTop: 16,
  },
  filterLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  filterLabelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  pickerRow: {
    flexDirection: "row",
    gap: 12,
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  headerDecoration1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerDecoration2: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  sectionLine: {
    height: 3,
    width: 40,
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
  sectionLineRight: {
    flex: 1,
    backgroundColor: "#14b8a6",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  datesSection: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  datesSectionHeader: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  datesSectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  datesSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  datesSectionSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  datesSectionContent: {
    padding: 20,
  },
  absenceWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 16,
  },
  absenceWarningText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#dc2626",
    flex: 1,
    textAlign: "right",
  },
  datesGrid: {
    gap: 10,
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 14,
    padding: 14,
  },
  dateCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  dateCardContent: {
    flex: 1,
  },
  dateCardDay: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
  },
  dateCardFull: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "right",
  },
  emptyDatesContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyDatesIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyDatesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  emptyDatesSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  noteSection: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#f0fdfa",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#99f6e4",
    padding: 16,
  },
  noteContent: {
    flexDirection: "row",
    gap: 14,
  },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#14b8a6",
    justifyContent: "center",
    alignItems: "center",
  },
  noteTextContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f766e",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: "#115e59",
    lineHeight: 20,
    textAlign: "right",
  },
  noteBold: {
    fontWeight: "bold",
    color: "#0f766e",
  },
  bottomSpacer: {
    height: 40,
  },
});
