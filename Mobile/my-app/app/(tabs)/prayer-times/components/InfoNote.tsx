/**
 * InfoNote Component - Mobile
 * ملاحظة معلوماتية
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui";

export const InfoNote: React.FC = () => {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.icon}>ℹ️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>ملاحظة</Text>
          <Text style={styles.description}>
            المواقيت المعروضة خاصة بمدينة نابلس، فلسطين. يتم تحديث المواقيت
            تلقائياً كل يوم.
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#dbeafe",
    borderRightWidth: 4,
    borderRightColor: "#3b82f6",
    borderWidth: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 20,
  },
});
