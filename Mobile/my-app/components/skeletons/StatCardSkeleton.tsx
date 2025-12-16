import React from "react";
import { View, StyleSheet } from "react-native";

export const StatCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.icon} />
      </View>

      <View style={styles.content}>
        <View style={styles.title} />
        <View style={styles.value} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    marginBottom: 12,
  },
  icon: {
    width: 56,
    height: 56,
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
  },
  content: {
    gap: 8,
  },
  title: {
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: 96,
  },
  value: {
    height: 36,
    backgroundColor: "#d1d5db",
    borderRadius: 4,
    width: 80,
  },
});

export default StatCardSkeleton;
