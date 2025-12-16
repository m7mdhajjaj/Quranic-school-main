/**
 * DateCard Component - Mobile
 * بطاقة عرض التاريخ الميلادي والهجري
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui";
import type { DateCardProps } from "../types";

export const DateCard: React.FC<DateCardProps> = ({
  currentDate,
  hijriDate,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.label}>التاريخ الميلادي</Text>
        <Text style={styles.dateText}>{currentDate}</Text>
        <Text style={[styles.label, styles.labelSpacing]}>التاريخ الهجري</Text>
        <Text style={styles.dateText}>{hijriDate}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#059669",
    borderWidth: 0,
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  labelSpacing: {
    marginTop: 16,
  },
  dateText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
