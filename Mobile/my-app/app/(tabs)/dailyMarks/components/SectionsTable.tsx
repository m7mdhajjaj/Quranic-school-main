import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  Users,
  Clock,
  AlertTriangle,
} from "lucide-react-native";
import type { Section, Mark } from "@/Api/dailyMarksApi";
import { Card } from "@/components/ui/Card";

interface SectionsTableProps {
  sections: Section[];
  marks: Mark[];
  isTeacher: boolean;
  onSectionSelect?: (section: Section) => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
  onAddSection?: () => void;
  onAddSchedule?: (section: Section) => void;
  showActions?: boolean;
  loading?: boolean;
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
  onSectionSelect,
  onEditSection,
  onDeleteSection,
  onAddSection,
  onAddSchedule,
  showActions = false,
  loading = false,
}) => {
  // Debug log
  console.log(
    "📋 SectionsTable received:",
    sections.length,
    "sections,",
    marks.length,
    "marks"
  );
  if (sections.length > 0) {
    console.log("📋 First section data:", {
      _id: sections[0]._id,
      reviewSection: sections[0].reviewSection,
      memorizationSection: sections[0].memorizationSection,
      date: sections[0].date,
    });
  }

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

  // Get status configuration
  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case "completed":
        return {
          bg: "#d1fae5",
          text: "#065f46",
          label: "مكتمل",
          borderColor: "#10b981",
        };
      case "in_progress":
        return {
          bg: "#fef3c7",
          text: "#92400e",
          label: "جاري",
          borderColor: "#f59e0b",
        };
      default:
        return {
          bg: "#f3f4f6",
          text: "#6b7280",
          label: "لم يبدأ",
          borderColor: "#d1d5db",
        };
    }
  };

  if (loading) {
    return (
      <Card style={styles.loadingCard}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل المقاطع...</Text>
      </Card>
    );
  }

  if (sections.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>لا توجد مقاطع</Text>
          <Text style={styles.emptyDescription}>
            لم يتم إضافة أي مقاطع بعد في هذا الشهر
          </Text>
          {isTeacher && onAddSection && (
            <TouchableOpacity
              style={styles.addSectionButton}
              onPress={onAddSection}>
              <Plus size={20} color="#ffffff" />
              <Text style={styles.addSectionButtonText}>إضافة مقطع جديد</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  }

  // For teacher view - show cards with actions
  if (isTeacher && showActions) {
    return (
      <View style={styles.cardsContainer}>
        {/* Add Section Button */}
        {onAddSection && (
          <TouchableOpacity
            style={styles.addSectionCardButton}
            onPress={onAddSection}>
            <Plus size={24} color="#10b981" />
            <Text style={styles.addCardButtonText}>إضافة مقطع جديد</Text>
          </TouchableOpacity>
        )}

        {/* Section Cards */}
        {sections.map((section) => {
          const statusConfig = getStatusConfig(section.marksStatus);
          const { formattedDate, dayName } = formatDateWithDay(section.date);

          return (
            <TouchableOpacity
              key={section._id}
              style={[
                styles.sectionCard,
                { borderRightColor: statusConfig.borderColor },
              ]}
              onPress={() => onSectionSelect?.(section)}
              activeOpacity={0.7}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardDateContainer}>
                  <Text style={styles.cardDate}>{formattedDate}</Text>
                  <Text style={styles.cardDay}>{dayName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConfig.bg },
                  ]}>
                  <Text
                    style={[styles.statusText, { color: statusConfig.text }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              {/* Sections Info */}
              <View style={styles.cardSections}>
                <View style={styles.sectionInfoRow}>
                  <View style={styles.reviewTag}>
                    <Text style={styles.tagLabel}>المراجعة</Text>
                  </View>
                  <Text style={styles.sectionInfoText}>
                    {section.reviewSection}
                  </Text>
                </View>
                <View style={styles.sectionInfoRow}>
                  <View style={styles.memorizationTag}>
                    <Text style={styles.tagLabel}>الحفظ</Text>
                  </View>
                  <Text style={styles.sectionInfoText}>
                    {section.memorizationSection}
                  </Text>
                </View>
              </View>

              {/* Progress Info */}
              {section.marksProgress && (
                <View style={styles.progressContainer}>
                  <Users size={14} color="#6b7280" />
                  <Text style={styles.progressText}>
                    {section.marksProgress.studentsWithMarks} /{" "}
                    {section.marksProgress.totalStudents} طالب
                  </Text>
                </View>
              )}

              {/* Schedule Info */}
              {section.timetableId &&
              typeof section.timetableId !== "string" ? (
                <View style={styles.scheduleInfoContainer}>
                  <View style={styles.scheduleInfoHeader}>
                    <Clock size={14} color="#0891b2" />
                    <Text style={styles.scheduleInfoLabel}>موعد الحلقة:</Text>
                    <Text style={styles.scheduleInfoDay}>
                      {section.timetableId.day}
                    </Text>
                    <Text style={styles.scheduleInfoSeparator}>|</Text>
                    <Text style={styles.scheduleInfoTime}>
                      {section.timetableId.startHour} -{" "}
                      {section.timetableId.endHour}
                    </Text>
                  </View>
                </View>
              ) : (
                onAddSchedule && (
                  <View style={styles.noScheduleContainer}>
                    <View style={styles.noScheduleHeader}>
                      <AlertTriangle size={14} color="#f59e0b" />
                      <Text style={styles.noScheduleText}>
                        لم يتم تحديد موعد للحلقة
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addScheduleButton}
                      onPress={() => onAddSchedule(section)}>
                      <Clock size={12} color="#f59e0b" />
                      <Text style={styles.addScheduleButtonText}>
                        إضافة موعد
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* Card Footer with Actions */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => onSectionSelect?.(section)}>
                  <Text style={styles.viewButtonText}>عرض الطلاب</Text>
                  <ChevronLeft size={16} color="#10b981" />
                </TouchableOpacity>

                {/* أزرار التعديل والحذف - تظهر فقط إذا كانت الـ callbacks موجودة */}
                {(onEditSection || onDeleteSection) && (
                  <View style={styles.cardActions}>
                    {onEditSection && (
                      <TouchableOpacity
                        style={styles.editCardButton}
                        onPress={() => onEditSection(section)}>
                        <Edit size={18} color="#f59e0b" />
                      </TouchableOpacity>
                    )}
                    {onDeleteSection && (
                      <TouchableOpacity
                        style={styles.deleteCardButton}
                        onPress={() => onDeleteSection(section._id)}>
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
    textAlign: "right",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right",
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
    textAlign: "center",
  },
  dayText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "center",
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
  // New styles for loading and teacher cards view
  loadingCard: {
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
    textAlign: "center",
  },
  addSectionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 16,
  },
  addSectionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  addSectionCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfdf5",
    borderWidth: 2,
    borderColor: "#10b981",
    borderStyle: "dashed",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addCardButtonText: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderRightWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardDateContainer: {
    flexDirection: "column",
  },
  cardDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  cardDay: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardSections: {
    gap: 8,
    marginBottom: 12,
  },
  sectionInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewTag: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  memorizationTag: {
    backgroundColor: "#f0fdfa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#047857",
  },
  sectionInfoText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    textAlign: "right",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  progressText: {
    fontSize: 13,
    color: "#6b7280",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  editCardButton: {
    padding: 8,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
  },
  deleteCardButton: {
    padding: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },
  // Schedule styles
  scheduleInfoContainer: {
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#cffafe",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  scheduleInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  scheduleInfoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0e7490",
  },
  scheduleInfoDay: {
    fontSize: 12,
    color: "#155e75",
  },
  scheduleInfoSeparator: {
    color: "#67e8f9",
  },
  scheduleInfoTime: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#155e75",
  },
  noScheduleContainer: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  noScheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  noScheduleText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#b45309",
  },
  addScheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addScheduleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d97706",
  },
});
