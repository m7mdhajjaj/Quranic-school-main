import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Logo, Badge } from "@/components/ui";
import { Star, BookOpen, BarChart, FileText } from "lucide-react-native";

interface WelcomeSectionProps {
  logoUrl: string | null;
  logoLoading: boolean;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  logoUrl,
  logoLoading,
}) => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Logo
          logoUrl={logoUrl}
          logoLoading={logoLoading}
          size="lg"
          alt="مدرسة القرآن"
          showGlow={true}
        />
      </View>

      {/* Title and Description */}
      <View style={styles.content}>
        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>مدرسة القرآن الكريم</Text>
          <Text style={styles.subtitle}>نظام إدارة الطلاب المتكامل</Text>
        </View>

        {/* Badge */}
        <View style={styles.badgeContainer}>
          <Badge
            variant="primary"
            size="md"
            icon={<Star size={16} color="#065f46" />}
            style={styles.badge}>
            منصة تعليمية متميزة
          </Badge>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <BookOpen size={20} color="#10b981" />
            <Text style={styles.featureText}>إدارة شاملة للطلاب والمعلمين</Text>
          </View>

          <View style={styles.featureItem}>
            <BarChart size={20} color="#10b981" />
            <Text style={styles.featureText}>
              تتبع الحضور والأداء الأكاديمي
            </Text>
          </View>

          <View style={styles.featureItem}>
            <FileText size={20} color="#10b981" />
            <Text style={styles.featureText}>تقارير تفصيلية ومتابعة دقيقة</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  logoContainer: {
    marginBottom: 32,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  titleContainer: {
    gap: 8,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#10b981",
    textAlign: "center",
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    color: "#047857",
    fontWeight: "600",
    textAlign: "center",
  },
  badgeContainer: {
    alignItems: "center",
    paddingTop: 8,
  },
  badge: {
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  divider: {
    width: 64,
    height: 4,
    backgroundColor: "#10b981",
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 16,
  },
  featuresList: {
    gap: 16,
    paddingTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
});
