/**
 * NextPrayerCard Component - Mobile
 * بطاقة عرض الصلاة القادمة
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui";
import type { NextPrayerCardProps } from "../types";

export const NextPrayerCard: React.FC<NextPrayerCardProps> = ({
  nextPrayer,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title}>⏰ الصلاة القادمة: {nextPrayer.name}</Text>
        <Text style={styles.subtitle}>متبقي: {nextPrayer.timeLeft}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f97316",
    borderWidth: 0,
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
});
