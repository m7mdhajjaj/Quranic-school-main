import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Award, TrendingUp } from "lucide-react-native";

interface AveragesBarProps {
  reviewAverage: number;
  memorizationAverage: number;
  overallAverage: number;
  totalMarks: number;
}

const getPerformanceLevel = (average: number) => {
  if (average >= 9) return { label: "ممتاز", emoji: "🌟", color: "#10b981" };
  if (average >= 7) return { label: "جيد جداً", emoji: "⭐", color: "#3b82f6" };
  if (average >= 5) return { label: "جيد", emoji: "👍", color: "#f59e0b" };
  return { label: "يحتاج تحسين", emoji: "💪", color: "#ef4444" };
};

export const AveragesBar: React.FC<AveragesBarProps> = ({
  reviewAverage,
  memorizationAverage,
  overallAverage,
  totalMarks,
}) => {
  const performance = getPerformanceLevel(overallAverage);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Award size={28} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>📊 معدلات الشهر المحدد</Text>
            <Text style={styles.headerSubtitle}>
              إجمالي العلامات: {totalMarks}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.performanceBadge,
            { backgroundColor: performance.color },
          ]}>
          <TrendingUp size={20} color="#ffffff" />
          <Text style={styles.performanceText}>
            {performance.emoji} الأداء: {performance.label}
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {/* Memorization Average */}
        <View style={[styles.statCard, styles.memorizationCard]}>
          <Text style={styles.statIcon}>📖</Text>
          <Text style={styles.statTitle}>معدل الحفظ</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.statValue}>
              {memorizationAverage.toFixed(1)}
            </Text>
            <Text style={styles.statMax}>/10</Text>
          </View>
          <Text style={styles.statDescription}>من {totalMarks} علامة</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressBar,
                  styles.memorizationProgress,
                  { width: `${(memorizationAverage / 10) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((memorizationAverage / 10) * 100)}%
            </Text>
          </View>
        </View>

        {/* Review Average */}
        <View style={[styles.statCard, styles.reviewCard]}>
          <Text style={styles.statIcon}>🔄</Text>
          <Text style={styles.statTitle}>معدل المراجعة</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.statValue}>{reviewAverage.toFixed(1)}</Text>
            <Text style={styles.statMax}>/10</Text>
          </View>
          <Text style={styles.statDescription}>من {totalMarks} علامة</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressBar,
                  styles.reviewProgress,
                  { width: `${(reviewAverage / 10) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((reviewAverage / 10) * 100)}%
            </Text>
          </View>
        </View>

        {/* Overall Average */}
        <View style={[styles.statCard, styles.overallCard]}>
          <Text style={styles.statIcon}>📈</Text>
          <Text style={styles.statTitle}>المعدل الكلي</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.statValue}>{Math.round(overallAverage)}</Text>
            <Text style={styles.statMax}>/100</Text>
          </View>
          <Text style={styles.statDescription}>من {totalMarks} علامة</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressBar,
                  styles.overallProgress,
                  { width: `${overallAverage * 10}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(overallAverage * 10)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    borderTopWidth: 2,
    borderTopColor: "#10b981",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "right",
  },
  performanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  performanceText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 160,
  },
  memorizationCard: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  reviewCard: {
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  overallCard: {
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    textAlign: "center",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  statMax: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  statDescription: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  progressContainer: {
    alignItems: "center",
    gap: 8,
  },
  progressBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  memorizationProgress: {
    backgroundColor: "#f59e0b",
  },
  reviewProgress: {
    backgroundColor: "#3b82f6",
  },
  overallProgress: {
    backgroundColor: "#10b981",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
});
