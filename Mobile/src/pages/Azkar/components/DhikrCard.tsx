import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DhikrCardProps } from "../Types/types";

const DhikrCard: React.FC<DhikrCardProps> = ({
  text,
  count,
  originalCount,
  isCompleted,
  onPress,
}) => {
  const progressPercent = useMemo(() => {
    if (!originalCount) return 0;
    const done = originalCount - count;
    return Math.round((done / originalCount) * 100);
  }, [originalCount, count]);

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <Text style={[styles.text, isCompleted && styles.textCompleted]}>
        {text}
      </Text>

      <View style={styles.center}>
        <Pressable
          onPress={onPress}
          disabled={isCompleted}
          style={({ pressed }) => [
            styles.countBtn,
            isCompleted ? styles.countBtnCompleted : styles.countBtnActive,
            pressed && !isCompleted && styles.pressed,
          ]}
          accessibilityRole="button">
          {isCompleted ? (
            <Text style={styles.countBtnTextCompleted}>تم الإكمال ✓</Text>
          ) : (
            <Text style={styles.countBtnTextActive}>{count} 🤲</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(100, Math.max(0, progressPercent))}%` },
            isCompleted && styles.progressFillCompleted,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#d1fae5",
    gap: 12,
  },
  cardCompleted: {
    backgroundColor: "#ecfeff",
    borderColor: "#a7f3d0",
  },
  text: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "right",
  },
  textCompleted: {
    color: "#047857",
  },
  center: {
    alignItems: "center",
  },
  countBtn: {
    minWidth: 150,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  countBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  countBtnCompleted: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  pressed: {
    opacity: 0.9,
  },
  countBtnTextActive: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  countBtnTextCompleted: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
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
    backgroundColor: "#059669",
  },
});

export default DhikrCard;
