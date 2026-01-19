import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Heart,
  Users,
  Clock,
  Smartphone,
  Sparkles,
  ArrowLeft,
  Mic,
  BookMarked,
  GraduationCap,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  // البرامج الثلاثة
  const programs = [
    {
      icon: Mic,
      title: "تلاوة متقنة",
      description: "تعلم أصول التلاوة الصحيحة وفق أحكام التجويد",
    },
    {
      icon: BookMarked,
      title: "حفظ القرآن",
      description: "برامج متخصصة لحفظ القرآن الكريم بمنهجية مدروسة",
    },
    {
      icon: GraduationCap,
      title: "علوم القرآن",
      description: "دراسة تفسير القرآن وعلومه بطرق ميسرة وشاملة",
    },
  ];

  // القيم الستة
  const values = [
    {
      icon: Sparkles,
      title: "التحفيز",
      description: "نؤمن بأن التحفيز وقود الإنجاز فكلما زاد التحفيز زاد الإنجاز بإذن الله تعالى",
    },
    {
      icon: BookOpen,
      title: "العمل",
      description: "العمل بالقرآن غايتنا لنكون على عقيدة نقية على خطى خير البرية ﷺ",
    },
    {
      icon: Heart,
      title: "الدعاء",
      description: "سر نجاح وتميز المؤمن",
    },
    {
      icon: Smartphone,
      title: "التطوير",
      description: "شغف يتجدد ونجاح يتحقق",
    },
    {
      icon: Clock,
      title: "الصبر",
      description: "أساس كل إنجاز",
    },
    {
      icon: Users,
      title: "التعاون",
      description: "به تحقق النجاحات وتكون الإنجازات",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <Link href="/welcome" asChild>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#059669" />
            <Text style={styles.backButtonText}>الترحيب</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.loginButton} activeOpacity={0.7}>
            <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
            <ArrowLeft size={16} color="#ffffff" />
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* البرامج الثلاثة */}
        <View style={styles.programsSection}>
          {programs.map((program, index) => (
            <View key={index} style={styles.programCard}>
              <View style={styles.programIconContainer}>
                <program.icon size={32} color="#059669" />
              </View>
              <Text style={styles.programTitle}>{program.title}</Text>
              <Text style={styles.programDescription}>{program.description}</Text>
            </View>
          ))}
        </View>

        {/* قسم القيم */}
        <View style={styles.valuesSection}>
          <Text style={styles.valuesSectionTitle}>
            قيمنا في أكاديمية ازهار الحمد
          </Text>
          <View style={styles.titleUnderline} />

          <View style={styles.valuesGrid}>
            {values.map((value, index) => (
              <View key={index} style={styles.valueCard}>
                <View style={styles.valueIconContainer}>
                  <value.icon size={28} color="#ffffff" />
                </View>
                <Text style={styles.valueTitle}>{value.title}</Text>
                <Text style={styles.valueDescription}>{value.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>انضم إلينا اليوم</Text>
          <Text style={styles.ctaSubtitle}>
            ابدأ رحلتك في حفظ القرآن الكريم
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.ctaGradient}>
                <Text style={styles.ctaButtonText}>سجل الآن</Text>
                <ArrowLeft size={18} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            جميع الحقوق محفوظة © 2026 أكاديمية ازهار الحمد القرآنية
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#059669",
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // البرامج الثلاثة
  programsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingTop: 24,
    gap: 12,
  },
  programCard: {
    width: (width - 48) / 3,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  programIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  programTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  programDescription: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
  },
  // قسم القيم
  valuesSection: {
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  valuesSectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: "#10b981",
    alignSelf: "center",
    borderRadius: 2,
    marginBottom: 24,
  },
  valuesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  valueCard: {
    width: (width - 44) / 2,
    backgroundColor: "#059669",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    minHeight: 160,
  },
  valueIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  valueDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 18,
  },
  // CTA Section
  ctaSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  // Footer
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f1f5f9",
  },
  footerText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
});
