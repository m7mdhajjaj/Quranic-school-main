import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const WelcomeSection: React.FC = () => {
  return (
    <View style={styles.welcomeSection}>
      {/* Logo */}
      <View style={styles.logoWrapper}>
        <LinearGradient
          colors={["#10b981", "#14b8a6", "#06b6d4"]}
          style={styles.logoGradient}>
          <Text style={styles.logoEmoji}>📖</Text>
        </LinearGradient>
        <View style={styles.logoGlow} />
      </View>

      {/* Title */}
      <Text style={styles.mainTitle}>مدرسة القرآن الكريم</Text>
      <Text style={styles.subTitle}>نظام إدارة الطلاب المتكامل</Text>

      {/* Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeIcon}>⭐</Text>
        <Text style={styles.badgeText}>منصة تعليمية متميزة</Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text>📚</Text>
          </View>
          <Text style={styles.featureText}>إدارة شاملة للطلاب والمعلمين</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text>📊</Text>
          </View>
          <Text style={styles.featureText}>تتبع الحضور والأداء الأكاديمي</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text>📋</Text>
          </View>
          <Text style={styles.featureText}>تقارير تفصيلية ومتابعة دقيقة</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 40,
  },
  logoGlow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    top: -10,
    left: -10,
    zIndex: -1,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#059669",
    textAlign: "center",
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    color: "#0d9488",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdfa",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#99f6e4",
    marginBottom: 20,
  },
  badgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    color: "#0f766e",
    fontWeight: "600",
  },
  featuresContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "flex-end",
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
});
