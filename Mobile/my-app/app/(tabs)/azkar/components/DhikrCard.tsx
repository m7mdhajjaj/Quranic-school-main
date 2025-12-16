import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "@/components/ui/Card";

interface DhikrCardProps {
  text: string;
  count: number;
  originalCount: number;
  isCompleted: boolean;
  onClick: () => void;
}

export const DhikrCard: React.FC<DhikrCardProps> = ({
  text,
  count,
  originalCount,
  isCompleted,
  onClick,
}) => {
  const progress =
    originalCount > 0 ? ((originalCount - count) / originalCount) * 100 : 0;
  const cardStyle = {
    ...styles.card,
    ...(isCompleted && styles.completedCard),
  };

  return (
    <Card style={cardStyle}>
      {/* Dhikr Text */}
      <View style={styles.textContainer}>
        <Text
          style={{
            ...styles.text,
            ...(isCompleted && styles.textCompleted),
          }}>
          {text}
        </Text>
      </View>

      {/* Counter Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={onClick}
          disabled={isCompleted}
          style={{
            ...styles.button,
            ...(isCompleted && styles.buttonCompleted),
          }}
          activeOpacity={0.7}>
          {isCompleted ? (
            <>
              <Text style={styles.buttonText}>تم الإكمال</Text>
              <Text style={styles.buttonEmoji}>✓</Text>
            </>
          ) : (
            <>
              <Text style={styles.buttonText}>{count}</Text>
              <Text style={styles.buttonEmoji}>🤲</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progress}%`,
              backgroundColor: isCompleted ? "#10b981" : "#3b82f6",
            },
          ]}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
  },
  completedCard: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
    borderWidth: 2,
  },
  textContainer: {
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: "right",
    color: "#1f2937",
  },
  textCompleted: {
    color: "#065f46",
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 160,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonCompleted: {
    backgroundColor: "#10b981",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonEmoji: {
    fontSize: 24,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});
