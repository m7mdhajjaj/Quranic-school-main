import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Heart,
  MessageCircle,
  Target,
  UserPlus,
  Users,
} from "lucide-react-native";

type GoalItem = {
  title: string;
  description: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

type AdditionalGoalItem = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

const MAIN_GOALS: GoalItem[] = [
  {
    title: "بناء جيل صالح",
    description:
      "بناء جيل صالح على منهج أهل السنة والجماعة، يفهم أصول دينه فهمًا صحيحًا مقرونًا بالأدلة الشرعية من الكتاب والسنة.",
    color: "#059669",
    Icon: Users,
  },
  {
    title: "إعداد جيل حافظ",
    description:
      "إعداد جيل حافظ متقن لكتاب الله تعالى، يعمل به، ويتقن تلاوته، ويعي تفسيره ومعانيه.",
    color: "#0f766e",
    Icon: BookOpen,
  },
  {
    title: "تأهيل معلمين",
    description:
      "تأهيل معلمين للقرآن الكريم بأسلوب حضاري وحديث، يتميزون بروح الشباب والقدرة على التأثير والتجديد.",
    color: "#047857",
    Icon: GraduationCap,
  },
  {
    title: "غرس القيم",
    description: "غرس القيم والأخلاق الإسلامية المستمدة من القرآن الكريم.",
    color: "#115e59",
    Icon: Heart,
  },
];

const ADDITIONAL_GOALS: AdditionalGoalItem[] = [
  {
    title: "ربط الطلاب بالسلف",
    description: "ربط الطلاب بسير السلف الصالح من أهل القرآن وأثرهم في الأمة.",
    Icon: Clock,
  },
  {
    title: "إشراك الأسرة",
    description:
      "إشراك الأسرة في متابعة أبنائهم وتعزيز دورها في ترسيخ الحفظ والمتابعة.",
    Icon: UserPlus,
  },
  {
    title: "تنمية الثقة",
    description:
      "تنمية الثقة بالنفس والقدرة على الإلقاء من خلال مشاركات قرآنية صوتية وتفسيرية.",
    Icon: MessageCircle,
  },
];

const Goals = () => {
  return (
    <LinearGradient
      colors={["#f8fafc", "#f9fafb", "#f1f5f9"]}
      style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <LinearGradient
              colors={["#0f766e", "#059669"]}
              style={styles.headerIconGradient}>
              <Target size={30} color="#ffffff" />
            </LinearGradient>
          </View>
          <Text style={styles.headerTitle}>أهـــدافـــنا</Text>
          <Text style={styles.headerSubtitle}>
            نسعى في مدرسة المهاجرين لتحقيق مجموعة من الأهداف السامية التي تعزز
            الارتقاء بمستوى تعليم القرآن الكريم وخدمته
          </Text>
          <View style={styles.headerDivider} />
        </View>

        {/* Main Goals Section */}
        <View style={styles.section}>
          {MAIN_GOALS.map((goal) => {
            const Icon = goal.Icon;
            return (
              <View key={goal.title} style={styles.goalCard}>
                <View
                  style={[styles.goalBand, { backgroundColor: goal.color }]}>
                  <View style={styles.goalIconCircle}>
                    <Icon size={22} color={goal.color} />
                  </View>
                </View>

                <View style={styles.goalBody}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDesc}>{goal.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Additional Goals */}
        <LinearGradient
          colors={["#134e4a", "#065f46"]}
          style={styles.additionalWrap}>
          <Text style={styles.additionalTitle}>أهدافنا الإضافية</Text>

          <View style={styles.additionalGrid}>
            {ADDITIONAL_GOALS.map((goal) => {
              const Icon = goal.Icon;
              return (
                <View key={goal.title} style={styles.additionalCard}>
                  <View style={styles.additionalIconCircle}>
                    <Icon size={20} color="#059669" />
                  </View>
                  <Text style={styles.additionalCardTitle}>{goal.title}</Text>
                  <Text style={styles.additionalCardDesc}>
                    {goal.description}
                  </Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        {/* Quote Section */}
        <View style={styles.quoteCard}>
          <LinearGradient
            colors={["#059669", "#0d9488"]}
            style={styles.quoteTopLine}
          />
          <Text style={styles.quoteMark}>﴿</Text>
          <Text style={styles.quoteText}>
            "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"
          </Text>
          <Text style={styles.quoteSub}>- حديث شريف رواه البخاري -</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 18,
  },

  header: {
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
  },
  headerIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: "hidden",
  },
  headerIconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
  headerDivider: {
    width: 120,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#a7f3d0",
    marginTop: 6,
  },

  section: {
    gap: 12,
  },

  goalCard: {
    flexDirection: "row-reverse",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 16,
    overflow: "hidden",
  },
  goalBand: {
    width: 88,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  goalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  goalBody: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  goalTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
  },
  goalDesc: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    lineHeight: 20,
  },

  additionalWrap: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  additionalTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },
  additionalGrid: {
    gap: 12,
  },
  additionalCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 8,
  },
  additionalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  additionalCardTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  additionalCardDesc: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },

  quoteCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  quoteTopLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  quoteMark: {
    color: "#d1fae5",
    fontSize: 40,
    fontWeight: "900",
    marginBottom: 6,
  },
  quoteText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 10,
  },
  quoteSub: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default Goals;
