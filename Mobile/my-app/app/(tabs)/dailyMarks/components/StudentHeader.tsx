import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StudentHeaderProps {
  sectionsCount: number;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  sectionsCount,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📋</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>علاماتي</Text>
          <Text style={styles.subtitle}>مراجعة أدائك في المقاطع المختلفة</Text>
        </View>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeNumber}>{sectionsCount}</Text>
        <Text style={styles.badgeLabel}>مقطع</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 12,
  },
  icon: {
    fontSize: 32,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
  },
  badgeNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  badgeLabel: {
    fontSize: 12,
    color: "#ffffff",
    marginTop: 2,
  },
});
