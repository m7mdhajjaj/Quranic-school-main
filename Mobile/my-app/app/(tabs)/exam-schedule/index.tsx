import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Calendar, ClipboardList, Plus, BookOpen } from "lucide-react-native";
import { useAuth } from "@/Context/AuthContext";
import { useExamData } from "@/hooks/exam/useExamData";
import { useExamActions } from "@/hooks/exam/useExamActions";
import {
  StudentView,
  TeacherView,
  FilterBar,
  ExamFormModal,
  MarksManagement,
} from "@/components/exam";
import {
  Exam,
  ExamFilters,
  StudentExamResult,
  ExamWithMarks,
} from "@/types/exam.types";

export default function ExamScheduleScreen() {
  const { user } = useAuth();
  const role = user?.role || "student";
  const [activePage, setActivePage] = useState<"exams" | "marks">("exams");

  // الفلاتر
  const [filters, setFilters] = useState<ExamFilters>({
    query: "",
    dateFilter: "",
    typeFilter: "",
    marksFilter: "",
  });

  // حالة المودال
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // جلب البيانات
  const { exams, loading, refetch } = useExamData(filters);

  // إجراءات الامتحانات
  const { isSubmitting, handleCreateExam, handleUpdateExam, handleDeleteExam } =
    useExamActions(refetch);

  const handleFiltersChange = (newFilters: Partial<ExamFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleAddExam = () => {
    setEditingExam(null);
    setShowExamModal(true);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setShowExamModal(true);
  };

  const handleDelete = (examId: string) => {
    handleDeleteExam(examId);
  };

  const handleManageMarks = (exam: Exam) => {
    // سيتم تنفيذه لاحقاً
    console.log("Manage marks:", exam);
  };

  const handleSubmitExam = async (data: any) => {
    if (editingExam) {
      await handleUpdateExam(editingExam._id, data);
    } else {
      await handleCreateExam(data);
    }
  };

  // إذا كان المعلم في صفحة إدارة العلامات، نعرض المكون مباشرة
  if (role === "teacher" && activePage === "marks") {
    return (
      <View style={styles.container}>
        {/* Segmented Control */}
        <View style={styles.segmentedControlSticky}>
          <TouchableOpacity
            onPress={() => setActivePage("exams")}
            style={[
              styles.segmentButton,
              activePage === "exams" && styles.segmentButtonActive,
            ]}>
            <Calendar
              size={18}
              color={activePage === "exams" ? "white" : "#374151"}
            />
            <Text
              style={[
                styles.segmentText,
                activePage === "exams" && styles.segmentTextActive,
              ]}>
              الامتحانات
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActivePage("marks")}
            style={[
              styles.segmentButton,
              activePage === "marks" && styles.segmentButtonActive,
            ]}>
            <ClipboardList
              size={18}
              color={activePage === "marks" ? "white" : "#374151"}
            />
            <Text
              style={[
                styles.segmentText,
                activePage === "marks" && styles.segmentTextActive,
              ]}>
              إدارة العلامات
            </Text>
          </TouchableOpacity>
        </View>

        {/* صفحة إدارة العلامات */}
        <MarksManagement />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* العنوان */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.iconContainer}>
                <BookOpen size={24} color="white" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>جدول الامتحانات</Text>
                <Text style={styles.subtitle}>
                  {role === "teacher"
                    ? "إدارة الامتحانات والعلامات"
                    : "متابعة الامتحانات والنتائج"}
                </Text>
              </View>
            </View>
            {/* إحصائيات سريعة */}
            {role === "teacher" && exams.length > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{exams.length}</Text>
                  <Text style={styles.statLabel}>امتحان</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {
                      exams.filter((e: any) => new Date(e.date) > new Date())
                        .length
                    }
                  </Text>
                  <Text style={styles.statLabel}>قادم</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {exams.filter((e: any) => e.marksEntered).length}
                  </Text>
                  <Text style={styles.statLabel}>معلّم</Text>
                </View>
              </View>
            )}
          </View>

          {/* Segmented Control - للمعلمين فقط */}
          {role === "teacher" && (
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                onPress={() => setActivePage("exams")}
                style={[
                  styles.segmentButton,
                  activePage === "exams" && styles.segmentButtonActive,
                ]}>
                <Calendar
                  size={18}
                  color={activePage === "exams" ? "white" : "#374151"}
                />
                <Text
                  style={[
                    styles.segmentText,
                    activePage === "exams" && styles.segmentTextActive,
                  ]}>
                  الامتحانات
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActivePage("marks")}
                style={[
                  styles.segmentButton,
                  activePage === "marks" && styles.segmentButtonActive,
                ]}>
                <ClipboardList
                  size={18}
                  color={activePage === "marks" ? "white" : "#374151"}
                />
                <Text
                  style={[
                    styles.segmentText,
                    activePage === "marks" && styles.segmentTextActive,
                  ]}>
                  إدارة العلامات
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* الفلاتر */}
          {activePage === "exams" && (
            <FilterBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              showMarksFilter={role === "teacher"}
              showAddButton={role === "teacher"}
              onAddExam={handleAddExam}
            />
          )}

          {/* المحتوى */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.loadingText}>جاري التحميل...</Text>
            </View>
          ) : role === "student" ? (
            <StudentView exams={exams as StudentExamResult[]} />
          ) : (
            <TeacherView
              exams={exams as ExamWithMarks[]}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageMarks={handleManageMarks}
            />
          )}
        </View>
      </ScrollView>

      {/* زر الإضافة العائم - للمعلمين فقط */}
      {role === "teacher" && activePage === "exams" && (
        <TouchableOpacity onPress={handleAddExam} style={styles.fab}>
          <Plus size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* مودال إضافة/تعديل الامتحان */}
      <ExamFormModal
        visible={showExamModal}
        onClose={() => {
          setShowExamModal(false);
          setEditingExam(null);
        }}
        onSubmit={handleSubmitExam}
        editingExam={editingExam}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  // Segmented Control Sticky (للعرض فوق MarksManagement)
  segmentedControlSticky: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  // Header
  header: {
    backgroundColor: "#059669",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  // Segmented Control
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d1fae5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: "#059669",
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  segmentTextActive: {
    color: "white",
  },
  // Loading
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  // Coming Soon
  comingSoon: {
    alignItems: "center",
    paddingVertical: 60,
  },
  comingSoonText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    left: 20,
    backgroundColor: "#059669",
    borderRadius: 28,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
