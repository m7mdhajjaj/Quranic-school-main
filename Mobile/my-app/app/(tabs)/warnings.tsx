import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAuth } from "@/Context/AuthContext";
import {
  useWarningsData,
  useWarningsActions,
  useGroupSelection,
} from "@/hooks/warnings";
import {
  StudentView,
  GroupsList,
  StudentsList,
  AddWarningModal,
} from "@/components/warnings";
import { StudentWithWarnings, WarningType } from "@/types/warning.types";
import { LinearGradient } from "expo-linear-gradient";

export default function WarningsScreen() {
  const { user } = useAuth();
  const {
    groups,
    warnings,
    statistics,
    loading,
    isTeacher,
    isStudent,
    refetchData,
    fetchTeacherStats,
  } = useWarningsData();

  const {
    selectedGroup,
    loadingStudents,
    handleGroupSelect,
    refreshCurrentGroup,
    handleBack,
  } = useGroupSelection();

  const { isSubmitting, handleCreateWarning, handleDeleteWarningByType } =
    useWarningsActions(() => {
      refreshCurrentGroup();
      refetchData();
      fetchTeacherStats();
    });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithWarnings | null>(null);

  const handleAddWarning = (student: StudentWithWarnings) => {
    setSelectedStudent(student);
    setShowAddModal(true);
  };

  const handleDeleteWarning = (
    student: StudentWithWarnings,
    type: WarningType
  ) => {
    handleDeleteWarningByType(student._id, type);
  };

  // عرض واجهة الطالب
  if (isStudent) {
    return (
      <View style={styles.container}>
        <View style={styles.studentHeader}>
          <LinearGradient
            colors={["#EF4444", "#F97316"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.studentHeaderGradient}
          >
            <View style={styles.studentHeaderContent}>
              <View style={styles.studentHeaderIcon}>
                <Text style={styles.studentHeaderEmoji}>⚠️</Text>
              </View>
              <View style={styles.studentHeaderText}>
                <Text style={styles.studentHeaderTitle}>الإنذارات</Text>
                <Text style={styles.studentHeaderSubtitle}>
                  تابع إنذاراتك والتزم بالقوانين
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : (
          <View style={styles.studentContent}>
            <StudentView warnings={warnings} loading={loading} />
          </View>
        )}
      </View>
    );
  }

  // عرض واجهة المعلم
  if (isTeacher) {
    return (
      <View style={styles.container}>
        {/* العنوان */}
        <View style={styles.teacherHeader}>
          <View style={styles.teacherHeaderContent}>
            <View style={styles.teacherHeaderIcon}>
              <Text style={styles.teacherHeaderEmoji}>⚠️</Text>
            </View>
            <View style={styles.teacherHeaderText}>
              <Text style={styles.teacherHeaderTitle}>إدارة الإنذارات</Text>
            </View>
          </View>
          {statistics && !selectedGroup && (
            <View style={styles.statisticsRow}>
              <View style={styles.statisticItem}>
                <Text style={styles.statisticLabel}>إجمالي</Text>
                <Text style={styles.statisticValue}>
                  {statistics.totalWarnings}
                </Text>
              </View>
              <View style={styles.statisticItem}>
                <Text style={styles.statisticLabel}>طلاب</Text>
                <Text style={styles.statisticValue}>
                  {statistics.studentsWithWarnings}
                </Text>
              </View>
              <View style={styles.statisticItem}>
                <Text style={styles.statisticLabel}>مفصولين</Text>
                <Text style={styles.statisticValue}>
                  {statistics.expelledStudents}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.teacherContent}>
          {/* زر الرجوع */}
          {selectedGroup && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
            >
              <Text style={styles.backButtonIcon}>←</Text>
              <Text style={styles.backButtonText}>العودة للحلقات</Text>
            </TouchableOpacity>
          )}

          {/* المحتوى */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EF4444" />
              <Text style={styles.loadingText}>جاري التحميل...</Text>
            </View>
          ) : selectedGroup ? (
            loadingStudents ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EF4444" />
                <Text style={styles.loadingText}>جاري تحميل الطلاب...</Text>
              </View>
            ) : (
              <>
                {/* إحصائيات الحلقة */}
                {selectedGroup.statistics && (
                  <View style={styles.groupStatistics}>
                    <Text style={styles.groupStatisticsTitle}>
                      📊 {selectedGroup.name}
                    </Text>
                    <View style={styles.groupStatisticsRow}>
                      <View style={styles.groupStatisticItem}>
                        <Text style={styles.groupStatisticLabel}>تنبيه</Text>
                        <Text style={styles.groupStatisticValue}>
                          {selectedGroup.statistics.warning}
                        </Text>
                      </View>
                      <View style={[styles.groupStatisticItem, { backgroundColor: "#FFEDD5" }]}>
                        <Text style={styles.groupStatisticLabelOrange}>أول</Text>
                        <Text style={styles.groupStatisticValueOrange}>
                          {selectedGroup.statistics.first}
                        </Text>
                      </View>
                      <View style={[styles.groupStatisticItem, { backgroundColor: "#FEE2E2" }]}>
                        <Text style={styles.groupStatisticLabelRed}>ثاني</Text>
                        <Text style={styles.groupStatisticValueRed}>
                          {selectedGroup.statistics.second}
                        </Text>
                      </View>
                      <View style={[styles.groupStatisticItem, { backgroundColor: "#FECACA" }]}>
                        <Text style={styles.groupStatisticLabelDarkRed}>ثالث</Text>
                        <Text style={styles.groupStatisticValueDarkRed}>
                          {selectedGroup.statistics.third}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <StudentsList
                  students={selectedGroup.students}
                  onAddWarning={handleAddWarning}
                  onDeleteWarning={handleDeleteWarning}
                />

                {/* الطلاب المفصولين */}
                {selectedGroup.expelledStudents &&
                  selectedGroup.expelledStudents.length > 0 && (
                    <View style={styles.expelledContainer}>
                      <Text style={styles.expelledTitle}>
                        🚫 طلاب مفصولين ({selectedGroup.expelledStudents.length})
                      </Text>
                      {selectedGroup.expelledStudents.map((student) => (
                        <View key={student._id} style={styles.expelledStudent}>
                          <Text style={styles.expelledStudentName}>
                            {`${student.firstName} ${student.middleName || ""} ${
                              student.lastName
                            }`.trim()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
              </>
            )
          ) : (
            <GroupsList groups={groups} onGroupSelect={handleGroupSelect} />
          )}
        </View>

        {/* Modal إضافة إنذار */}
        <AddWarningModal
          visible={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedStudent(null);
          }}
          onSubmit={handleCreateWarning}
          student={selectedStudent}
          teacherId={user?._id || ""}
          groupName={selectedGroup?.name || ""}
          isSubmitting={isSubmitting}
        />
      </View>
    );
  }

  // غير مصرح
  return (
    <View style={styles.unauthorizedContainer}>
      <Text style={styles.unauthorizedEmoji}>🚫</Text>
      <Text style={styles.unauthorizedText}>
        غير مصرح لك بالوصول لهذه الصفحة
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  studentHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  studentHeaderGradient: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  studentHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  studentHeaderIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    padding: 12,
  },
  studentHeaderEmoji: {
    fontSize: 32,
  },
  studentHeaderText: {
    flex: 1,
  },
  studentHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  studentHeaderSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  studentContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  teacherHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#FECACA",
  },
  teacherHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  teacherHeaderIcon: {
    backgroundColor: "#FEE2E2",
    borderRadius: 999,
    padding: 8,
  },
  teacherHeaderEmoji: {
    fontSize: 20,
  },
  teacherHeaderText: {
    flex: 1,
  },
  teacherHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  statisticsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  statisticItem: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 6,
  },
  statisticLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  statisticValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  teacherContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 80,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButtonIcon: {
    fontSize: 18,
  },
  backButtonText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 14,
  },
  groupStatistics: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  groupStatisticsTitle: {
    color: "#374151",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 6,
  },
  groupStatisticsRow: {
    flexDirection: "row",
    gap: 6,
  },
  groupStatisticItem: {
    flex: 1,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 6,
  },
  groupStatisticLabel: {
    fontSize: 10,
    color: "#92400E",
  },
  groupStatisticValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#78350F",
  },
  groupStatisticLabelOrange: {
    fontSize: 10,
    color: "#9A3412",
  },
  groupStatisticValueOrange: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7C2D12",
  },
  groupStatisticLabelRed: {
    fontSize: 10,
    color: "#991B1B",
  },
  groupStatisticValueRed: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7F1D1D",
  },
  groupStatisticLabelDarkRed: {
    fontSize: 10,
    color: "#7F1D1D",
  },
  groupStatisticValueDarkRed: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#5F1A1A",
  },
  expelledContainer: {
    backgroundColor: "#FEF2F2",
    borderWidth: 2,
    borderColor: "#FECACA",
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
  },
  expelledTitle: {
    color: "#991B1B",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  expelledStudent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  expelledStudentName: {
    color: "#111827",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#6B7280",
    marginTop: 16,
    fontSize: 16,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  unauthorizedEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  unauthorizedText: {
    color: "#6B7280",
    fontSize: 18,
  },
});
