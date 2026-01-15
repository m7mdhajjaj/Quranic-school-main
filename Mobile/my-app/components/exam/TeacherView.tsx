import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import {
  Calendar,
  BookOpen,
  Edit,
  Trash2,
  Users,
  Award,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { ExamWithMarks, Exam } from "@/types/exam.types";

interface TeacherViewProps {
  exams: ExamWithMarks[];
  onEdit: (exam: Exam) => void;
  onDelete: (examId: string) => void;
  onManageMarks: (exam: Exam) => void;
}

interface ExamGroup {
  date: string;
  dateFormatted: string;
  exams: ExamWithMarks[];
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  exams,
  onEdit,
  onDelete,
  onManageMarks,
}) => {
  // تجميع الامتحانات حسب التاريخ
  const groupedExams = useMemo(() => {
    const groups: Record<string, ExamGroup> = {};

    exams.forEach((exam) => {
      const dateKey = new Date(exam.date).toISOString().split("T")[0];

      if (!groups[dateKey]) {
        const date = new Date(exam.date);
        groups[dateKey] = {
          date: dateKey,
          dateFormatted: new Intl.DateTimeFormat("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(date),
          exams: [],
        };
      }

      groups[dateKey].exams.push(exam);
    });

    // ترتيب حسب التاريخ (الأحدث أولاً)
    return Object.values(groups).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [exams]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const handleDelete = (examId: string, examName: string) => {
    Alert.alert(
      "تأكيد الحذف",
      `هل أنت متأكد من حذف الامتحان "${examName}"؟\n\nسيتم حذف جميع العلامات المرتبطة!`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => onDelete(examId),
        },
      ]
    );
  };

  const isExamPast = (date: string) => new Date(date) < new Date();

  const renderExamCard = (exam: ExamWithMarks) => {
    const isPast = isExamPast(exam.date);
    // استخدام type أو examType (للتوافق مع الباك إند)
    const examType = exam.type || exam.examType || "شفهي";
    const isWritten = examType === "تحريري" || examType === "كتابي";

    return (
      <View key={exam._id} style={styles.examCard}>
        {/* شريط علوي ملون */}
        <View
          style={[
            styles.cardTopBar,
            isWritten ? styles.writtenBar : styles.oralBar,
          ]}
        />

        {/* المحتوى */}
        <View style={styles.cardContent}>
          {/* الصف الأول: الاسم والنوع */}
          <View style={styles.cardHeader}>
            <View style={styles.examInfo}>
              <Text style={styles.examName} numberOfLines={1}>
                {exam.name}
              </Text>
              <View style={styles.subjectRow}>
                <BookOpen size={14} color="#6b7280" />
                <Text style={styles.subjectText}>{exam.subject}</Text>
              </View>
            </View>
            <View
              style={[
                styles.typeBadge,
                isWritten ? styles.writtenBadge : styles.oralBadge,
              ]}>
              <Text
                style={[
                  styles.typeText,
                  isWritten ? styles.writtenText : styles.oralText,
                ]}>
                {examType}
              </Text>
            </View>
          </View>

          {/* الإحصائيات */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Clock size={14} color="#059669" />
              <Text style={styles.statText}>{formatTime(exam.date)}</Text>
            </View>
            <View style={styles.statItem}>
              <Award size={14} color="#059669" />
              <Text style={styles.statText}>{exam.totalMarks} درجة</Text>
            </View>
            {exam.totalStudents !== undefined && (
              <View style={styles.statItem}>
                <Users size={14} color="#059669" />
                <Text style={styles.statText}>{exam.totalStudents} طالب</Text>
              </View>
            )}
            {exam.averageMark !== undefined && (
              <View style={[styles.statItem, styles.avgStat]}>
                <BarChart3 size={14} color="#0d9488" />
                <Text style={styles.avgText}>
                  {exam.averageMark.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* حالة العلامات */}
          {isPast && (
            <View
              style={[
                styles.statusRow,
                exam.marksEntered ? styles.statusEntered : styles.statusPending,
              ]}>
              {exam.marksEntered ? (
                <>
                  <CheckCircle size={16} color="#059669" />
                  <Text style={styles.statusTextEntered}>
                    تم إدخال العلامات
                  </Text>
                </>
              ) : (
                <>
                  <AlertCircle size={16} color="#d97706" />
                  <Text style={styles.statusTextPending}>
                    لم يتم إدخال العلامات
                  </Text>
                </>
              )}
            </View>
          )}

          {/* الحلقات */}
          {exam.groups && exam.groups.length > 0 && (
            <View style={styles.groupsRow}>
              {exam.groups.map((group, idx) => (
                <View key={idx} style={styles.groupChip}>
                  <Text style={styles.groupText}>{group}</Text>
                </View>
              ))}
            </View>
          )}

          {/* أزرار الإجراءات */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => onEdit(exam)}
              style={styles.editButton}>
              <Edit size={18} color="white" />
              <Text style={styles.editButtonText}>تعديل</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDelete(exam._id, exam.name)}
              style={styles.deleteButton}>
              <Trash2 size={18} color="white" />
              <Text style={styles.deleteButtonText}>حذف</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (exams.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Calendar size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>لا توجد امتحانات</Text>
        <Text style={styles.emptyDesc}>استخدم زر + لإضافة امتحان جديد</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {groupedExams.map((group) => (
        <View key={group.date} style={styles.dateGroup}>
          {/* رأس المجموعة - التاريخ */}
          <View style={styles.dateHeader}>
            <View style={styles.dateIconContainer}>
              <Calendar size={20} color="white" />
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>{group.dateFormatted}</Text>
              <Text style={styles.examCount}>
                {group.exams.length}{" "}
                {group.exams.length === 1 ? "امتحان" : "امتحانات"}
              </Text>
            </View>
          </View>

          {/* قائمة الامتحانات */}
          <View style={styles.examsList}>
            {group.exams.map(renderExamCard)}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  // مجموعة التاريخ
  dateGroup: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  dateHeader: {
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  examCount: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
  examsList: {
    padding: 12,
    gap: 12,
  },
  // بطاقة الامتحان
  examCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTopBar: {
    height: 4,
  },
  writtenBar: {
    backgroundColor: "#3b82f6",
  },
  oralBar: {
    backgroundColor: "#8b5cf6",
  },
  cardContent: {
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  examInfo: {
    flex: 1,
    marginRight: 12,
  },
  examName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subjectText: {
    fontSize: 13,
    color: "#6b7280",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  writtenBadge: {
    backgroundColor: "#dbeafe",
  },
  oralBadge: {
    backgroundColor: "#ede9fe",
  },
  typeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  writtenText: {
    color: "#1d4ed8",
  },
  oralText: {
    color: "#7c3aed",
  },
  // الإحصائيات
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 6,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  avgStat: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  avgText: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "bold",
  },
  // حالة العلامات
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusEntered: {
    backgroundColor: "#d1fae5",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusTextEntered: {
    fontSize: 12,
    fontWeight: "600",
    color: "#047857",
  },
  statusTextPending: {
    fontSize: 12,
    fontWeight: "600",
    color: "#b45309",
  },
  // الحلقات
  groupsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  groupChip: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  groupText: {
    fontSize: 11,
    color: "#047857",
    fontWeight: "500",
  },
  // أزرار الإجراءات
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  // حالة فارغة
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
});
