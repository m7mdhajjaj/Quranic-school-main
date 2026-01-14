/**
 * جدول الطلاب لتسجيل الحضور
 * يعرض قائمة الطلاب مع إمكانية تغيير حالة الحضور
 */
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import {
  Users,
  Check,
  X,
  Calendar,
  Phone,
  ChevronDown,
} from "lucide-react-native";
import type { AttendanceStudent } from "@/Api/attendanceApi";

interface StudentsTableProps {
  students: AttendanceStudent[];
  selectedAll: boolean;
  onToggleAll: () => void;
  onTogglePresence: (studentId: string) => void;
  searchQuery?: string;
  readOnly?: boolean;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  selectedAll,
  onToggleAll,
  onTogglePresence,
  searchQuery = "",
  readOnly = false,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<{
    name: string;
    absenceDates: string[];
  } | null>(null);

  // فلترة الطلاب حسب البحث
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    return students.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const openDatesModal = (studentName: string, absenceDates: string[]) => {
    setSelectedStudent({ name: studentName, absenceDates });
  };

  const renderStudentItem = ({
    item,
    index,
  }: {
    item: AttendanceStudent;
    index: number;
  }) => (
    <TouchableOpacity
      style={[styles.studentRow, !item.isPresent && styles.absentRow]}
      onPress={readOnly ? undefined : () => onTogglePresence(item._id)}
      activeOpacity={readOnly ? 1 : 0.7}>
      {/* Row Number */}
      <View style={styles.rowNumberContainer}>
        <Text style={styles.rowNumber}>
          {(index + 1).toString().padStart(2, "0")}
        </Text>
      </View>

      {/* Student Info */}
      <View style={styles.studentInfo}>
        <Text
          style={[styles.studentName, !item.isPresent && styles.absentName]}
          numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.studentMeta}>
          {/* Gender Badge */}
          <View
            style={[
              styles.genderBadge,
              item.gender === "female" ? styles.femaleBadge : styles.maleBadge,
            ]}>
            <Text
              style={[
                styles.genderText,
                item.gender === "female" ? styles.femaleText : styles.maleText,
              ]}>
              {item.gender === "female" ? "أنثى" : "ذكر"}
            </Text>
          </View>

          {/* Phone */}
          {item.phoneNumber && (
            <View style={styles.phoneBadge}>
              <Phone size={10} color="#6b7280" />
              <Text style={styles.phoneText}>{item.phoneNumber}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Absence Count */}
      <View style={styles.absenceContainer}>
        <View
          style={[
            styles.absenceBadge,
            (item.totalAbsences ?? 0) === 0
              ? styles.goodBadge
              : (item.totalAbsences ?? 0) <= 3
                ? styles.warningBadge
                : styles.dangerBadge,
          ]}>
          <Text
            style={[
              styles.absenceCount,
              (item.totalAbsences ?? 0) === 0
                ? styles.goodText
                : (item.totalAbsences ?? 0) <= 3
                  ? styles.warningText
                  : styles.dangerText,
            ]}>
            {item.totalAbsences ?? 0}
          </Text>
        </View>
        {(item.absenceDates?.length ?? 0) > 0 && (
          <TouchableOpacity
            style={styles.datesButton}
            onPress={() => openDatesModal(item.name, item.absenceDates || [])}>
            <Calendar size={12} color="#0d9488" />
            <Text style={styles.datesButtonText}>التفاصيل</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Checkbox */}
      {!readOnly && (
        <TouchableOpacity
          style={[
            styles.checkbox,
            item.isPresent ? styles.checkboxChecked : styles.checkboxUnchecked,
          ]}
          onPress={() => onTogglePresence(item._id)}>
          {item.isPresent && <Check size={16} color="#ffffff" />}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (filteredStudents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Users size={32} color="#9ca3af" />
        </View>
        <Text style={styles.emptyTitle}>لا يوجد طلاب</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? "لم يتم العثور على طلاب مطابقين للبحث"
            : "لا يوجد طلاب في هذه الحلقة"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Users size={18} color="#ffffff" />
          <Text style={styles.headerText}>
            قائمة الطلاب ({filteredStudents.length})
          </Text>
        </View>
        {!readOnly && (
          <TouchableOpacity
            style={styles.selectAllButton}
            onPress={onToggleAll}>
            <Text style={styles.selectAllText}>تحديد الكل</Text>
            <View
              style={[
                styles.selectAllCheckbox,
                selectedAll && styles.selectAllChecked,
              ]}>
              {selectedAll && <Check size={12} color="#10b981" />}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item._id}
        renderItem={renderStudentItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Absence Dates Modal */}
      <Modal
        visible={!!selectedStudent}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedStudent(null)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedStudent(null)}>
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تواريخ غياب</Text>
              <Text style={styles.modalSubtitle}>{selectedStudent?.name}</Text>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedStudent?.absenceDates.map((date, index) => (
                <View key={index} style={styles.dateItem}>
                  <View style={styles.dateDot} />
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateDayName}>
                      {new Date(date).toLocaleDateString("ar-EG", {
                        weekday: "long",
                      })}
                    </Text>
                    <Text style={styles.dateFullDate}>
                      {new Date(date).toLocaleDateString("ar-EG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedStudent(null)}>
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectAllText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  selectAllCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  selectAllChecked: {
    backgroundColor: "#ffffff",
  },
  listContent: {
    paddingBottom: 16,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 12,
  },
  absentRow: {
    backgroundColor: "rgba(239, 68, 68, 0.04)",
  },
  rowNumberContainer: {
    width: 28,
  },
  rowNumber: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
    marginBottom: 4,
  },
  absentName: {
    color: "#dc2626",
  },
  studentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  genderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  maleBadge: {
    backgroundColor: "#eff6ff",
  },
  femaleBadge: {
    backgroundColor: "#fdf2f8",
  },
  genderText: {
    fontSize: 10,
    fontWeight: "600",
  },
  maleText: {
    color: "#3b82f6",
  },
  femaleText: {
    color: "#ec4899",
  },
  phoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  phoneText: {
    fontSize: 10,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  absenceContainer: {
    alignItems: "center",
    gap: 4,
  },
  absenceBadge: {
    minWidth: 28,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  goodBadge: {
    backgroundColor: "#f0fdf4",
  },
  warningBadge: {
    backgroundColor: "#fefce8",
  },
  dangerBadge: {
    backgroundColor: "#fef2f2",
  },
  absenceCount: {
    fontSize: 12,
    fontWeight: "bold",
  },
  goodText: {
    color: "#22c55e",
  },
  warningText: {
    color: "#eab308",
  },
  dangerText: {
    color: "#ef4444",
  },
  datesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  datesButtonText: {
    fontSize: 10,
    color: "#0d9488",
    fontWeight: "600",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#10b981",
  },
  checkboxUnchecked: {
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#d1d5db",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "#10b981",
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  modalBody: {
    padding: 16,
    maxHeight: 300,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  dateInfo: {
    flex: 1,
  },
  dateDayName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
  },
  dateFullDate: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 2,
  },
  modalCloseButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
  },
});
