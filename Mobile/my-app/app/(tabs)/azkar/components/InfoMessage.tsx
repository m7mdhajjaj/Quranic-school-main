import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui/Card";

export const InfoMessage: React.FC = () => {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.icon}>📿</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>أذكار مختصرة للطلاب</Text>
          <Text style={styles.description}>
            هذه مجموعة مختارة من الأذكار بأعداد مناسبة لتسهيل الالتزام بها
            يومياً. نسأل الله أن يعيننا وإياكم على ذكره وشكره وحسن عبادته 🤲
          </Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>✨</Text>
            <Text style={styles.footerText}>
              اجعل الأذكار عادة يومية تنير قلبك وتحصّن نفسك
            </Text>
            <Text style={styles.footerText}>✨</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
    borderWidth: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  icon: {
    fontSize: 40,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 8,
    textAlign: "right",
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    textAlign: "right",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
});
