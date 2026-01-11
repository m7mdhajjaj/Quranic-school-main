import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
}) => {
  const requirements = [
    {
      text: "4 أحرف على الأقل",
      met: password.length >= 4,
    },
    {
      text: "4 أرقام على الأقل أو 3 حروف مع أرقام",
      met:
        (password.match(/\d/g) || []).length >= 4 ||
        ((password.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length >= 3 &&
          (password.match(/\d/g) || []).length >= 1),
    },
  ];

  if (!password) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>متطلبات كلمة المرور:</Text>
        <Text style={styles.info}>أدخل كلمة المرور لرؤية المتطلبات</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>متطلبات كلمة المرور:</Text>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirement}>
          <Ionicons
            name={req.met ? "checkmark-circle" : "close-circle"}
            size={18}
            color={req.met ? "#10B981" : "#EF4444"}
          />
          <Text
            style={[
              styles.requirementText,
              req.met ? styles.requirementMet : styles.requirementUnmet,
            ]}>
            {req.text}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  info: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    justifyContent: "flex-end",
  },
  requirementText: {
    fontSize: 11,
    textAlign: "right",
  },
  requirementMet: {
    color: "#10B981",
  },
  requirementUnmet: {
    color: "#6B7280",
  },
});
