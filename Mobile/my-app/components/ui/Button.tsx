import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Loader2 } from "lucide-react-native";

interface ButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradient?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  gradient = true,
  disabled,
  onPress,
  children,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Container`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={
              variant === "secondary" || variant === "ghost"
                ? "#374151"
                : "#ffffff"
            }
            style={styles.loader}
          />
        )}
        {!loading && leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <Text style={textStyles}>{children}</Text>
        {!loading && rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  // Variants
  primary: {
    backgroundColor: "#10b981",
  },
  secondary: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#d1d5db",
  },
  danger: {
    backgroundColor: "#dc2626",
  },
  success: {
    backgroundColor: "#16a34a",
  },
  warning: {
    backgroundColor: "#f59e0b",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  // Sizes - Container
  xsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mdContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lgContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  xlContainer: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  // Base Text
  baseText: {
    fontWeight: "600",
  },
  // Variant Text
  primaryText: {
    color: "#ffffff",
  },
  secondaryText: {
    color: "#374151",
  },
  dangerText: {
    color: "#ffffff",
  },
  successText: {
    color: "#ffffff",
  },
  warningText: {
    color: "#ffffff",
  },
  ghostText: {
    color: "#374151",
  },
  // Size Text
  xsText: {
    fontSize: 12,
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
  xlText: {
    fontSize: 20,
  },
  // States
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  loader: {
    marginRight: 4,
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
});
