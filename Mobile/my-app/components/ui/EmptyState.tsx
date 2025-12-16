import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
    icon?: React.ReactNode;
  };
  illustration?: "no-data" | "search" | "error" | "success";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  illustration,
}) => {
  const illustrations = {
    "no-data": "📭",
    search: "🔍",
    error: "❌",
    success: "✅",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>
        {icon || (illustration && illustrations[illustration]) || "📭"}
      </Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && (
        <Button
          variant="primary"
          size="lg"
          onPress={action.onPress}
          leftIcon={action.icon}
          style={styles.button}>
          {action.label}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
    maxWidth: 320,
  },
  button: {
    marginTop: 8,
  },
});
