// components/profile/ProfileHeader.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import type { RoleConfig } from "@/types/profile.types";

interface ProfileHeaderProps {
  fullName: string;
  age?: number;
  roleConfig: RoleConfig;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChangePassword: () => void;
}

export const ProfileHeader = ({
  fullName,
  age,
  roleConfig,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onChangePassword,
}: ProfileHeaderProps) => {
  return (
    <View style={styles.container}>
      {/* Name */}
      <Text style={styles.name}>{fullName || "مرحباً بك"}</Text>

      {/* Role and Age Badges */}
      <View style={styles.badgesContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>{roleConfig.icon}</Text>
          <Text style={styles.badgeText}>{roleConfig.label}</Text>
        </View>

        {age && (
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🎂</Text>
            <Text style={styles.badgeText}>{age} سنة</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={onSave}
              disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonIcon}>✓</Text>
                  <Text style={styles.buttonText}>حفظ</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isSaving}>
              <Text style={[styles.buttonIcon, { color: "#ef4444" }]}>✕</Text>
              <Text style={[styles.buttonText, { color: "#ef4444" }]}>
                إلغاء
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={onEdit}>
              <Text style={styles.buttonIcon}>✎</Text>
              <Text style={styles.buttonText}>تعديل الملف</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.passwordButton]}
              onPress={onChangePassword}>
              <Text style={styles.buttonIcon}>🔒</Text>
              <Text style={[styles.buttonText, { color: "green" }]}>
                تغيير كلمة
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 24,
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeIcon: {
    fontSize: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#14b8a6",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButton: {
    backgroundColor: "#10b981",
  },
  saveButton: {
    backgroundColor: "#10b981",
  },
  cancelButton: {
    backgroundColor: "#ffffff",
  },
  passwordButton: {
    backgroundColor: "#ffffff",
  },
  buttonIcon: {
    fontSize: 16,
    color: "#ffffff",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
