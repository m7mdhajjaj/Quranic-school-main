import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import {
  Users,
  BookOpen,
  GraduationCap,
  Heart,
  Clock,
  UserPlus,
  MessageCircle,
  Target,
} from "lucide-react-native";

const Goals = () => {
  const mainGoals = [
    {
      id: 1,
      icon: Users,
      bgColor: "#059669",
      title: "بناء جيل صالح",
      description:
        "بناء جيل صالح على منهج أهل السنة والجماعة، يفهم أصول دينه فهمًا صحيحًا مقرونًا بالأدلة الشرعية من الكتاب والسنة.",
    },
    {
      id: 2,
      icon: BookOpen,
      bgColor: "#0f766e",
      title: "إعداد جيل حافظ",
      description:
        "إعداد جيل حافظ متقن لكتاب الله تعالى، يعمل به، ويتقن تلاوته، ويعي تفسيره ومعانيه.",
    },
    {
      id: 3,
      icon: GraduationCap,
      bgColor: "#047857",
      title: "تأهيل معلمين",
      description:
        "تأهيل معلمين للقرآن الكريم بأسلوب حضاري وحديث، يتميزون بروح الشباب والقدرة على التأثير والتجديد.",
    },
    {
      id: 4,
      icon: Heart,
      bgColor: "#115e59",
      title: "غرس القيم",
      description:
        "غرس القيم والأخلاق الإسلامية المستمدة من القرآن الكريم.",
    },
  ];

  const additionalGoals = [
    {
      id: 1,
      icon: Clock,
      title: "ربط الطلاب بالسلف",
      description: "ربط الطلاب بسير السلف الصالح من أهل القرآن وأثرهم في الأمة.",
    },
    {
      id: 2,
      icon: UserPlus,
      title: "إشراك الأسرة",
      description:
        "إشراك الأسرة في متابعة أبنائهم وتعزيز دورها في ترسيخ الحفظ والمتابعة.",
    },
    {
      id: 3,
      icon: MessageCircle,
      title: "تنمية الثقة",
      description:
        "تنمية الثقة بالنفس والقدرة على الإلقاء من خلال مشاركات قرآنية صوتية وتفسيرية.",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <PageHeader
        title="أهـــدافـــنا"
        subtitle="نسعى في مدرسة المهاجرين لتحقيق مجموعة من الأهداف السامية التي تعزز الارتقاء بمستوى تعليم القرآن الكريم وخدمته"
        icon={Target}
      />

      {/* Main Goals Section */}
      <View style={styles.mainGoalsContainer}>
        {mainGoals.map((goal) => (
          <Card key={goal.id} style={styles.goalCard}>
            <View style={styles.goalCardContent}>
              <View style={[styles.iconContainer, { backgroundColor: goal.bgColor }]}>
                <View style={styles.iconCircle}>
                  <goal.icon size={32} color={goal.bgColor} />
                </View>
              </View>
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Additional Goals Section */}
      <View style={styles.additionalGoalsContainer}>
        <Text style={styles.additionalGoalsTitle}>أهدافنا الإضافية</Text>

        <View style={styles.additionalGoalsGrid}>
          {additionalGoals.map((goal) => (
            <Card key={goal.id} style={styles.additionalGoalCard}>
              <View style={styles.additionalIconCircle}>
                <goal.icon size={28} color="#059669" />
              </View>
              <Text style={styles.additionalGoalTitle}>{goal.title}</Text>
              <Text style={styles.additionalGoalDescription}>
                {goal.description}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Quote Section */}
      <Card style={styles.quoteCard}>
        <View style={styles.quoteTopBorder} />
        <Text style={styles.quoteIcon}>"</Text>
        <Text style={styles.quoteText}>
          خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
        </Text>
        <Text style={styles.quoteSource}>- حديث شريف رواه البخاري -</Text>
      </Card>
    </ScrollView>
  );
};

export default Goals;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  mainGoalsContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  goalCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  goalCardContent: {
    flexDirection: "column",
  },
  iconContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  goalTextContainer: {
    padding: 20,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "right",
  },
  goalDescription: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
    textAlign: "right",
  },
  additionalGoalsContainer: {
    backgroundColor: "#0d9488",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  additionalGoalsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
  },
  additionalGoalsGrid: {
    gap: 16,
  },
  additionalGoalCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 0,
  },
  additionalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  additionalGoalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  additionalGoalDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  quoteCard: {
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    paddingTop: 8,
  },
  quoteTopBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#059669",
  },
  quoteIcon: {
    fontSize: 48,
    color: "#d1fae5",
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 18,
    color: "#334155",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
    lineHeight: 28,
  },
  quoteSource: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
});
