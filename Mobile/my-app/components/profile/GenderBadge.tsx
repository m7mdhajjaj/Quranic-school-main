// components/profile/GenderBadge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { toArabicGender } from "@/utils/profileHelpers";

interface GenderBadgeProps {
  gender?: string;
}

export const GenderBadge = ({ gender }: GenderBadgeProps) => {
  const arabicGender = toArabicGender(gender);

  const getGenderStyle = () => {
    if (arabicGender === "ذكر") {
      return {
        bg: "#14b8a6",
        icon: "👨",
      };
    } else if (arabicGender === "أنثى") {
      return {
        bg: "#10b981",
        icon: "👩",
      };
    } else {
      return {
        bg: "#64748b",
        icon: "❓",
      };
    }
  };

  const style = getGenderStyle();

  return (
    <View style={[styles.container, { backgroundColor: style.bg }]}>
      <Text style={styles.icon}>{style.icon}</Text>
      <Text style={styles.text}>{arabicGender}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
