import React from "react";
import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import type { NextPrayerCardProps } from "../Types/types";

const NextPrayerCard = ({ nextPrayer }: NextPrayerCardProps) => {
  return (
    <LinearGradient colors={["#0f766e", "#059669"]} style={styles.root}>
      <Text style={styles.title}>⏰ الصلاة القادمة: {nextPrayer.name}</Text>
      <Text style={styles.subtitle}>متبقي: {nextPrayer.timeLeft}</Text>
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
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
  },
});

export default NextPrayerCard;
