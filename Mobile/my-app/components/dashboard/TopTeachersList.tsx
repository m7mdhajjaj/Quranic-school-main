import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import { Star, Users } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { TopTeacher } from "@/Api/dashboardApi";
import Avatar from "@/components/Avatar/Avatar";

interface TopTeachersListProps {
  teachers: TopTeacher[];
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

export const TopTeachersList: React.FC<TopTeachersListProps> = ({
  teachers,
  loading = false,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>أفضل 5 معلمين</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  if (teachers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>أفضل 5 معلمين</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>لا توجد بيانات</Text>
        </View>
      </View>
    );
  }

  const renderTeacher = ({ item, index }: { item: TopTeacher; index: number }) => {
    const medalColor = getMedalColor(index);

    return (
      <View style={styles.teacherCard}>
        <LinearGradient
          colors={["#FFFFFF", "#F9FAFB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Medal */}
          <View style={styles.medalContainer}>
            <Star size={32} color={medalColor} fill={medalColor} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Avatar
              user={{
                _id: item._id,
                firstName: item.name?.split(" ")[0] || item.name,
                name: item.name,
                role: "teacher",
                avatar: item.avatar,
              }}
              userId={item._id}
              userRole="teacher"
              size="lg"
              showStatus={true}
              statusSize="sm"
              autoFetch={true}
            />
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.teacherName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.rankText}>المرتبة {index + 1}</Text>
            {item.studentCount !== undefined && (
              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Users size={12} color="#6B7280" />
                  <Text style={styles.statText}>{item.studentCount} طالب</Text>
                </View>
              </View>
            )}
          </View>

          {/* Score */}
          <View style={styles.scoreContainer}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scoreBadge}
            >
              <Star size={16} color="#FCD34D" fill="#FCD34D" />
              <Text style={styles.scoreText}>{item.totalMarks || 0}</Text>
            </LinearGradient>
            {item.averageMark && (
              <Text style={styles.averageText}>
                متوسط: {item.averageMark.toFixed(1)}
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Star size={24} color="#10B981" fill="#10B981" />
        <Text style={styles.title}>أفضل 5 معلمين</Text>
      </View>
      <FlatList
        data={teachers.slice(0, 5)}
        renderItem={renderTeacher}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
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
  teacherCard: {
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
  teacherName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  rankText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 6,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
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
