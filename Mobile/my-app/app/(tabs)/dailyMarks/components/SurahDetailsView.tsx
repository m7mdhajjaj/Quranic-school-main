import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { BookOpen, Star, X, ChevronUp, ChevronDown } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import type {
  GroupedSurah,
  SurahSegment,
} from "@/Api/studentGroupedSectionsApi";

interface SurahDetailsViewProps {
  surah: GroupedSurah;
  onClose: () => void;
  isActiveMemorization?: boolean;
  isActiveReview?: boolean;
}

export const SurahDetailsView: React.FC<SurahDetailsViewProps> = ({
  surah,
  onClose,
  isActiveMemorization,
  isActiveReview,
}) => {
  const isActive = isActiveMemorization || isActiveReview;

  // تجميع المقاطع حسب النوع
  const memorizationSegments =
    surah.segments?.filter((s) => s.type === "memorization") || [];
  const reviewSegments =
    surah.segments?.filter((s) => s.type === "review") || [];

  const getGradeColor = (grade?: number) => {
    if (!grade) return "#9ca3af";
    if (grade >= 90) return "#10b981";
    if (grade >= 70) return "#3b82f6";
    if (grade >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getGradeBadge = (grade?: number) => {
    if (!grade) return { text: "غير محدد", bg: "#f3f4f6", color: "#6b7280" };
    if (grade >= 90) return { text: "ممتاز", bg: "#dcfce7", color: "#047857" };
    if (grade >= 70)
      return { text: "جيد جداً", bg: "#dbeafe", color: "#1d4ed8" };
    if (grade >= 50) return { text: "جيد", bg: "#fef3c7", color: "#b45309" };
    return { text: "ضعيف", bg: "#fee2e2", color: "#b91c1c" };
  };

  const renderSegment = (segment: SurahSegment, index: number) => {
    // حساب الدرجة من بيانات الـ mark
    const grade =
      segment.type === "memorization"
        ? (segment.mark?.memorizationMark ?? undefined)
        : (segment.mark?.reviewMark ?? undefined);

    // تحويل الدرجة من 10 إلى نسبة مئوية
    const gradePercent = grade !== undefined ? grade * 10 : undefined;

    const gradeInfo = getGradeBadge(gradePercent);
    const isMemorization = segment.type === "memorization";

    // استخدام الحقول الصحيحة من الـ API
    const startAyah = segment.ayahStart;
    const endAyah = segment.ayahEnd;
    const segmentDate = segment.sectionDate;

    return (
      <View key={segment.segmentId || index} style={styles.segmentCard}>
        <View style={styles.segmentHeader}>
          <View style={styles.segmentTitleRow}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: isMemorization ? "#dcfce7" : "#dbeafe",
                },
              ]}>
              <Text
                style={[
                  styles.typeBadgeText,
                  {
                    color: isMemorization ? "#047857" : "#1d4ed8",
                  },
                ]}>
                {isMemorization ? "حفظ" : "مراجعة"}
              </Text>
            </View>
            <Text style={styles.segmentRange}>
              من آية {startAyah} إلى {endAyah}
            </Text>
          </View>

          <View style={styles.gradeContainer}>
            <View
              style={[styles.gradeBadge, { backgroundColor: gradeInfo.bg }]}>
              <Star size={14} color={getGradeColor(gradePercent)} />
              <Text style={[styles.gradeText, { color: gradeInfo.color }]}>
                {grade !== undefined ? `${grade}/10` : "-"}
              </Text>
            </View>
            <Text style={[styles.gradeLabel, { color: gradeInfo.color }]}>
              {gradeInfo.text}
            </Text>
          </View>
        </View>

        {segmentDate && (
          <Text style={styles.dateText}>
            التاريخ: {new Date(segmentDate).toLocaleDateString("ar-SA")}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={isActive ? ["#f59e0b", "#d97706"] : ["#3b82f6", "#0ea5e9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <BookOpen size={32} color="#ffffff" />
            </View>
            <View style={styles.headerText}>
              <View style={styles.titleRow}>
                <Text style={styles.surahName}>{surah.surahName}</Text>
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>
                      {isActiveMemorization && isActiveReview
                        ? "فعّال"
                        : isActiveMemorization
                          ? "حفظ"
                          : "مراجعة"}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.surahInfo}>
                رقم {surah.surahNumber} • {surah.surahAyahCount} آية
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${surah.progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(surah.progressPercentage)}% مكتمل
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#dcfce7" }]}>
            <ChevronUp size={20} color="#047857" />
            <Text style={[styles.statNumber, { color: "#047857" }]}>
              {memorizationSegments.length}
            </Text>
            <Text style={styles.statLabel}>حفظ</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#dbeafe" }]}>
            <ChevronDown size={20} color="#1d4ed8" />
            <Text style={[styles.statNumber, { color: "#1d4ed8" }]}>
              {reviewSegments.length}
            </Text>
            <Text style={styles.statLabel}>مراجعة</Text>
          </View>
        </View>

        {/* Memorization Segments */}
        {memorizationSegments.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.sectionDot, { backgroundColor: "#10b981" }]}
              />
              <Text style={styles.sectionTitle}>مقاطع الحفظ</Text>
            </View>
            {memorizationSegments.map((segment, idx) =>
              renderSegment(segment, idx),
            )}
          </View>
        )}

        {/* Review Segments */}
        {reviewSegments.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.sectionDot, { backgroundColor: "#3b82f6" }]}
              />
              <Text style={styles.sectionTitle}>مقاطع المراجعة</Text>
            </View>
            {reviewSegments.map((segment, idx) => renderSegment(segment, idx))}
          </View>
        )}

        {/* Empty State */}
        {surah.segments?.length === 0 && (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>لا توجد مقاطع مسجلة بعد</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 20,
    paddingTop: 48,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  surahName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  activeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  surahInfo: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressSection: {
    marginTop: 20,
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  segmentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  segmentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  segmentRange: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  gradeContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  gradeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  gradeLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  notesContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 10,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#9ca3af",
  },
});
