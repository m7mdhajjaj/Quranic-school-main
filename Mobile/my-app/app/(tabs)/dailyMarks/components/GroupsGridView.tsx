import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Users, BookOpen } from "lucide-react-native";
import { Card } from "@/components/ui/Card";

interface GroupWithStats {
  name: string;
  studentsCount: number;
  sectionsCount: number;
  loading?: boolean;
}

interface GroupsGridViewProps {
  groupsWithStats: GroupWithStats[];
  onGroupSelect: (groupName: string) => void;
  isLoading?: boolean;
}

/**
 * عرض Grid للحلقات مع إحصائياتها
 */
export const GroupsGridView: React.FC<GroupsGridViewProps> = ({
  groupsWithStats,
  onGroupSelect,
  isLoading = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>اختر حلقة</Text>
        <Text style={styles.subtitle}>اختر حلقة لعرض مقاطعها وعلاماتها</Text>
      </View>

      <View style={styles.grid}>
        {groupsWithStats.map((group) => (
          <TouchableOpacity
            key={group.name}
            onPress={() => onGroupSelect(group.name)}
            activeOpacity={0.7}
            style={styles.cardWrapper}>
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                {/* Icon Header */}
                <View style={styles.iconContainer}>
                  <View style={styles.iconBackground}>
                    <Users size={24} color="#ffffff" />
                  </View>
                </View>

                {/* Group Name */}
                <Text style={styles.groupName}>{group.name}</Text>

                {/* Statistics Section */}
                <View style={styles.statsContainer}>
                  {/* Students Count */}
                  <View style={styles.statBox}>
                    <View style={styles.statContent}>
                      <Users size={18} color="#10b981" />
                      <View style={styles.statTextContainer}>
                        <Text style={styles.statLabel}>عدد الطلاب</Text>
                        <Text style={styles.statValue}>
                          {group.studentsCount}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Sections Count */}
                  <View style={[styles.statBox, styles.sectionsStatBox]}>
                    <View style={styles.statContent}>
                      <BookOpen size={18} color="#14b8a6" />
                      <View style={styles.statTextContainer}>
                        <Text style={styles.sectionsStatLabel}>
                          عدد المقاطع
                        </Text>
                        {group.loading || isLoading ? (
                          <ActivityIndicator size="small" color="#14b8a6" />
                        ) : (
                          <Text style={styles.sectionsStatValue}>
                            {group.sectionsCount}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Action Footer */}
                <View style={styles.footer}>
                  <BookOpen size={16} color="#10b981" />
                  <Text style={styles.footerText}>اضغط لعرض المقاطع</Text>
                </View>
              </View>
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
  header: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "right",
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
    marginBottom: 16,
  },
  card: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  cardContent: {
    padding: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "right",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  sectionsStatBox: {
    backgroundColor: "#f0fdfa",
    borderColor: "#ccfbf1",
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#10b981",
    marginBottom: 4,
    textAlign: "right",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
    textAlign: "right",
  },
  sectionsStatLabel: {
    fontSize: 11,
    color: "#14b8a6",
    marginBottom: 4,
    textAlign: "right",
  },
  sectionsStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f766e",
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#d1fae5",
    justifyContent: "flex-end",
  },
  footerText: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "600",
  },
});
