import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { PasswordStrengthResult } from "../../types/forgotPassword.types";

interface PasswordStrengthIndicatorProps {
  password: string;
  score: number;
  label: string;
  color: string;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, score, label, color }) => {
  const getBarWidth = () => {
    if (!password) return "0%";
    return `${(score / 4) * 100}%`;
  };

  if (!password) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            {
              width: getBarWidth(),
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barContainer: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.3s ease",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
});
