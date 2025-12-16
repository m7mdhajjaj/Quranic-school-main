import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, X } from "lucide-react-native";

interface PasswordRequirementsProps {
  password: string;
}

interface Requirement {
  text: string;
  completed: boolean;
  optional?: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
}) => {
  const numberCount = (password.match(/[\d٠-٩]/g) || []).length;
  const letterCount = (password.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;

  const has4Chars = password.length >= 4;
  const has4Numbers = numberCount >= 4;
  const has3LettersWithNumbers = letterCount >= 3 && numberCount >= 1;
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const requirements: Requirement[] = [
    { text: "4 أحرف على الأقل", completed: has4Chars },
    { text: "أو 4 أرقام على الأقل", completed: has4Numbers },
    { text: "3 حروف مع أرقام", completed: has3LettersWithNumbers },
    { text: "رموز خاصة (للقوة)", completed: hasSpecialChars, optional: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLine} />
        <Text style={styles.headerText}>متطلبات كلمة المرور الجديدة</Text>
      </View>

      <View style={styles.requirementsList}>
        {requirements.map((req, index) => {
          const isActive = password.length > 0;

          return (
            <View key={index} style={styles.requirementItem}>
              <View
                style={[
                  styles.iconContainer,
                  req.completed
                    ? styles.iconCompleted
                    : isActive
                      ? styles.iconIncomplete
                      : styles.iconInactive,
                ]}>
                {req.completed ? (
                  <Check size={14} color="#ffffff" strokeWidth={3} />
                ) : (
                  <X
                    size={14}
                    color={isActive ? "#ffffff" : "#9ca3af"}
                    strokeWidth={2}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.requirementText,
                  req.completed && styles.requirementTextCompleted,
                  req.optional && styles.requirementTextOptional,
                ]}>
                {req.text}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#d1fae5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6ee7b7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  headerLine: {
    width: 4,
    height: 20,
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#064e3b",
    textAlign: "right",
  },
  requirementsList: {
    gap: 10,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCompleted: {
    backgroundColor: "#10b981",
  },
  iconIncomplete: {
    backgroundColor: "#ef4444",
  },
  iconInactive: {
    backgroundColor: "#e5e7eb",
  },
  requirementText: {
    fontSize: 13,
    color: "#374151",
    textAlign: "right",
    flex: 1,
  },
  requirementTextCompleted: {
    color: "#059669",
    fontWeight: "500",
  },
  requirementTextOptional: {
    fontStyle: "italic",
  },
});
