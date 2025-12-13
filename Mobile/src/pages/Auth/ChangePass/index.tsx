import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { Eye, EyeOff, Lock, CheckCircle2, X } from "lucide-react-native";
import { useChangePassword } from "./hooks";

interface ChangePasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isVisible,
  onClose,
}) => {
  const {
    formData,
    isLoading,
    validationErrors,
    passwordStrength,
    handleChange,
    handleSubmit,
  } = useChangePassword({ isVisible, onClose });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.lockIconContainer}>
                <Lock size={24} color="#ffffff" />
              </View>
              <Text style={styles.title}>تغيير كلمة المرور</Text>
              <Text style={styles.subtitle}>
                يرجى إدخال كلمة المرور الحالية والجديدة
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>كلمة المرور الحالية</Text>
              <View style={styles.passwordContainer}>
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}>
                  {showCurrentPassword ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    validationErrors.currentPassword && styles.inputError,
                  ]}
                  placeholder="أدخل كلمة المرور الحالية"
                  value={formData.currentPassword}
                  onChangeText={(value) =>
                    handleChange("currentPassword", value)
                  }
                  secureTextEntry={!showCurrentPassword}
                  textAlign="right"
                />
              </View>
              {validationErrors.currentPassword && (
                <Text style={styles.errorText}>
                  {validationErrors.currentPassword}
                </Text>
              )}
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>كلمة المرور الجديدة</Text>
              <View style={styles.passwordContainer}>
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}>
                  {showNewPassword ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    validationErrors.newPassword && styles.inputError,
                  ]}
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={formData.newPassword}
                  onChangeText={(value) => handleChange("newPassword", value)}
                  secureTextEntry={!showNewPassword}
                  textAlign="right"
                />
              </View>
              {validationErrors.newPassword && (
                <Text style={styles.errorText}>
                  {validationErrors.newPassword}
                </Text>
              )}
            </View>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthLabel}>قوة كلمة المرور:</Text>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${passwordStrength.score}%`,
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    { color: passwordStrength.color },
                  ]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>تأكيد كلمة المرور الجديدة</Text>
              <View style={styles.passwordContainer}>
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
                {formData.confirmPassword &&
                  !validationErrors.confirmPassword && (
                    <View style={styles.checkIcon}>
                      <CheckCircle2 size={20} color="#10b981" />
                    </View>
                  )}
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    validationErrors.confirmPassword && styles.inputError,
                  ]}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleChange("confirmPassword", value)
                  }
                  secureTextEntry={!showConfirmPassword}
                  textAlign="right"
                />
              </View>
              {validationErrors.confirmPassword && (
                <Text style={styles.errorText}>
                  {validationErrors.confirmPassword}
                </Text>
              )}
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>متطلبات كلمة المرور:</Text>
              <RequirementItem
                met={formData.newPassword.length >= 8}
                text="8 أحرف على الأقل"
              />
              <RequirementItem
                met={/[a-z]/.test(formData.newPassword)}
                text="حرف صغير واحد على الأقل"
              />
              <RequirementItem
                met={/[A-Z]/.test(formData.newPassword)}
                text="حرف كبير واحد على الأقل"
              />
              <RequirementItem
                met={/\d/.test(formData.newPassword)}
                text="رقم واحد على الأقل"
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isLoading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>تغيير كلمة المرور</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isLoading}>
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Requirement Item Component
const RequirementItem: React.FC<{ met: boolean; text: string }> = ({
  met,
  text,
}) => (
  <View style={styles.requirementItem}>
    <View
      style={[
        styles.requirementDot,
        met ? styles.requirementDotMet : styles.requirementDotUnmet,
      ]}
    />
    <Text
      style={[
        styles.requirementText,
        met ? styles.requirementTextMet : styles.requirementTextUnmet,
      ]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "90%",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: "flex-start",
    padding: 4,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 8,
  },
  lockIconContainer: {
    backgroundColor: "#10b981",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  passwordContainer: {
    position: "relative",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
  },
  passwordInput: {
    paddingRight: 45,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 14,
    zIndex: 1,
  },
  checkIcon: {
    position: "absolute",
    left: 14,
    top: 14,
    zIndex: 1,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  strengthContainer: {
    marginBottom: 20,
  },
  strengthLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  strengthBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  requirementsContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "right",
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  requirementDotMet: {
    backgroundColor: "#10b981",
  },
  requirementDotUnmet: {
    backgroundColor: "#d1d5db",
  },
  requirementText: {
    fontSize: 12,
    textAlign: "right",
  },
  requirementTextMet: {
    color: "#10b981",
  },
  requirementTextUnmet: {
    color: "#6b7280",
  },
  buttonsContainer: {
    marginBottom: 20,
    gap: 12,
  },
  submitButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChangePasswordModal;
