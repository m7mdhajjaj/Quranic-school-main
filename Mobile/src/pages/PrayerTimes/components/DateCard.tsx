import React from "react";
import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import type { DateCardProps } from "../Types/types";

const DateCard = ({ currentDate, hijriDate }: DateCardProps) => {
  return (
    <LinearGradient colors={["#059669", "#0d9488"]} style={styles.root}>
      <Text style={styles.label}>التاريخ الميلادي</Text>
      <Text style={styles.value}>{currentDate}</Text>
      <Text style={styles.label}>التاريخ الهجري</Text>
      <Text style={styles.value}>{hijriDate}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  value: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
  },
});

export default DateCard;
