import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui";
import {
  Sliders,
  User,
  Heart,
  Smartphone,
  Clock,
  Users,
  Smile,
  Cake,
  Zap,
} from "lucide-react-native";

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ValueCard: React.FC<ValueCardProps> = ({ icon, title, description }) => {
  return (
    <Card variant="default" padding="lg" style={styles.card}>
      <View style={styles.iconWrapper}>
        <View style={styles.iconContainer}>{icon}</View>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </Card>
  );
};

export const ValuesSection: React.FC = () => {
  const values = [
    {
      icon: <Sliders size={40} color="#0d9488" />,
      title: "التحفيز",
      description:
        "نؤمن بأن التحفيز وجود الإنجاز فكلما زاد التحفيز زاد الإنجاز بإذن الله تعالى",
    },
    {
      icon: <User size={40} color="#0d9488" />,
      title: "العمل",
      description:
        "العمل بالقرآن غايتنا لنكون على عقيدة نقية على خطى خير البرية ﷺ نصر بالقرآن أوطاننا ونسعد به مجتمعاتنا",
    },
    {
      icon: <Heart size={40} color="#0d9488" />,
      title: "الدعاء",
      description: "سر نجاح وتميز المؤمن",
    },
    {
      icon: <Smartphone size={40} color="#0d9488" />,
      title: "التطوير",
      description: "شغف يتجدد وينجاح بتحقيق",
    },
    {
      icon: <Clock size={40} color="#0d9488" />,
      title: "الصبر",
      description: "أساس كل إنجاز",
    },
    {
      icon: <Users size={40} color="#0d9488" />,
      title: "التعاون",
      description: "به تحقق النجاحات وتكون الإنجازات",
    },
    {
      icon: <Smile size={40} color="#0d9488" />,
      title: "العطاء والإحسان",
      description: "ثمرة من ثمرات صحبة القرآن وأجمله وأبسطه الكلمة الطيبة",
    },
    {
      icon: <Cake size={40} color="#0d9488" />,
      title: "الحلم",
      description: "بداية كل نجاح ما رأيك أن تحلم الآن بحفظك للقرآن؟",
    },
    {
      icon: <Zap size={40} color="#0d9488" />,
      title: "الطموح",
      description: "من دونه لن نصل ولن نواصل!",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>قيمنا في أكاديمية ازهار الحمد</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.grid}>
        {values.map((value, index) => (
          <ValueCard
            key={index}
            icon={value.icon}
            title={value.title}
            description={value.description}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 64,
    marginBottom: 40,
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
    marginBottom: 12,
  },
  divider: {
    width: 96,
    height: 4,
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: "#0d9488",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    lineHeight: 20,
  },
});
