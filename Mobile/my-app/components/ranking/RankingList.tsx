/**
 * Ranking List Component
 * Displays all students in a FlatList
 */

import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type {
  RankingListProps,
  StudentWithAverage,
} from "@/types/ranking.types";
import { getFullName, getMedalColor } from "@/utils/rankingHelpers";

export const RankingList: React.FC<RankingListProps> = ({ students }) => {
  const renderStudentCard = ({
    item: student,
    index,
  }: {
    item: StudentWithAverage;
    index: number;
  }) => {
    const isTopThree = index < 3;
    const medalColor = getMedalColor(student.rank);

    return (
      <View style={[styles.card, isTopThree && styles.topThreeCard]}>
        {/* Header: Rank + Name */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.rankBadge, { backgroundColor: medalColor }]}>
              <Text style={styles.rankText}>{student.rank}</Text>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.studentName} numberOfLines={1}>
                {getFullName(student)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Overall Average */}
          <View style={styles.statCard}>
            <LinearGradient
              colors={["#D1FAE5", "#A7F3D0"]}
              style={styles.statGradient}>
              <Text style={styles.statLabel}>المعدل الكلي</Text>
              <Text
                style={[styles.statValue, isTopThree && styles.topThreeValue]}>
                {student.overallAverage.toFixed(1)}%
              </Text>
            </LinearGradient>
          </View>

          {/* Total Marks */}
          <View style={styles.statCard}>
            <View style={styles.statGradientGray}>
              <Text style={styles.statLabel}>عدد العلامات</Text>
              <Text style={styles.statValue}>{student.totalMarks}</Text>
            </View>
          </View>

          {/* Memorization */}
          <View style={styles.statCard}>
            <View style={styles.statGradientBlue}>
              <Text style={styles.statLabel}>معدل الحفظ</Text>
              <Text style={styles.statValueSmall}>
                {student.memorizationAverage.toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Review */}
          <View style={styles.statCard}>
            <View style={styles.statGradientPurple}>
              <Text style={styles.statLabel}>معدل المراجعة</Text>
              <Text style={styles.statValueSmall}>
                {student.reviewAverage.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#10B981", "#14B8A6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <Text style={styles.headerText}>ترتيب جميع الطلاب</Text>
      </LinearGradient>

      {/* List */}
      <View style={styles.listContainer}>
        {students.length > 0 ? (
          <FlatList
            data={students}
            renderItem={renderStudentCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>لا يوجد طلاب للعرض</Text>
            <Text style={styles.emptyDescription}>
              لم يتم العثور على أي بيانات للطلاب
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFF",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  listContainer: {
    backgroundColor: "#FFF",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  topThreeCard: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  nameContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
  },
  statGradient: {
    padding: 12,
    borderRadius: 8,
  },
  statGradientGray: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  statGradientBlue: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
  },
  statGradientPurple: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#EDE9FE",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  topThreeValue: {
    color: "#047857",
  },
  statValueSmall: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
});
