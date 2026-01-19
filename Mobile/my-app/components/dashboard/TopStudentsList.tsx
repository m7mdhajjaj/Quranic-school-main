import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Medal, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { TopStudent } from "@/Api/dashboardApi";
import { Avatar } from "@/components/Avatar/Avatar";

interface TopStudentsListProps {
  students: TopStudent[];
  loading?: boolean;
}

const getMedalColor = (index: number): string => {
  const colors = [
    "#FCD34D", // ذهبي
    "#9CA3AF", // فضي
    "#F97316", // برونزي
    "#10B981", // أخضر
    "#3B82F6", // أزرق
  ];
  return colors[index] || "#6B7280";
};

// مكون منفصل لعرض كل طالب
const StudentCard: React.FC<{ student: TopStudent; index: number }> = ({
  student,
  index,
}) => {
  const studentName = student.name || "غير معروف";
  const medalColor = getMedalColor(index);

  return (
    <View style={styles.studentCard}>
      <LinearGradient
        colors={["#FFFFFF", "#F9FAFB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}>
        {/* Medal */}
        <View style={styles.medalContainer}>
          <Medal size={32} color={medalColor} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            user={{
              _id: student._id || "",
              firstName: studentName.split(" ")[0] || studentName,
              name: studentName,
              role: "student",
              avatar: student.avatar,
            }}
            userId={student._id}
            userRole="student"
            size="lg"
            showStatus={true}
            statusSize="sm"
          />
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.studentName} numberOfLines={1}>
            {studentName}
          </Text>
          <Text style={styles.rankText}>المرتبة {index + 1}</Text>
          {student.group && (
            <Text style={styles.groupText} numberOfLines={1}>
              {student.group}
            </Text>
          )}
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <LinearGradient
            colors={["#10B981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreBadge}>
            <Star size={16} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.scoreText}>{student.totalMarks || 0}</Text>
          </LinearGradient>
          {student.averageMark !== undefined &&
            student.averageMark !== null && (
              <Text style={styles.averageText}>
                متوسط: {student.averageMark.toFixed(1)}
              </Text>
            )}
        </View>
      </LinearGradient>
    </View>
  );
};

export const TopStudentsList: React.FC<TopStudentsListProps> = ({
  students,
  loading = false,
}) => {
  // تصفية البيانات مبكراً للتأكد من عدم وجود عناصر فارغة
  const validStudents = React.useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    return students
      .filter((s) => s && s._id && typeof s._id === "string")
      .slice(0, 5);
  }, [students]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>أفضل 5 طلاب</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  if (validStudents.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>أفضل 5 طلاب</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>لا توجد بيانات</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Medal size={24} color="#FCD34D" />
        <Text style={styles.title}>أفضل 5 طلاب</Text>
      </View>
      <View style={styles.listContent}>
        {validStudents.map((student, index) => (
          <StudentCard key={student._id} student={student} index={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  listContent: {
    gap: 12,
  },
  studentCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  medalContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 4,
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  rankText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  groupText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  scoreContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  averageText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
});
