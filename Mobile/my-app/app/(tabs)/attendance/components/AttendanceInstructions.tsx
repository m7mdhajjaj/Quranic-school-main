/**
 * تعليمات التسجيل
 * يعرض التعليمات السريعة لاستخدام صفحة الحضور
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Info } from "lucide-react-native";
import { Card } from "@/components/ui/Card";

export const AttendanceInstructions: React.FC = () => {
  const instructions = [
    "انقر على صفّ الطالب لقلب حالته (حاضر/غائب).",
    "خانة التحديد العلوية لاختيار الكل بسرعة.",
    'اضغط "حفظ السجل" لحفظ التغييرات.',
    "سيتم تحذيرك عند وجود تغييرات غير محفوظة قبل الخروج.",
    "استخدم البحث لتسريع العمل.",
  ];

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Info size={18} color="#f59e0b" />
        <Text style={styles.title}>تعليمات</Text>
      </View>
      <View style={styles.listContainer}>
        {instructions.map((instruction, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.itemText}>{instruction}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d1d5db",
    marginTop: 6,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 20,
    textAlign: "right",
  },
});
