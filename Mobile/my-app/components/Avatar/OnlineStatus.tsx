import React from "react";
import { View, StyleSheet } from "react-native";

interface OnlineStatusProps {
  isOnline?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  position?: "absolute" | "relative";
  user?: {
    isActive?: boolean;
    _id?: string;
  };
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({
  isOnline: externalIsOnline,
  size = "md",
  position = "absolute",
  user,
}) => {
  // تحديد الحالة
  const isOnline =
    externalIsOnline !== undefined
      ? externalIsOnline
      : (user?.isActive ?? false);

  const sizeStyles = {
    xs: { width: 8, height: 8, borderWidth: 1.5 },
    sm: { width: 10, height: 10, borderWidth: 2 },
    md: { width: 12, height: 12, borderWidth: 2 },
    lg: { width: 14, height: 14, borderWidth: 2 },
    xl: { width: 16, height: 16, borderWidth: 2.5 },
    "2xl": { width: 20, height: 20, borderWidth: 3 },
    "3xl": { width: 24, height: 24, borderWidth: 3 },
    "4xl": { width: 28, height: 28, borderWidth: 3 },
  };

  const statusStyle = [
    styles.base,
    position === "absolute" ? styles.absolute : styles.relative,
    sizeStyles[size],
    isOnline ? styles.online : styles.offline,
  ];

  return <View style={statusStyle} />;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderColor: "#ffffff",
  },
  absolute: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  relative: {
    position: "relative",
  },
  online: {
    backgroundColor: "#10b981",
  },
  offline: {
    backgroundColor: "#6b7280",
  },
});
