import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface PasswordStrengthIndicatorProps {
  password: string;
  score: number;
  label: string;
  color: string;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, score, label }) => {
  const progressValue = password ? Math.min(score, 100) : 0;
  const displayLabel = password ? label : "لم يتم الإدخال";

  const getStrengthColors = (strength: string) => {
    switch (strength) {
      case "weak":
      case "ضعيفة":
        return {
          bg: "#ef4444",
          text: "#dc2626",
          bgLight: "#fee2e2",
        };
      case "medium":
      case "جيدة":
        return {
          bg: "#f59e0b",
          text: "#d97706",
          bgLight: "#fef3c7",
        };
      case "strong":
      case "ممتازة":
        return {
          bg: "#10b981",
          text: "#059669",
          bgLight: "#d1fae5",
        };
      default:
        return {
          bg: "#d1d5db",
          text: "#6b7280",
          bgLight: "#f9fafb",
        };
    }
  };

  const colors = getStrengthColors(label);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>قوة كلمة المرور:</Text>
        <Text
          style={[styles.label, { color: password ? colors.text : "#9ca3af" }]}>
          {displayLabel}
        </Text>
      </View>

      <View
        style={[styles.progressContainer, { backgroundColor: colors.bgLight }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progressValue}%`,
              backgroundColor: colors.bg,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "right",
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
});
