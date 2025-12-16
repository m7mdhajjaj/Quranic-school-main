import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, Modal } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: "emerald" | "blue" | "red" | "amber" | "purple";
  fullScreen?: boolean;
  text?: string;
  showIcon?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color = "emerald",
  fullScreen = false,
  text,
  showIcon = true,
}) => {
  const colors = {
    emerald: "#10b981",
    blue: "#3b82f6",
    red: "#dc2626",
    amber: "#f59e0b",
    purple: "#9333ea",
  };

  const spinner = (
    <View style={styles.spinnerContainer}>
      <View style={styles.relative}>
        {showIcon && (
          <View style={styles.iconContainer}>
            <Text
              style={[
                styles.icon,
                size === "small" ? styles.iconSmall : styles.iconLarge,
              ]}>
              📚
            </Text>
          </View>
        )}
        <ActivityIndicator
          size={size}
          color={colors[color]}
          style={styles.spinner}
        />
      </View>
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <Modal transparent visible={true} animationType="fade">
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenContent}>{spinner}</View>
        </View>
      </Modal>
    );
  }

  return <View style={styles.container}>{spinner}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  spinnerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  relative: {
    position: "relative",
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
  },
  icon: {
    textAlign: "center",
  },
  iconSmall: {
    fontSize: 16,
  },
  iconLarge: {
    fontSize: 24,
  },
  spinner: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  text: {
    marginTop: 24,
    color: "#374151",
    fontSize: 18,
    fontWeight: "600",
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreenContent: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
  },
});
