import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { StudentWithWarnings, WarningType } from "@/types/warning.types";

interface StudentsListProps {
  students: StudentWithWarnings[];
  onAddWarning: (student: StudentWithWarnings) => void;
  onDeleteWarning: (student: StudentWithWarnings, type: WarningType) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  students,
  onAddWarning,
  onDeleteWarning,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // تصفية الطلاب بناءً على البحث
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;

    const query = searchQuery.toLowerCase().trim();
    return students.filter((student) => {
      const fullName =
        `${student.firstName} ${student.middleName || ""} ${student.lastName}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [students, searchQuery]);

  const getFullName = (student: StudentWithWarnings) => {
    return `${student.firstName} ${student.middleName || ""} ${
      student.lastName
    }`.trim();
  };

  const getWarningColor = (count: number) => {
    if (count === 0) return { bg: "#F3F4F6", border: "#9CA3AF", text: "#6B7280" };
    if (count === 1) return { bg: "#FCD34D", border: "#D97706", text: "#FFFFFF" };
    if (count === 2) return { bg: "#F97316", border: "#C2410C", text: "#FFFFFF" };
    return { bg: "#DC2626", border: "#991B1B", text: "#FFFFFF" };
  };

  const handleWarningPress = (
    student: StudentWithWarnings,
    type: WarningType
  ) => {
    const count = student.warnings[type];

    if (count === 0) {
      return;
    }

    Alert.alert(
      "حذف إنذار",
      `هل تريد حذف إنذار ${type} من ${getFullName(student)}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => onDeleteWarning(student, type),
        },
      ]
    );
  };

  const renderStudent = ({ item }: { item: StudentWithWarnings }) => {
    const warnings = item.warnings || {
      warning: 0,
      first: 0,
      second: 0,
      third: 0,
      total: 0,
      details: [],
    };

    const hasWarnings = warnings.total > 0;

    return (
      <View style={styles.studentCard}>
        {/* اسم الطالب */}
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{getFullName(item)}</Text>
            {hasWarnings && (
              <View style={styles.warningsBadge}>
                <Text style={styles.warningsBadgeText}>
                  ⚠️ {warnings.total} إنذار
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => onAddWarning(item)}
            style={styles.addWarningButton}
          >
            <Text style={styles.addWarningButtonText}>+ إنذار</Text>
          </TouchableOpacity>
        </View>

        {/* أنواع الإنذارات */}
        <View style={styles.warningsGrid}>
          {/* تنبيه */}
          <TouchableOpacity
            onPress={() => handleWarningPress(item, "warning")}
            disabled={warnings.warning === 0}
            activeOpacity={0.7}
            style={styles.warningButton}
          >
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: getWarningColor(warnings.warning).bg,
                  borderColor: getWarningColor(warnings.warning).border,
                  borderWidth: 2,
                },
                warnings.warning > 0 && styles.warningBoxActive,
              ]}
            >
              <Text
                style={[
                  styles.warningLabel,
                  { color: getWarningColor(warnings.warning).text },
                ]}
              >
                تنبيه
              </Text>
              <Text
                style={[
                  styles.warningCount,
                  { color: getWarningColor(warnings.warning).text },
                ]}
              >
                {warnings.warning}
              </Text>
            </View>
          </TouchableOpacity>

          {/* إنذار أول */}
          <TouchableOpacity
            onPress={() => handleWarningPress(item, "first")}
            disabled={warnings.first === 0}
            activeOpacity={0.7}
            style={styles.warningButton}
          >
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: getWarningColor(warnings.first).bg,
                  borderColor: getWarningColor(warnings.first).border,
                  borderWidth: 2,
                },
                warnings.first > 0 && styles.warningBoxActive,
              ]}
            >
              <Text
                style={[
                  styles.warningLabel,
                  { color: getWarningColor(warnings.first).text },
                ]}
              >
                إنذار أول
              </Text>
              <Text
                style={[
                  styles.warningCount,
                  { color: getWarningColor(warnings.first).text },
                ]}
              >
                {warnings.first}
              </Text>
            </View>
          </TouchableOpacity>

          {/* إنذار ثاني */}
          <TouchableOpacity
            onPress={() => handleWarningPress(item, "second")}
            disabled={warnings.second === 0}
            activeOpacity={0.7}
            style={styles.warningButton}
          >
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: getWarningColor(warnings.second).bg,
                  borderColor: getWarningColor(warnings.second).border,
                  borderWidth: 2,
                },
                warnings.second > 0 && styles.warningBoxActive,
              ]}
            >
              <Text
                style={[
                  styles.warningLabel,
                  { color: getWarningColor(warnings.second).text },
                ]}
              >
                إنذار ثاني
              </Text>
              <Text
                style={[
                  styles.warningCount,
                  { color: getWarningColor(warnings.second).text },
                ]}
              >
                {warnings.second}
              </Text>
            </View>
          </TouchableOpacity>

          {/* إنذار ثالث */}
          <TouchableOpacity
            onPress={() => handleWarningPress(item, "third")}
            disabled={warnings.third === 0}
            activeOpacity={0.7}
            style={styles.warningButton}
          >
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: getWarningColor(warnings.third).bg,
                  borderColor: getWarningColor(warnings.third).border,
                  borderWidth: 2,
                },
                warnings.third > 0 && styles.warningBoxActive,
              ]}
            >
              <Text
                style={[
                  styles.warningLabel,
                  { color: getWarningColor(warnings.third).text },
                ]}
              >
                إنذار ثالث
              </Text>
              <Text
                style={[
                  styles.warningCount,
                  { color: getWarningColor(warnings.third).text },
                ]}
              >
                {warnings.third}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (students.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>👥</Text>
        <Text style={styles.emptyText}>لا يوجد طلاب</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن طالب..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            textAlign="right"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <Text style={styles.searchResults}>
            النتائج: {filteredStudents.length} طالب
          </Text>
        )}
      </View>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>لا توجد نتائج</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudent}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 12,
    color: "#111827",
    fontSize: 16,
  },
  searchResults: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 8,
  },
  studentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  warningsBadge: {
    backgroundColor: "#FEF2F2",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  warningsBadgeText: {
    color: "#991B1B",
    fontWeight: "bold",
    fontSize: 14,
  },
  addWarningButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  addWarningButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  warningsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  warningButton: {
    flex: 1,
    minWidth: "45%",
  },
  warningBox: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  warningBoxActive: {
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  warningCount: {
    fontSize: 32,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 20,
  },
});
