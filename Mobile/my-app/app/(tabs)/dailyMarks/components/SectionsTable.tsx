import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { Section, Mark } from "@/Api/dailyMarksApi";
import { Card } from "@/components/ui/Card";

interface SectionsTableProps {
  sections: Section[];
  marks: Mark[];
  isTeacher: boolean;
}

const getMarkColor = (mark: number | null, type: "review" | "memorization") => {
  if (!mark && mark !== 0) return styles.markEmpty;

  if (mark >= 9) {
    return type === "review"
      ? styles.markExcellentReview
      : styles.markExcellentMemorization;
  }
  if (mark >= 7) {
    return type === "review"
      ? styles.markGoodReview
      : styles.markGoodMemorization;
  }
  if (mark >= 5) {
    return type === "review"
      ? styles.markAverageReview
      : styles.markAverageMemorization;
  }
  return type === "review"
    ? styles.markPoorReview
    : styles.markPoorMemorization;
};

const formatDateWithDay = (dateString: string) => {
  const date = new Date(dateString);
  const days = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  const dayName = days[date.getDay()];
  const formattedDate = date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return { formattedDate, dayName };
};

export const SectionsTable: React.FC<SectionsTableProps> = ({
  sections,
  marks,
  isTeacher,
}) => {
  // Find mark for a section
  const findMark = (sectionId: string): Mark | undefined => {
    return marks.find((mark) => {
      const markSectionId =
        typeof mark.sectionId === "string"
          ? mark.sectionId
          : mark.sectionId?._id;
      return markSectionId === sectionId;
    });
  };

  if (sections.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>لا توجد مقاطع</Text>
          <Text style={styles.emptyDescription}>
            لم يتم إضافة أي مقاطع بعد في هذا الشهر
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          {!isTeacher && (
            <Text style={[styles.headerCell, styles.rowNumberCell]}>#</Text>
          )}
          <Text style={[styles.headerCell, styles.sectionCell]}>
            مقطع المراجعة
          </Text>
          <Text style={[styles.headerCell, styles.markCell]}>
            علامة المراجعة
          </Text>
          <Text style={[styles.headerCell, styles.sectionCell]}>
            مقطع الحفظ
          </Text>
          <Text style={[styles.headerCell, styles.markCell]}>علامة الحفظ</Text>
          <Text style={[styles.headerCell, styles.dateCell]}>التاريخ</Text>
        </View>

        {/* Table Body */}
        {sections.map((section, index) => {
          const mark = findMark(section._id);
          const { formattedDate, dayName } = formatDateWithDay(section.date);

          return (
            <View key={section._id} style={styles.tableRow}>
              {!isTeacher && (
                <View style={[styles.cell, styles.rowNumberCell]}>
                  <Text style={styles.rowNumber}>{index + 1}</Text>
                </View>
              )}

              <View style={[styles.cell, styles.sectionCell]}>
                <View style={styles.reviewSection}>
                  <Text style={styles.sectionText}>
                    {section.reviewSection}
                  </Text>
                </View>
              </View>

              <View style={[styles.cell, styles.markCell]}>
                {mark?.reviewMark !== null && mark?.reviewMark !== undefined ? (
                  <View
                    style={[
                      styles.markBadge,
                      getMarkColor(mark.reviewMark, "review"),
                    ]}>
                    <Text style={styles.markText}>{mark.reviewMark}/10</Text>
                  </View>
                ) : (
                  <Text style={styles.emptyMark}>-</Text>
                )}
              </View>

              <View style={[styles.cell, styles.sectionCell]}>
                <View style={styles.memorizationSection}>
                  <Text style={styles.sectionText}>
                    {section.memorizationSection}
                  </Text>
                </View>
              </View>

              <View style={[styles.cell, styles.markCell]}>
                {mark?.memorizationMark !== null &&
                mark?.memorizationMark !== undefined ? (
                  <View
                    style={[
                      styles.markBadge,
                      getMarkColor(mark.memorizationMark, "memorization"),
                    ]}>
                    <Text style={styles.markText}>
                      {mark.memorizationMark}/10
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.emptyMark}>-</Text>
                )}
              </View>

              <View style={[styles.cell, styles.dateCell]}>
                <Text style={styles.dateText}>{formattedDate}</Text>
                <Text style={styles.dayText}>{dayName}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  emptyCard: {
    padding: 40,
  },
  emptyContainer: {
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  table: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerCell: {
    padding: 12,
    fontWeight: "bold",
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  cell: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  rowNumberCell: {
    width: 50,
  },
  sectionCell: {
    width: 150,
  },
  markCell: {
    width: 120,
  },
  dateCell: {
    width: 130,
  },
  rowNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  reviewSection: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  memorizationSection: {
    backgroundColor: "#f0fdfa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sectionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#047857",
    textAlign: "center",
  },
  markBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyMark: {
    fontSize: 14,
    color: "#9ca3af",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  dayText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  markExcellentReview: {
    backgroundColor: "#d1fae5",
  },
  markExcellentMemorization: {
    backgroundColor: "#ccfbf1",
  },
  markGoodReview: {
    backgroundColor: "#dbeafe",
  },
  markGoodMemorization: {
    backgroundColor: "#bfdbfe",
  },
  markAverageReview: {
    backgroundColor: "#fef3c7",
  },
  markAverageMemorization: {
    backgroundColor: "#fde68a",
  },
  markPoorReview: {
    backgroundColor: "#fee2e2",
  },
  markPoorMemorization: {
    backgroundColor: "#fecaca",
  },
  markEmpty: {
    backgroundColor: "#f3f4f6",
  },
});
