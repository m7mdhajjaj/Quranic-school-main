/**
 * شريط أدوات المعلم
 * يعرض الإحصائيات وأدوات البحث والتصفية
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  ArrowRight,
  Users,
  Check,
  X,
  Search,
  Save,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

interface TeacherToolbarProps {
  groupName: string;
  date: string;
  onDateChange: (date: string) => void;
  onBack: () => void;
  stats: AttendanceStats;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isLoading?: boolean;
  isDateTooOld: boolean;
  daysAgo: number;
  hasUnsavedChanges: boolean;
  isSaveDisabled: boolean;
  isAttendanceTaken: boolean;
}

export const TeacherToolbar: React.FC<TeacherToolbarProps> = ({
  groupName,
  date,
  onDateChange,
  onBack,
  stats,
  searchQuery,
  onSearchChange,
  onSave,
  isSaving,
  isLoading = false,
  isDateTooOld,
  daysAgo,
  hasUnsavedChanges,
  isSaveDisabled,
  isAttendanceTaken,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split("T")[0];
      onDateChange(isoDate);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>تسجيل الحضور</Text>
            <View style={styles.groupBadge}>
              <View style={styles.groupDot} />
              <Text style={styles.groupName}>{groupName}</Text>
            </View>
          </View>
        </View>

        {/* Date Picker */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
          activeOpacity={0.8}>
          <Calendar size={18} color="#10b981" />
          <Text style={styles.dateText} numberOfLines={1}>
            {formatDisplayDate(date)}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(date)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {/* Total Students */}
        <View style={[styles.statCard, styles.statCardTeal]}>
          <View style={styles.statIconContainer}>
            <Users size={18} color="#0d9488" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>الطلاب</Text>
            <Text style={[styles.statValue, styles.tealText]}>
              {stats.totalStudents}
            </Text>
          </View>
        </View>

        {/* Present */}
        <View style={[styles.statCard, styles.statCardGreen]}>
          <View style={styles.statIconContainer}>
            <Check size={18} color="#22c55e" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>حاضر</Text>
            <Text style={[styles.statValue, styles.greenText]}>
              {stats.presentCount}
            </Text>
          </View>
        </View>

        {/* Absent */}
        <View style={[styles.statCard, styles.statCardRed]}>
          <View style={styles.statIconContainer}>
            <X size={18} color="#ef4444" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>غائب</Text>
            <Text style={[styles.statValue, styles.redText]}>
              {stats.absentCount}
            </Text>
          </View>
        </View>

        {/* Rate */}
        <View style={[styles.statCard, styles.statCardPurple]}>
          <View style={styles.statIconContainer}>
            <Text style={styles.percentIcon}>%</Text>
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>النسبة</Text>
            <Text style={[styles.statValue, styles.purpleText]}>
              {stats.attendanceRate}%
            </Text>
          </View>
        </View>
      </View>

      {/* Search & Actions */}
      <View style={styles.actionsContainer}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="بحث عن طالب..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>

        {/* Warning Messages */}
        {isDateTooOld && (
          <View style={styles.warningBanner}>
            <AlertTriangle size={16} color="#dc2626" />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningText}>
                تاريخ قديم ({daysAgo} يوم) - لا يمكن التعديل
              </Text>
              <Text style={styles.warningSubtext}>
                يمكن تعديل الحضور خلال أسبوع فقط
              </Text>
            </View>
          </View>
        )}

        {isAttendanceTaken && !hasUnsavedChanges && !isDateTooOld && (
          <View style={styles.infoBanner}>
            <CheckCircle size={16} color="#2563eb" />
            <Text style={styles.infoText}>
              تم حفظ الحضور - عدّل لتفعيل الحفظ
            </Text>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          onPress={onSave}
          disabled={isSaveDisabled || isSaving}
          style={[
            styles.saveButton,
            (isSaveDisabled || isSaving) && styles.saveButtonDisabled,
          ]}
          activeOpacity={0.8}>
          {isSaving ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.saveButtonText}>جاري الحفظ...</Text>
            </>
          ) : (
            <>
              <Save size={18} color="#ffffff" />
              <Text style={styles.saveButtonText}>حفظ السجل</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  groupBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  groupDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  groupName: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  statCardTeal: {
    backgroundColor: "rgba(20, 184, 166, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.15)",
  },
  statCardGreen: {
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.15)",
  },
  statCardRed: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  statCardPurple: {
    backgroundColor: "rgba(168, 85, 247, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.15)",
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  percentIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#a855f7",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tealText: {
    color: "#0d9488",
  },
  greenText: {
    color: "#22c55e",
  },
  redText: {
    color: "#ef4444",
  },
  purpleText: {
    color: "#a855f7",
  },
  actionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "#374151",
    textAlign: "right",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    padding: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#dc2626",
  },
  warningSubtext: {
    fontSize: 10,
    color: "#ef4444",
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 10,
    padding: 12,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#d1d5db",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
