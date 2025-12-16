import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "@/components/ui/Card";

interface AzkarCategoryCardProps {
  icon: string;
  title: string;
  completedCount: number;
  totalCount: number;
  isFullyCompleted: boolean;
  onClick: () => void;
}

export const AzkarCategoryCard: React.FC<AzkarCategoryCardProps> = ({
  icon,
  title,
  completedCount,
  totalCount,
  isFullyCompleted,
  onClick,
}) => {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const cardStyle = isFullyCompleted
    ? StyleSheet.flatten([styles.card, styles.completedCard])
    : styles.card;

  return (
    <TouchableOpacity onPress={onClick} activeOpacity={0.7}>
      <Card style={cardStyle}>
        {/* Completion Badge */}
        {isFullyCompleted && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓ مكتمل</Text>
          </View>
        )}

        {/* Icon */}
        <Text style={styles.icon}>{icon}</Text>

        {/* Title */}
        <Text
          style={{
            ...styles.title,
            ...(isFullyCompleted && styles.titleCompleted),
          }}>
          {title}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                  backgroundColor: isFullyCompleted ? "#10b981" : "#a855f7",
                },
              ]}
            />
          </View>
          <Text
            style={{
              ...styles.progressText,
              ...(isFullyCompleted && styles.progressTextCompleted),
            }}>
            التقدم: {completedCount} / {totalCount}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
    position: "relative",
  },
  completedCard: {
    backgroundColor: "#10b981",
  },
  badge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "bold",
  },
  icon: {
    fontSize: 60,
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#1f2937",
  },
  titleCompleted: {
    color: "#ffffff",
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
  },
  progressTextCompleted: {
    color: "#ffffff",
  },
});
