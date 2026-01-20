import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
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

  const goals = [
    {
      icon: Users,
      title: "بناء جيل صالح",
      description:
        "بناء جيل صالح على منهج أهل السنة والجماعة، يفهم أصول دينه فهمًا صحيحًا.",
    },
    {
      icon: BookOpen,
      title: "إعداد جيل حافظ",
      description:
        "إعداد جيل حافظ متقن لكتاب الله تعالى، يعمل به، ويتقن تلاوته.",
    },
    {
      icon: GraduationCap,
      title: "تأهيل معلمين",
      description: "تأهيل معلمين للقرآن الكريم بأسلوب حضاري وحديث.",
    },
    {
      icon: Heart,
      title: "غرس القيم",
      description: "غرس القيم والأخلاق الإسلامية المستمدة من القرآن الكريم.",
    },
  ];

  // القيم الستة
  const values = [
    {
      icon: Sparkles,
      title: "التحفيز",
      description:
        "نؤمن بأن التحفيز وقود الإنجاز فكلما زاد التحفيز زاد الإنجاز بإذن الله تعالى",
    },
    {
      icon: BookOpen,
      title: "العمل",
      description:
        "العمل بالقرآن غايتنا لنكون على عقيدة نقية على خطى خير البرية ﷺ",
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

  const insets = useSafeAreaInsets();
  const headerTopPadding =
    Platform.OS === "android"
      ? Math.max(insets.top, 44)
      : Math.max(insets.top, 20);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: headerTopPadding }]}>
        <View style={styles.headerLeft}>
          <Link href="/welcome" asChild>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
              <ArrowLeft size={20} color="#059669" />
              <Text style={styles.backButtonText}>الترحيب</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>الرئيسية</Text>
        </View>

        <View style={styles.headerRight}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.loginButton} activeOpacity={0.7}>
              <Text style={styles.loginButtonText}>دخول</Text>
              <ArrowLeft size={16} color="#ffffff" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={["#065f46", "#059669", "#10b981"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}>
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>أهلاً بكم في</Text>
              </View>
              <Text style={styles.heroTitle}>أكاديمية المهاجرين</Text>
              <Text style={styles.heroSubtitle}>
                منصة تعليمية متكاملة لتعلم القرآن الكريم وتحفيظه بمنهجية علمية
                حديثة
              </Text>

              <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={styles.heroButton} activeOpacity={0.9}>
                  <Text style={styles.heroButtonText}>ابـدأ رحلتـك الآن</Text>
                  <ArrowLeft size={18} color="#065f46" />
                </TouchableOpacity>
              </Link>
            </View>

            {/* Pattern/Decoration */}
            <View style={styles.heroDecoration}>
              <BookOpen size={120} color="rgba(255,255,255,0.1)" />
            </View>
          </LinearGradient>
        </View>

        {/* البرامج الثلاثة section title */}
        <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
          <Text style={styles.sectionTitle}>رؤيتنا وبرامجنا</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* البرامج الثلاثة */}
        <View style={styles.programsSection}>
          {programs.map((program, index) => (
            <View key={index} style={styles.programCard}>
              <View style={styles.programIconContainer}>
                <program.icon size={32} color="#059669" />
              </View>
              <Text style={styles.programTitle}>{program.title}</Text>
              <Text style={styles.programDescription}>
                {program.description}
              </Text>
            </View>
          ))}
        </View>

        {/* أهدافنا */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>أهدافنا السامية</Text>
          <Text style={styles.sectionSubtitle}>
            نسعى في مدرسة المهاجرين لتحقيق مجموعة من الأهداف التي تعزز الارتقاء
            بمستوى تعليم القرآن
          </Text>
          <View style={styles.titleUnderline} />

          <View style={styles.goalsGrid}>
            {goals.map((goal, index) => (
              <View key={index} style={styles.goalCard}>
                <View
                  style={[
                    styles.goalIconContainer,
                    {
                      backgroundColor: index % 2 === 0 ? "#d1fae5" : "#e0f2fe",
                    },
                  ]}>
                  <goal.icon
                    size={28}
                    color={index % 2 === 0 ? "#059669" : "#0284c7"}
                  />
                </View>
                <View style={styles.goalTextContainer}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </View>
              </View>
            ))}
          </View>
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
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerTitleContainer: {
    flex: 2,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#059669",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#059669",
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Hero Section
  heroSection: {
    height: 280,
    marginBottom: 10,
    overflow: "hidden",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  heroGradient: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    position: "relative",
  },
  heroContent: {
    zIndex: 10,
    alignItems: "flex-start", // RTL: will be right
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroBadgeText: {
    color: "#ecfdf5",
    fontSize: 13,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#d1fae5",
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: "85%",
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroButtonText: {
    color: "#065f46",
    fontWeight: "bold",
    fontSize: 15,
  },
  heroDecoration: {
    position: "absolute",
    bottom: -20,
    left: -20,
    transform: [{ rotate: "-15deg" }],
    opacity: 0.6,
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
  // الأهداف
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  goalsGrid: {
    marginTop: 16,
    gap: 16,
  },
  goalCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f9ff",
  },
  goalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  goalTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
    textAlign: "auto",
  },
  goalDescription: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
    textAlign: "auto",
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
