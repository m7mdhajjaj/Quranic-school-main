import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "gray";
  size?: "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "full";
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  rounded = "full",
  icon,
  style,
}) => {
  const badgeStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    styles[`${rounded}Rounded`],
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <View style={badgeStyles}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={textStyles}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
  },
  // Variants
  primary: {
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  success: {
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  warning: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
  },
  danger: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  info: {
    backgroundColor: "#dbeafe",
    borderColor: "#bfdbfe",
  },
  gray: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  },
  // Text variants
  baseText: {
    fontWeight: "500",
  },
  primaryText: {
    color: "#065f46",
  },
  successText: {
    color: "#065f46",
  },
  warningText: {
    color: "#78350f",
  },
  dangerText: {
    color: "#991b1b",
  },
  infoText: {
    color: "#1e40af",
  },
  grayText: {
    color: "#1f2937",
  },
  // Sizes
  smSize: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  mdSize: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  lgSize: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  smText: {
    fontSize: 12,
  },
  mdText: {
    fontSize: 14,
  },
  lgText: {
    fontSize: 16,
  },
  // Rounded
  smRounded: {
    borderRadius: 4,
  },
  mdRounded: {
    borderRadius: 8,
  },
  fullRounded: {
    borderRadius: 999,
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
});
