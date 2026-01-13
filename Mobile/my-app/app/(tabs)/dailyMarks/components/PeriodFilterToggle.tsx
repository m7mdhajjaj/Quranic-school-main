import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface PeriodFilterToggleProps {
  selectedMode?: "week" | "all";
  onModeChange?: (mode: "week" | "all") => void;
}

export const PeriodFilterToggle: React.FC<PeriodFilterToggleProps> = ({
  selectedMode = "all",
  onModeChange,
}) => {
  if (!onModeChange) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onModeChange("all")}
        style={[styles.button, selectedMode !== "week" && styles.buttonActive]}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.buttonText,
            selectedMode !== "week" && styles.buttonTextActive,
          ]}>
          الكل
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onModeChange("week")}
        style={[styles.button, selectedMode === "week" && styles.buttonActive]}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.buttonText,
            selectedMode === "week" && styles.buttonTextActive,
          ]}>
          الأسبوع الحالي
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: {
    backgroundColor: "#d1fae5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  buttonTextActive: {
    color: "#065f46",
    fontWeight: "600",
  },
});

export default PeriodFilterToggle;
