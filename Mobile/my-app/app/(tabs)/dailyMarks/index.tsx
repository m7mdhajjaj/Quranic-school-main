import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { BookOpen, LayoutGrid, List } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { useDailyMarksData } from "./hooks/useDailyMarksData";
import { StudentView } from "@/app/(tabs)/dailyMarks/views/StudentView";
import { NewStudentView } from "@/app/(tabs)/dailyMarks/views/NewStudentView";
import { TeacherView } from "@/app/(tabs)/dailyMarks/views/TeacherView";

export default function DailyMarksPage() {
  const { user: currentUser } = useAuth();
  const { students, teacherGroups, loading } = useDailyMarksData();
  const [useNewView, setUseNewView] = useState(true); // Default to new view

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
        <>
          {/* View Toggle for Students */}
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                useNewView && styles.viewToggleButtonActive,
              ]}
              onPress={() => setUseNewView(true)}>
              <LayoutGrid
                size={18}
                color={useNewView ? "#ffffff" : "#6b7280"}
              />
              <Text
                style={[
                  styles.viewToggleText,
                  useNewView && styles.viewToggleTextActive,
                ]}>
                عرض السور
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                !useNewView && styles.viewToggleButtonActive,
              ]}
              onPress={() => setUseNewView(false)}>
              <List size={18} color={!useNewView ? "#ffffff" : "#6b7280"} />
              <Text
                style={[
                  styles.viewToggleText,
                  !useNewView && styles.viewToggleTextActive,
                ]}>
                عرض المقاطع
              </Text>
            </TouchableOpacity>
          </View>
          {useNewView ? <NewStudentView /> : <StudentView />}
        </>
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
  viewToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: "#10b981",
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  viewToggleTextActive: {
    color: "#ffffff",
  },
});
