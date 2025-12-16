import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "outlined" | "elevated" | "gradient";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  style,
  onPress,
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[`${padding}Padding`],
    hover && styles.hover,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
  },
  // Variants
  default: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  outlined: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  elevated: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  gradient: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  // Padding
  nonePadding: {
    padding: 0,
  },
  smPadding: {
    padding: 16,
  },
  mdPadding: {
    padding: 24,
  },
  lgPadding: {
    padding: 32,
  },
  xlPadding: {
    padding: 48,
  },
  // Hover effect (for touchable)
  hover: {
    transform: [{ scale: 1 }],
  },
});
