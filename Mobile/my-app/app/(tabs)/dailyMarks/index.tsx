import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { BookOpen } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { useDailyMarksData } from "./hooks/useDailyMarksData";
import { StudentView } from "@/app/(tabs)/dailyMarks/views/StudentView";
import { TeacherView } from "@/app/(tabs)/dailyMarks/views/TeacherView";

export default function DailyMarksPage() {
  const { user: currentUser } = useAuth();
  const { students, teacherGroups, loading } = useDailyMarksData();

  const isStudent = currentUser?.role === "student";
  const isTeacher =
    currentUser?.role === "teacher" || currentUser?.role === "admin";
  const isTeacherAssistant = currentUser?.role === "teacherAssistant";

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل العلامات اليومية...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isStudent ? (
        <StudentView />
      ) : isTeacher || isTeacherAssistant ? (
        <TeacherView
          students={students}
          teacherGroups={teacherGroups}
          currentUser={currentUser}
          isTeacherAssistant={isTeacherAssistant}
        />
      ) : (
        <View style={styles.errorContainer}>
          <BookOpen size={64} color="#9ca3af" />
          <Text style={styles.errorText}>
            عذراً، ليس لديك صلاحية لعرض هذه الصفحة
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
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
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "600",
  },
});
