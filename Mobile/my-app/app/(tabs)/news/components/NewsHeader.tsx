import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Newspaper } from "lucide-react-native";

export const NewsHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconGlow} />
        <View style={styles.iconCircle}>
          <Newspaper size={48} color="#ffffff" />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>آخر الأخبار والفعاليات</Text>

      {/* Description */}
      <Text style={styles.description}>
        تابع أحدث أخبار وفعاليات مدرسة المهاجرين لتعليم القرآن الكريم، واطلع على
        الأنشطة والمسابقات القادمة
      </Text>

      {/* Divider */}
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#10b981",
    opacity: 0.3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#059669",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
  },
  divider: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10b981",
    marginTop: 8,
  },
});
