import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type ValueItem = {
  icon: string;
  title: string;
  description: string;
};

const VALUES: ValueItem[] = [
  {
    icon: "⭐",
    title: "التحفيز",
    description:
      "نؤمن بأن التحفيز وجود الإنجاز فكلما زاد التحفيز زاد الإنجاز بإذن الله تعالى",
  },
  {
    icon: "🧑‍🏫",
    title: "العمل",
    description:
      "العمل بالقرآن غايتنا لنكون على عقيدة نقية على خطى خير البرية ﷺ نصر بالقرآن أوطاننا ونسعد به مجتمعاتنا",
  },
  { icon: "🤲", title: "الدعاء", description: "سر نجاح وتميز المؤمن" },
  { icon: "🚀", title: "التطوير", description: "شغف يتجدد وينجاح بتحقيق" },
  { icon: "⏳", title: "الصبر", description: "أساس كل إنجاز" },
  {
    icon: "🤝",
    title: "التعاون",
    description: "به تحقق النجاحات وتكون الإنجازات",
  },
  {
    icon: "🎁",
    title: "العطاء والإحسان",
    description: "ثمرة من ثمرات صحبة القرآن وأجمله وأبسطه الكلمة الطيبة",
  },
  {
    icon: "🌙",
    title: "الحلم",
    description: "بداية كل نجاح ما رأيك أن تحلم الآن بحفظك للقرآن؟",
  },
  { icon: "🔥", title: "الطموح", description: "من دونه لن نصل ولن نواصل!" },
];

const ValuesSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>قيمنا في أكاديمية ازهار الحمد</Text>
        <View style={styles.underline} />
      </View>

      <View style={styles.grid}>
        {VALUES.map((item) => (
          <ValueCard key={item.title} {...item} />
        ))}
      </View>
    </View>
  );
};

type ValueCardProps = ValueItem;

const ValueCard = ({ icon, title, description }: ValueCardProps) => {
  return (
    <LinearGradient colors={["#0d9488", "#047857"]} style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 10,
  },
  underline: {
    width: 96,
    height: 4,
    backgroundColor: "#059669",
    borderRadius: 999,
  },
  grid: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  icon: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default ValuesSection;
