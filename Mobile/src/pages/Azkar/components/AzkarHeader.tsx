import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { AzkarHeaderProps } from "../Types/types";

const AzkarHeader: React.FC<AzkarHeaderProps> = ({
  title,
  icon,
  completedCount,
  totalCount,
  onBack,
  onReset,
}) => {
  const confirmReset = () => {
    const message = "سيتم إعادة تعيين جميع الأذكار في هذا القسم";

    if (Platform.OS === "web") {
      const confirmed = window.confirm(message);
      if (!confirmed) return;
      onReset();
      window.alert("تم إعادة تعيين الأذكار بنجاح");
      return;
    }

    Alert.alert("هل أنت متأكد؟", message, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "نعم، إعادة تعيين",
        style: "destructive",
        onPress: () => {
          onReset();
          Alert.alert("تم إعادة التعيين", "تم إعادة تعيين الأذكار بنجاح");
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            التقدم: {completedCount} / {totalCount}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={confirmReset}
          style={({ pressed }) => [
            styles.btn,
            styles.resetBtn,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button">
          <Text style={styles.btnText}>إعادة تعيين</Text>
        </Pressable>

        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.btn,
            styles.backBtn,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button">
          <Text style={styles.backText}>رجوع ←</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "#d1fae5",
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    fontSize: 26,
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  badgeText: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  resetBtn: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "#d1fae5",
  },
  btnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  backText: {
    color: "#047857",
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.9,
  },
});

export default AzkarHeader;
