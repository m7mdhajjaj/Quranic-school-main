import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { ArrowLeft, RotateCcw } from "lucide-react-native";

interface AzkarHeaderProps {
  title: string;
  icon: string;
  completedCount: number;
  totalCount: number;
  onBack: () => void;
  onReset: () => void;
}

export const AzkarHeader: React.FC<AzkarHeaderProps> = ({
  title,
  icon,
  completedCount,
  totalCount,
  onBack,
  onReset,
}) => {
  const handleReset = () => {
    Alert.alert("هل أنت متأكد؟", "سيتم إعادة تعيين جميع الأذكار في هذا القسم", [
      {
        text: "إلغاء",
        style: "cancel",
      },
      {
        text: "نعم، إعادة تعيين",
        onPress: () => {
          onReset();
          Alert.alert("تم إعادة التعيين!", "تم إعادة تعيين الأذكار بنجاح");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={handleReset}
          style={styles.resetButton}
          activeOpacity={0.7}>
          <RotateCcw size={20} color="#ffffff" />
          <Text style={styles.resetButtonText}>إعادة تعيين</Text>
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            التقدم: {completedCount} / {totalCount}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>رجوع</Text>
          <ArrowLeft size={20} color="#10b981" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 12,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 12,
  },
  resetButton: {
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "600",
  },
});
