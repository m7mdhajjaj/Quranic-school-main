import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui";
import { BookOpen, ClipboardList, Building } from "lucide-react-native";

export const VisionSection: React.FC = () => {
  const visionItems = [
    {
      icon: <BookOpen size={32} color="#10b981" />,
      title: "تلاوة متقنة",
      description: "تعلم أصول التلاوة الصحيحة وفق أحكام التجويد",
    },
    {
      icon: <ClipboardList size={32} color="#10b981" />,
      title: "حفظ القرآن",
      description: "برامج متخصصة لحفظ القرآن الكريم بمنهجية مدروسة",
    },
    {
      icon: <Building size={32} color="#10b981" />,
      title: "علوم القرآن",
      description: "دراسة تفسير القرآن وعلومه بطرق ميسرة وشاملة",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>رؤيتنا في تعليم القرآن الكريم</Text>
      </View>

      <View style={styles.grid}>
        {visionItems.map((item, index) => (
          <Card key={index} variant="elevated" padding="lg" style={styles.card}>
            <View style={styles.iconContainer}>{item.icon}</View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginBottom: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
  },
  grid: {
    gap: 16,
  },
  card: {
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#d1fae5",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
});
