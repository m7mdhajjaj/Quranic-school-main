import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  BookOpen,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Circle,
  Sparkles,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { GroupedSurah } from "@/Api/studentGroupedSectionsApi";

interface SurahCardProps {
  surah: GroupedSurah;
  onPress: () => void;
  isActiveMemorization?: boolean;
  isActiveReview?: boolean;
}

export const SurahCard: React.FC<SurahCardProps> = ({
  surah,
  onPress,
  isActiveMemorization,
  isActiveReview,
}) => {
  const isActive = isActiveMemorization || isActiveReview;

  // تحديد الألوان حسب الحالة
  const getGradientColors = (): [string, string] => {
    if (isActive) return ["#f59e0b", "#d97706"];
    if (surah.status === "completed") return ["#10b981", "#059669"];
    if (surah.status === "in_progress") return ["#3b82f6", "#0ea5e9"];
    return ["#6b7280", "#4b5563"];
  };

  const getStatusIcon = () => {
    if (isActive) return <Sparkles size={24} color="#d97706" />;
    if (surah.status === "completed")
      return <CheckCircle2 size={24} color="#10b981" />;
    if (surah.status === "in_progress")
      return <Clock size={24} color="#3b82f6" />;
    return <Circle size={24} color="#9ca3af" />;
  };

  const getStatusText = () => {
    if (isActiveMemorization && isActiveReview) return "فعّال (حفظ + مراجعة)";
    if (isActiveMemorization) return "فعّال للحفظ";
    if (isActiveReview) return "فعّال للمراجعة";
    if (surah.status === "completed") return "مكتمل";
    if (surah.status === "in_progress") return "قيد التقدم";
    return "لم يبدأ";
  };

  const getStatusBadgeStyle = () => {
    if (isActive) return { backgroundColor: "#fef3c7", borderColor: "#f59e0b" };
    if (surah.status === "completed")
      return { backgroundColor: "#dcfce7", borderColor: "#10b981" };
    if (surah.status === "in_progress")
      return { backgroundColor: "#dbeafe", borderColor: "#3b82f6" };
    return { backgroundColor: "#f3f4f6", borderColor: "#9ca3af" };
  };

  const getStatusTextColor = () => {
    if (isActive) return "#b45309";
    if (surah.status === "completed") return "#047857";
    if (surah.status === "in_progress") return "#1d4ed8";
    return "#6b7280";
  };

  // عدد مقاطع الحفظ والمراجعة
  const memorizationCount =
    surah.segments?.filter((s) => s.type === "memorization").length || 0;
  const reviewCount =
    surah.segments?.filter((s) => s.type === "review").length || 0;

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      activeOpacity={0.8}>
      {/* Header with gradient */}
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              {isActive ? (
                <Sparkles size={24} color="#ffffff" />
              ) : (
                <BookOpen size={24} color="#ffffff" />
              )}
            </View>
            <View style={styles.headerTextContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.surahName}>{surah.surahName}</Text>
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>فعّال</Text>
                  </View>
                )}
              </View>
              <Text style={styles.surahInfo}>
                رقم {surah.surahNumber} • {surah.surahAyahCount} آية
              </Text>
            </View>
          </View>
          <ChevronLeft size={24} color="#ffffff" />
        </View>
      </LinearGradient>

      {/* Body */}
      <View style={styles.body}>
        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusBadgeStyle().backgroundColor,
              borderColor: getStatusBadgeStyle().borderColor,
            },
          ]}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusTextColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {memorizationCount > 0 && (
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#10b981" }]} />
              <Text style={styles.statText}>{memorizationCount} حفظ</Text>
            </View>
          )}
          {reviewCount > 0 && (
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#3b82f6" }]} />
              <Text style={styles.statText}>{reviewCount} مراجعة</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        {surah.progressPercentage > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${surah.progressPercentage}%` },
                  isActive && { backgroundColor: "#f59e0b" },
                  surah.status === "completed" && {
                    backgroundColor: "#10b981",
                  },
                  surah.status === "in_progress" && {
                    backgroundColor: "#3b82f6",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(surah.progressPercentage)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activeContainer: {
    borderColor: "#f59e0b",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.2,
    elevation: 4,
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  surahName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  activeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  surahInfo: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6b7280",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    minWidth: 36,
    textAlign: "right",
  },
});
