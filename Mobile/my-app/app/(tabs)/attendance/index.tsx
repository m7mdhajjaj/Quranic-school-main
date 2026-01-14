/**
 * صفحة الحضور والغياب الرئيسية
 * تعرض واجهة مختلفة حسب دور المستخدم (طالب/معلم/أدمن)
 */
import React, { useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { ClipboardCheck } from "lucide-react-native";
import { useAttendanceData } from "./hooks/useAttendanceData";
import { StudentView } from "./views/StudentView";
import { TeacherView } from "./views/TeacherView";

export default function AttendancePage() {
  const {
    // User
    currentUser,
    // Loading & Error
    loading,
    error,
    // Students
    visibleStudents,
    // Date
    date,
    setDate,
    dateTooOld,
    daysAgo,
    // Attendance State
    isAttendanceTaken,
    hasUnsavedChanges,
    isSaving,
    isSaveDisabled,
    // Stats
    attendanceStats,
    // Teacher
    teacherGroups,
    selectedGroup,
    setSelectedGroup,
    // Student Stats
    monthlyStats,
    weeklyStats,
    currentMonthStats,
    // Actions
    fetchStudentsForTeacher,
    fetchStudentAbsenceStats,
    saveAttendance,
    toggleStudentPresence,
    toggleAllStudents,
  } = useAttendanceData();

  // معالجة التحديث
  const handleRefresh = useCallback(() => {
    if (currentUser?.role === "student") {
      fetchStudentAbsenceStats();
    } else if (
      currentUser?.role === "teacher" ||
      currentUser?.role === "admin"
    ) {
      fetchStudentsForTeacher(date);
    }
  }, [currentUser, date, fetchStudentAbsenceStats, fetchStudentsForTeacher]);

  // شاشة التحميل
  if (loading && !visibleStudents.length && !teacherGroups.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل بيانات الحضور...</Text>
      </View>
    );
  }

  // شاشة الخطأ
  if (error && !visibleStudents.length && !teacherGroups.length) {
    return (
      <View style={styles.errorContainer}>
        <ClipboardCheck size={64} color="#9ca3af" />
        <Text style={styles.errorTitle}>تنبيه</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // واجهة الطالب
  if (currentUser?.role === "student") {
    return (
      <StudentView
        monthlyStats={monthlyStats}
        weeklyStats={weeklyStats}
        currentMonthStats={currentMonthStats}
        onRefresh={handleRefresh}
        isRefreshing={loading}
      />
    );
  }

  // واجهة المعلم/الأدمن
  if (currentUser?.role === "teacher" || currentUser?.role === "admin") {
    return (
      <TeacherView
        groups={teacherGroups}
        students={visibleStudents}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
        date={date}
        onDateChange={setDate}
        stats={attendanceStats}
        onSave={saveAttendance}
        isSaving={isSaving}
        isLoading={loading}
        isDateTooOld={dateTooOld}
        daysAgo={daysAgo}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaveDisabled={isSaveDisabled}
        isAttendanceTaken={isAttendanceTaken}
        toggleStudentPresence={toggleStudentPresence}
        toggleAllStudents={toggleAllStudents}
        onRefresh={handleRefresh}
        isRefreshing={loading}
      />
    );
  }

  // شاشة عدم وجود صلاحية
  return (
    <View style={styles.errorContainer}>
      <ClipboardCheck size={64} color="#9ca3af" />
      <Text style={styles.errorTitle}>غير مصرح</Text>
      <Text style={styles.errorText}>
        عذراً، ليس لديك صلاحية لعرض هذه الصفحة
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
    gap: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
});
