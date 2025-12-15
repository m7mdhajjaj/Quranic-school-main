import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { PrayerCardProps } from "../Types/types";
import { useTimeFormat } from "../hooks";

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const { convertTo12Hour } = useTimeFormat();
  const formattedTime = convertTo12Hour(prayer.time);

  return (
    <View style={styles.root}>
      <Text style={styles.icon}>{prayer.icon}</Text>
      <Text style={styles.name}>{prayer.name}</Text>
      <Text style={styles.time}>{formattedTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "#d1fae5",
    alignItems: "center",
  },
  icon: {
    fontSize: 34,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
  },
  time: {
    fontSize: 18,
    fontWeight: "900",
    color: "#059669",
    textAlign: "center",
  },
});

export default PrayerCard;
