import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface LoginCardProps {
  children: React.ReactNode;
}

export const LoginCard: React.FC<LoginCardProps> = ({ children }) => {
  return (
    <View style={styles.cardContainer}>
      {/* Card Glow */}
      <View style={styles.cardGlow} />

      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>تسجيل الدخول</Text>
          <Text style={styles.cardSubtitle}>
            قم بإدخال معلومات الدخول الخاصة بك
          </Text>
          <View style={styles.headerDivider} />
        </View>

        {children}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </Text>
          <Text style={styles.footerSubtext}>مدرسة القرآن الكريم</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    opacity: 0.5,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(167, 243, 208, 0.5)",
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  headerDivider: {
    width: 60,
    height: 3,
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
  cardFooter: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#ecfdf5",
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  footerSubtext: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 4,
  },
});
