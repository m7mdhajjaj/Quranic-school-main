import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { CheckCircle, Clock, AlertCircle, List } from "lucide-react-native";

export type MarkStatus = "completed" | "in_progress" | "not_started";

interface StatusFilterProps {
  selectedStatus: MarkStatus | null;
  onStatusChange: (status: MarkStatus | null) => void;
  counts?: {
    all: number;
    completed: number;
    in_progress: number;
    not_started: number;
  };
}

const STATUS_FILTERS = [
  { label: "الكل", value: null, icon: "List", color: "emerald" },
  { label: "مكتمل", value: "completed", icon: "CheckCircle", color: "green" },
  { label: "قيد العمل", value: "in_progress", icon: "Clock", color: "blue" },
  {
    label: "لم يبدأ",
    value: "not_started",
    icon: "AlertCircle",
    color: "yellow",
  },
];

export const SectionStatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatus,
  onStatusChange,
  counts,
}) => {
  const getIcon = (iconName: string, isSelected: boolean) => {
    const iconColor = isSelected ? "#ffffff" : "#6b7280";
    const size = 16;

    switch (iconName) {
      case "List":
        return <List size={size} color={iconColor} />;
      case "CheckCircle":
        return <CheckCircle size={size} color={iconColor} />;
      case "Clock":
        return <Clock size={size} color={iconColor} />;
      case "AlertCircle":
        return <AlertCircle size={size} color={iconColor} />;
      default:
        return <List size={size} color={iconColor} />;
    }
  };

  const getButtonStyle = (filterValue: MarkStatus | null, color: string) => {
    const isSelected = selectedStatus === filterValue;

    const colorStyles = {
      emerald: {
        selected: { backgroundColor: "#10b981" },
        default: { backgroundColor: "#f3f4f6" },
      },
      green: {
        selected: { backgroundColor: "#22c55e" },
        default: { backgroundColor: "#f3f4f6" },
      },
      blue: {
        selected: { backgroundColor: "#3b82f6" },
        default: { backgroundColor: "#f3f4f6" },
      },
      yellow: {
        selected: { backgroundColor: "#f59e0b" },
        default: { backgroundColor: "#f3f4f6" },
      },
    };

    return isSelected
      ? colorStyles[color as keyof typeof colorStyles]?.selected ||
          colorStyles.emerald.selected
      : colorStyles[color as keyof typeof colorStyles]?.default ||
          colorStyles.emerald.default;
  };

  const getTextStyle = (filterValue: MarkStatus | null) => {
    const isSelected = selectedStatus === filterValue;
    return isSelected ? styles.buttonTextSelected : styles.buttonText;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      {STATUS_FILTERS.map((filter) => {
        const filterValue = filter.value as MarkStatus | null;
        const count =
          filter.value === null
            ? counts?.all
            : counts?.[filter.value as keyof Omit<typeof counts, "all">];
        const isSelected = selectedStatus === filterValue;

        return (
          <TouchableOpacity
            key={filter.label}
            onPress={() => onStatusChange(filterValue)}
            style={[styles.button, getButtonStyle(filterValue, filter.color)]}
            activeOpacity={0.7}>
            {getIcon(filter.icon, isSelected)}
            <Text style={getTextStyle(filterValue)}>{filter.label}</Text>
            {count !== undefined && (
              <View
                style={[
                  styles.badge,
                  isSelected ? styles.badgeSelected : styles.badgeDefault,
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    isSelected
                      ? styles.badgeTextSelected
                      : styles.badgeTextDefault,
                  ]}>
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  contentContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  buttonTextSelected: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeDefault: {
    backgroundColor: "#d1fae5",
  },
  badgeSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  badgeTextDefault: {
    color: "#059669",
  },
  badgeTextSelected: {
    color: "#ffffff",
  },
});

export default SectionStatusFilter;
