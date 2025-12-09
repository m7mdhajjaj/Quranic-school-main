import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatsCardProps {
  points?: number;
  attendance?: number;
  quranParts?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  points = 0,
  attendance = 0,
  quranParts = 0,
}) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{points}</Text>
        <Text style={styles.statLabel}>النقاط</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{attendance}</Text>
        <Text style={styles.statLabel}>الحضور</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{quranParts}</Text>
        <Text style={styles.statLabel}>الأجزاء</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b981",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
  },
});
