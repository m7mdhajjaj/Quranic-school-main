import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  showDivider?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  showDivider = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Icon */}
      {Icon && (
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Icon size={48} color="#ffffff" />
          </View>
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* Divider */}
      {showDivider && (
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  dividerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },
  divider: {
    width: 80,
    height: 4,
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
});
