/**
 * شبكة الحلقات للمعلم
 * يعرض قائمة الحلقات مع عدد الطلاب في كل حلقة
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Users, ChevronLeft } from "lucide-react-native";
import { Card } from "@/components/ui/Card";

interface TeacherGroup {
  _id: string;
  name: string;
  status?: string;
  totalStudents?: number;
}

interface GroupsGridProps {
  groups: TeacherGroup[];
  onSelectGroup: (group: TeacherGroup) => void;
  isLoading?: boolean;
}

export const GroupsGrid: React.FC<GroupsGridProps> = ({
  groups,
  onSelectGroup,
  isLoading = false,
}) => {
  // فلترة الحلقات النشطة فقط
  const activeGroups = groups.filter((g) => g.status === "active" || !g.status);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل الحلقات...</Text>
      </View>
    );
  }

  if (activeGroups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Users size={40} color="#9ca3af" />
        </View>
        <Text style={styles.emptyTitle}>لا توجد حلقات نشطة</Text>
        <Text style={styles.emptySubtitle}>
          لم يتم العثور على حلقات نشطة مرتبطة بحسابك
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>اختر الحلقة لتسجيل الحضور</Text>
        <Text style={styles.subtitle}>اضغط على الحلقة للبدء بتسجيل الحضور</Text>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {activeGroups.map((group) => (
          <TouchableOpacity
            key={group._id}
            onPress={() => onSelectGroup(group)}
            activeOpacity={0.7}
            style={styles.cardWrapper}>
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                {/* Icon & Badge */}
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Users size={24} color="#ffffff" />
                  </View>
                  <View style={styles.actionHint}>
                    <Text style={styles.actionHintText}>تسجيل</Text>
                    <ChevronLeft size={16} color="#10b981" />
                  </View>
                </View>

                {/* Group Name */}
                <Text style={styles.groupName}>{group.name}</Text>

                {/* Students Count */}
                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.statText}>
                      {group.totalStudents || 0} طالب
                    </Text>
                  </View>
                </View>
              </View>

              {/* Accent Border */}
              <View style={styles.accentBorder} />
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right",
  },
  grid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  cardWrapper: {
    marginBottom: 4,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionHintText: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "600",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  statText: {
    fontSize: 13,
    color: "#16a34a",
    fontWeight: "600",
  },
  accentBorder: {
    height: 4,
    backgroundColor: "#10b981",
  },
});
