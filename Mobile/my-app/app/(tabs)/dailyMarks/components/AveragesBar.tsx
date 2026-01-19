import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Award,
  TrendingUp,
  BookOpen,
  RefreshCw,
  Star,
} from "lucide-react-native";

interface AveragesBarProps {
  reviewAverage: number;
  memorizationAverage: number;
  overallAverage: number;
  totalMarks: number;
}

/**
 * Get performance level based on average
 */
const getPerformanceLevel = (average: number, max: number) => {
  const percentage = (average / max) * 100;
  if (percentage >= 90)
    return { label: "ممتاز", emoji: "🌟", color: "#10b981" };
  if (percentage >= 70)
    return { label: "جيد جداً", emoji: "✨", color: "#3b82f6" };
  if (percentage >= 50) return { label: "جيد", emoji: "👍", color: "#f59e0b" };
  return { label: "يحتاج تحسين", emoji: "💪", color: "#ef4444" };
};

/**
 * Stat Card Component
 */
const StatCard = memo<{
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  gradientColors: [string, string];
}>(({ title, value, description, icon, gradientColors }) => (
  <View style={styles.statCard}>
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statCardGradient}>
      <View style={styles.statIconContainer}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statDescription}>{description}</Text>
    </LinearGradient>
  </View>
));

/**
 * Enhanced Averages bar component with visual indicators
 * Shows 3 metric cards with progress rings and performance badges
 */
const AveragesBarComponent: React.FC<AveragesBarProps> = ({
  reviewAverage,
  memorizationAverage,
  overallAverage,
  totalMarks,
}) => {
  const overallPerformance = getPerformanceLevel(overallAverage, 100);

  return (
    <View style={styles.container}>
      {/* Header with performance badge */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Award size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>📊 معدلات الشهر المحدد</Text>
            <Text style={styles.headerSubtitle}>
              إجمالي العلامات: {totalMarks}
            </Text>
          </View>
        </View>

        {/* Overall Performance Badge */}
        <View
          style={[
            styles.performanceBadge,
            { backgroundColor: overallPerformance.color },
          ]}>
          <TrendingUp size={16} color="#ffffff" />
          <Text style={styles.performanceBadgeText}>
            {overallPerformance.emoji} {overallPerformance.label}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Memorization Average */}
        <StatCard
          title="📖 الحفظ"
          value={`${memorizationAverage.toFixed(1)}/10`}
          description={`من ${totalMarks} علامة`}
          icon={<BookOpen size={20} color="#ffffff" />}
          gradientColors={["#10b981", "#059669"]}
        />

        {/* Review Average */}
        <StatCard
          title="🔄 المراجعة"
          value={`${reviewAverage.toFixed(1)}/10`}
          description={`من ${totalMarks} علامة`}
          icon={<RefreshCw size={20} color="#ffffff" />}
          gradientColors={["#3b82f6", "#0ea5e9"]}
        />

        {/* Overall Average */}
        <StatCard
          title="⭐ الإجمالي"
          value={`${overallAverage.toFixed(0)}/100`}
          description="الحفظ + المراجعة"
          icon={<Star size={20} color="#ffffff" />}
          gradientColors={["#f59e0b", "#d97706"]}
        />
      </View>
    </View>
  );
};

export const AveragesBar = memo(AveragesBarComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 3,
    borderTopColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconContainer: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  performanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  performanceBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  statCardGradient: {
    padding: 14,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.75)",
  },
});
