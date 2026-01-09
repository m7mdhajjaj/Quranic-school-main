/**
 * Report Chart Component
 * Displays bar chart for report data
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { ReportChartProps } from "@/types/report.types";

export const ReportChart: React.FC<ReportChartProps> = ({
  labels,
  data,
  userRole,
  selectedMonth,
  selectedYear,
}) => {
  const isStudent = userRole === "student";
  const title = isStudent ? "📊 معدلاتي الشهرية" : "📈 متوسط معدلات الحلقة";

  const getFilterText = () => {
    if (selectedMonth && selectedYear) {
      return isStudent
        ? `📅 يتم عرض معدلك للشهر ${selectedMonth}/${selectedYear}`
        : `📅 يتم عرض متوسط معدلات جميع الطلاب للشهر ${selectedMonth}/${selectedYear}`;
    }
    return isStudent
      ? "📅 يتم عرض معدلاتك لآخر 6 أشهر"
      : "📅 يتم عرض متوسط معدلات جميع الطلاب لآخر 6 أشهر";
  };

  const maxValue = Math.max(...data, 100);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {labels.length > 0 ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chartContainer}>
              {/* Y-Axis Labels */}
              <View style={styles.yAxis}>
                <Text style={styles.yAxisLabel}>100</Text>
                <Text style={styles.yAxisLabel}>80</Text>
                <Text style={styles.yAxisLabel}>60</Text>
                <Text style={styles.yAxisLabel}>40</Text>
                <Text style={styles.yAxisLabel}>20</Text>
                <Text style={styles.yAxisLabel}>0</Text>
              </View>

              {/* Chart Area */}
              <View style={styles.chartArea}>
                {/* Grid Lines */}
                <View style={styles.gridLines}>
                  {[0, 20, 40, 60, 80, 100].map((value) => (
                    <View key={value} style={styles.gridLine} />
                  ))}
                </View>

                {/* Bars */}
                <View style={styles.barsContainer}>
                  {data.map((value, index) => {
                    const height = (value / maxValue) * 200;
                    return (
                      <View key={index} style={styles.barWrapper}>
                        <View style={styles.barContainer}>
                          <View style={styles.valueBox}>
                            <Text style={styles.barValue}>
                              {value.toFixed(1)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.bar,
                              { height: Math.max(height, 5) },
                            ]}
                          />
                        </View>
                        <Text style={styles.barLabel}>{labels[index]}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>{getFilterText()}</Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>لا توجد بيانات لعرضها</Text>
          <Text style={styles.emptyDescription}>
            {isStudent
              ? "لم يتم تسجيل أي معدلات شهرية بعد"
              : "لم يتم تسجيل أي معدلات شهرية للطلاب بعد"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#1F2937",
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  yAxis: {
    justifyContent: "space-between",
    height: 200,
    marginRight: 8,
    paddingVertical: 5,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  chartArea: {
    position: "relative",
    height: 200,
  },
  gridLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  gridLine: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 200,
    gap: 12,
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: "center",
    gap: 8,
  },
  barContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 190,
  },
  valueBox: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  bar: {
    width: 40,
    backgroundColor: "#10B981",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: "#059669",
  },
  barValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#059669",
  },
  barLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  infoContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
