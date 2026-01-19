import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { BookOpen } from "lucide-react-native";

interface Group {
  _id: string;
  name: string;
  currentStudents?: number;
}

interface GroupsListProps {
  groups: Group[];
  onGroupSelect: (groupId: string, groupName: string) => void;
}

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  onGroupSelect,
}) => {
  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity
      onPress={() => onGroupSelect(item._id, item.name)}
      activeOpacity={0.7}
      style={styles.groupCard}
    >
      <View style={styles.groupCardContent}>
        <View style={styles.groupCardLeft}>
          <View style={styles.groupIconContainer}>
            <BookOpen size={32} color="#FFFFFF" />
          </View>
          <View style={styles.groupTextContainer}>
            <Text style={styles.groupName}>{item.name}</Text>
            <View style={styles.groupStudentsBadge}>
              <Text style={styles.groupStudentsEmoji}>👥</Text>
              <Text style={styles.groupStudentsText}>
                {item.currentStudents || 0} طالب
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.groupArrow}>
          <Text style={styles.groupArrowText}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📚</Text>
        <Text style={styles.emptyText}>لا توجد حلقات</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groups}
      renderItem={renderGroup}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#A7F3D0",
  },
  groupCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  groupIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupTextContainer: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  groupStudentsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
    alignSelf: "flex-start",
  },
  groupStudentsEmoji: {
    fontSize: 18,
  },
  groupStudentsText: {
    color: "#111827",
    fontWeight: "bold",
    fontSize: 16,
  },
  groupArrow: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  groupArrowText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 20,
  },
});
