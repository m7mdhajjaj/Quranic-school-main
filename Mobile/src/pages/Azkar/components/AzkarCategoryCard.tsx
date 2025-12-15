import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AzkarCategoryCardProps } from "../Types/types";

const AzkarCategoryCard: React.FC<AzkarCategoryCardProps> = ({
  icon,
  title,
  completedCount,
  totalCount,
  isFullyCompleted,
  onPress,
}) => {
  const progressPercent = useMemo(() => {
    if (!totalCount) return 0;
    return Math.round((completedCount / totalCount) * 100);
  }, [completedCount, totalCount]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isFullyCompleted && styles.cardCompleted,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button">
      {isFullyCompleted && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ مكتمل</Text>
        </View>
      )}

      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, isFullyCompleted && styles.titleCompleted]}>
        {title}
      </Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(100, Math.max(0, progressPercent))}%` },
            isFullyCompleted && styles.progressFillCompleted,
          ]}
        />
      </View>

      <Text
        style={[
          styles.progressText,
          isFullyCompleted && styles.progressTextCompleted,
        ]}>
        التقدم: {completedCount} / {totalCount}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    position: "relative",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "#d1fae5",
    alignItems: "center",
    gap: 8,
  },
  cardCompleted: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  pressed: {
    opacity: 0.92,
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  badgeText: {
    color: "#047857",
    fontSize: 11,
    fontWeight: "900",
  },
  icon: {
    fontSize: 36,
  },
  title: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  titleCompleted: {
    color: "#ffffff",
  },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#d1fae5",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
  },
  progressFillCompleted: {
    backgroundColor: "#ffffff",
  },
  progressText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  progressTextCompleted: {
    color: "#ffffff",
  },
});

export default AzkarCategoryCard;
