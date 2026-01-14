/**
 * واجهة المعلم للحضور والغياب
 * يعرض الحلقات وإمكانية تسجيل الحضور لكل حلقة
 */
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { ClipboardCheck } from "lucide-react-native";
import { GroupsGrid } from "../components/GroupsGrid";
import { TeacherToolbar } from "../components/TeacherToolbar";
import { StudentsTable } from "../components/StudentsTable";
import { AttendanceInstructions } from "../components/AttendanceInstructions";
import type { TeacherGroup, AttendanceStats } from "../hooks/useAttendanceData";
import type { AttendanceStudent } from "@/Api/attendanceApi";

// ============================================================================
// Types
// ============================================================================

interface TeacherViewProps {
  groups: TeacherGroup[];
  students: AttendanceStudent[];
  selectedGroup: TeacherGroup | null;
  onSelectGroup: (group: TeacherGroup | null) => void;
  date: string;
  onDateChange: (date: string) => void;
  stats: AttendanceStats;
  onSave: () => Promise<{ success: boolean; message: string }>;
  isSaving: boolean;
  isLoading?: boolean;
  isDateTooOld: boolean;
  daysAgo: number;
  hasUnsavedChanges: boolean;
  isSaveDisabled: boolean;
  isAttendanceTaken: boolean;
  toggleStudentPresence: (studentId: string) => void;
  toggleAllStudents: (isPresent: boolean) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const TeacherView: React.FC<TeacherViewProps> = ({
  groups,
  students,
  selectedGroup,
  onSelectGroup,
  date,
  onDateChange,
  stats,
  onSave,
  isSaving,
  isLoading = false,
  isDateTooOld,
  daysAgo,
  hasUnsavedChanges,
  isSaveDisabled,
  isAttendanceTaken,
  toggleStudentPresence,
  toggleAllStudents,
  onRefresh,
  isRefreshing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // فلترة الطلاب حسب الحلقة والبحث
  const filteredStudents = useMemo(() => {
    let result = students;

    // فلترة حسب الحلقة المحددة
    if (selectedGroup) {
      result = result.filter((s) => s.group === selectedGroup.name);
    }

    // فلترة حسب البحث
    if (searchQuery.trim()) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [students, selectedGroup, searchQuery]);

  // هل جميع الطلاب حاضرين؟
  const allPresent = useMemo(() => {
    return (
      filteredStudents.length > 0 && filteredStudents.every((s) => s.isPresent)
    );
  }, [filteredStudents]);

  // معالجة العودة للخلف
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "تغييرات غير محفوظة",
        "لديك تغييرات غير محفوظة. هل تريد الخروج بدون حفظ؟",
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "خروج",
            style: "destructive",
            onPress: () => {
              onSelectGroup(null);
              setSearchQuery("");
            },
          },
        ]
      );
    } else {
      onSelectGroup(null);
      setSearchQuery("");
    }
  }, [hasUnsavedChanges, onSelectGroup]);

  // معالجة الحفظ
  const handleSave = useCallback(async () => {
    const result = await onSave();
    Alert.alert(result.success ? "تم الحفظ" : "خطأ", result.message, [
      { text: "حسناً" },
    ]);
  }, [onSave]);

  // معالجة تبديل الكل
  const handleToggleAll = useCallback(() => {
    toggleAllStudents(!allPresent);
  }, [allPresent, toggleAllStudents]);

  // عرض شبكة الحلقات إذا لم يتم اختيار حلقة
  if (!selectedGroup) {
    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <ClipboardCheck size={32} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>سجل الحضور والغياب</Text>
          <Text style={styles.headerSubtitle}>
            اختر الحلقة للبدء بتسجيل الحضور
          </Text>
        </View>

        {/* Groups Grid */}
        <GroupsGrid
          groups={groups}
          onSelectGroup={onSelectGroup}
          isLoading={isLoading}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  }

  // عرض صفحة تسجيل الحضور للحلقة المحددة
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }>
        {/* Toolbar */}
        <TeacherToolbar
          groupName={selectedGroup.name}
          date={date}
          onDateChange={onDateChange}
          onBack={handleBack}
          stats={stats}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSave={handleSave}
          isSaving={isSaving}
          isLoading={isLoading}
          isDateTooOld={isDateTooOld}
          daysAgo={daysAgo}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaveDisabled={isSaveDisabled}
          isAttendanceTaken={isAttendanceTaken}
        />

        {/* Students Table */}
        <StudentsTable
          students={filteredStudents}
          selectedAll={allPresent}
          onToggleAll={handleToggleAll}
          onTogglePresence={toggleStudentPresence}
          searchQuery={searchQuery}
        />

        {/* Instructions */}
        <AttendanceInstructions />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#10b981",
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 40,
  },
});
