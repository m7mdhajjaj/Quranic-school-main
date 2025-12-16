import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/Card";
import { Newspaper, Plus } from "lucide-react-native";

interface NewsEmptyStateProps {
  isTeacherOrAdmin?: boolean;
  onAddNews?: () => void;
}

export const NewsEmptyState: React.FC<NewsEmptyStateProps> = ({
  isTeacherOrAdmin,
  onAddNews,
}) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.iconContainer}>
          <Newspaper size={64} color="#d1d5db" />
        </View>
        <Text style={styles.title}>لا توجد أخبار حالياً</Text>
        <Text style={styles.description}>
          سيتم عرض الأخبار والفعاليات هنا عند إضافتها
        </Text>

        {/* Add News Button for Teachers/Admins */}
        {isTeacherOrAdmin && onAddNews && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddNews}
            activeOpacity={0.8}>
            <Plus size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>إضافة خبر جديد</Text>
          </TouchableOpacity>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  card: {
    alignItems: "center",
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
