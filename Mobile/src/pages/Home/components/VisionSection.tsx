import React from "react";
import { StyleSheet, Text, View } from "react-native";

const VisionSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>رؤيتنا في تعليم القرآن الكريم</Text>

      <View style={styles.cards}>
        <VisionCard
          icon="📖"
          title="تلاوة متقنة"
          description="تعلم أصول التلاوة الصحيحة وفق أحكام التجويد"
        />
        <VisionCard
          icon="📝"
          title="حفظ القرآن"
          description="برامج متخصصة لحفظ القرآن الكريم بمنهجية مدروسة"
        />
        <VisionCard
          icon="🏫"
          title="علوم القرآن"
          description="دراسة تفسير القرآن وعلومه بطرق ميسرة وشاملة"
        />
      </View>
    </View>
  );
};

type VisionCardProps = {
  icon: string;
  title: string;
  description: string;
};

const VisionCard = ({ icon, title, description }: VisionCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 14,
  },
  cards: {
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  icon: {
    fontSize: 26,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 19,
  },
});

export default VisionSection;
