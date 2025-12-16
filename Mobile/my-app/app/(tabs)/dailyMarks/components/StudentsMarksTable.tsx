import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Plus, Edit, Trash2 } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import type { Section, Mark } from "@/Api/dailyMarksApi";
import type { Student } from "@/Api/studentApi";

interface StudentMarkRow {
  student: Student;
  mark: Mark | undefined;
}

interface StudentsMarksTableProps {
  students: Student[];
  marks: Mark[];
  section: Section;
  loading?: boolean;
  onAddMark: (student: Student) => void;
  onEditMark: (mark: Mark, student: Student) => void;
  onDeleteMark: (markId: string) => void;
}

export const StudentsMarksTable: React.FC<StudentsMarksTableProps> = ({
  students,
  marks,
  section,
  loading = false,
  onAddMark,
  onEditMark,
  onDeleteMark,
}) => {
  // Build table data
  const tableData: StudentMarkRow[] = students.map((student) => {
    const mark = marks.find((m) => {
      const studentId =
        typeof m.studentId === "string" ? m.studentId : m.studentId._id;
      return studentId === student._id;
    });
    return { student, mark };
  });

  const getMarkColor = (mark: number | null | undefined) => {
    if (mark === null || mark === undefined) return null;
    if (mark >= 9) return { bg: "#d1fae5", text: "#065f46", border: "#10b981" };
    if (mark >= 8) return { bg: "#d1fae5", text: "#047857", border: "#34d399" };
    if (mark >= 7) return { bg: "#fef3c7", text: "#92400e", border: "#fbbf24" };
    return { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" };
  };

  if (loading) {
    return (
      <Card style={styles.loadingCard}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل العلامات...</Text>
      </Card>
    );
  }

  if (tableData.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyTitle}>لا يوجد طلاب</Text>
        <Text style={styles.emptyDescription}>
          لم يتم العثور على طلاب في هذه الحلقة
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.tableCard}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.tableWrapper}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.numberCell]}>#</Text>
            <Text style={[styles.headerCell, styles.nameCell]}>الطالب</Text>
            <Text style={[styles.headerCell, styles.markCell]}>المراجعة</Text>
            <Text style={[styles.headerCell, styles.markCell]}>الحفظ</Text>
            <Text style={[styles.headerCell, styles.actionsCell]}>
              الإجراءات
            </Text>
          </View>

          {/* Table Body */}
          <ScrollView
            style={styles.tableBody}
            showsVerticalScrollIndicator={false}>
            {tableData.map((row, index) => {
              const reviewColor = getMarkColor(row.mark?.reviewMark);
              const memColor = getMarkColor(row.mark?.memorizationMark);

              return (
                <View key={row.student._id} style={styles.tableRow}>
                  {/* Number */}
                  <View style={[styles.cell, styles.numberCell]}>
                    <Text style={styles.rowNumber}>{index + 1}</Text>
                  </View>

                  {/* Student Name */}
                  <View style={[styles.cell, styles.nameCell]}>
                    <Text style={styles.studentName}>
                      {row.student.firstName} {row.student.fatherName}{" "}
                      {row.student.lastName}
                    </Text>
                  </View>

                  {/* Review Mark */}
                  <View style={[styles.cell, styles.markCell]}>
                    {row.mark?.reviewMark !== null &&
                    row.mark?.reviewMark !== undefined ? (
                      <View
                        style={[
                          styles.markBadge,
                          {
                            backgroundColor: reviewColor?.bg,
                            borderColor: reviewColor?.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.markText,
                            { color: reviewColor?.text },
                          ]}>
                          {row.mark.reviewMark}/10
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.noMark}>-</Text>
                    )}
                  </View>

                  {/* Memorization Mark */}
                  <View style={[styles.cell, styles.markCell]}>
                    {row.mark?.memorizationMark !== null &&
                    row.mark?.memorizationMark !== undefined ? (
                      <View
                        style={[
                          styles.markBadge,
                          {
                            backgroundColor: memColor?.bg,
                            borderColor: memColor?.border,
                          },
                        ]}>
                        <Text
                          style={[styles.markText, { color: memColor?.text }]}>
                          {row.mark.memorizationMark}/10
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.noMark}>-</Text>
                    )}
                  </View>

                  {/* Actions */}
                  <View style={[styles.cell, styles.actionsCell]}>
                    {row.mark ? (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => onEditMark(row.mark!, row.student)}>
                          <Edit size={18} color="#10b981" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => onDeleteMark(row.mark!._id)}>
                          <Trash2 size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => onAddMark(row.student)}>
                        <Plus size={20} color="#ffffff" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  tableCard: {
    padding: 0,
    overflow: "hidden",
  },
  tableWrapper: {
    minWidth: "100%",
  },
  loadingCard: {
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
    textAlign: "right",
  },
  emptyCard: {
    padding: 40,
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
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  tableBody: {
    maxHeight: 500,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#ffffff",
  },
  cell: {
    justifyContent: "center",
    alignItems: "center",
  },
  numberCell: {
    width: 40,
  },
  nameCell: {
    width: 180,
    alignItems: "flex-end",
    paddingRight: 8,
  },
  markCell: {
    width: 90,
  },
  actionsCell: {
    width: 110,
  },
  rowNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "right",
  },
  markBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  markText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  noMark: {
    fontSize: 16,
    color: "#d1d5db",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
  },
  deleteButton: {
    padding: 10,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#fecaca",
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#14b8a6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
});
