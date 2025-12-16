/**
 * PrayerCard Component - Mobile
 * بطاقة عرض وقت الصلاة
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui";
import type { PrayerCardProps } from "../types";
import { useTimeFormat } from "../hooks";

export const PrayerCard: React.FC<PrayerCardProps> = ({ prayer }) => {
  const { convertTo12Hour } = useTimeFormat();
  const formattedTime = convertTo12Hour(prayer.time);

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.icon}>{prayer.icon}</Text>
        <Text style={styles.name}>{prayer.name}</Text>
        <Text style={styles.time}>{formattedTime}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  time: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#059669",
  },
});
