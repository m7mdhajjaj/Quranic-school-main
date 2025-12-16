import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui";

interface LoginCardProps {
  children: React.ReactNode;
}

export const LoginCard: React.FC<LoginCardProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <Card variant="elevated" padding="lg" style={styles.card}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>تسجيل الدخول</Text>
          <Text style={styles.subtitle}>
            قم بإدخال معلومات الدخول الخاصة بك
          </Text>
          <View style={styles.divider} />
        </View>

        {children}

        {/* Footer - Inside Card */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </Text>
          <Text style={styles.footerSubText}>مدرسة القرآن الكريم</Text>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(167, 243, 208, 0.5)",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#047857",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#d1fae5",
    marginTop: 8,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#d1fae5",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4b5563",
  },
  footerSubText: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },
});
