import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PasswordStrengthIndicator, PasswordRequirements } from "./";
import type {
  NewPasswordData,
  FieldErrors,
  PasswordStrengthResult,
} from "../../types/forgotPassword.types";

interface NewPasswordFormProps {
  formData: NewPasswordData;
  fieldErrors: FieldErrors;
  error: string;
  isLoading: boolean;
  passwordStrength: PasswordStrengthResult;
  onChange: (field: keyof NewPasswordData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const NewPasswordForm: React.FC<NewPasswordFormProps> = ({
  formData,
  fieldErrors,
  error,
  isLoading,
  passwordStrength,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Success Alert */}
      <View style={styles.successAlert}>
        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
        <View style={styles.alertTextContainer}>
          <Text style={styles.successTitle}>تم التحقق من هويتك بنجاح!</Text>
          <Text style={styles.successText}>
            يمكنك الآن إنشاء كلمة مرور جديدة وآمنة لحسابك
          </Text>
        </View>
      </View>

      {/* Error Alert */}
      {error && (
        <View style={styles.errorAlert}>
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Password Requirements */}
      <View style={styles.requirementsRow}>
        <View style={styles.requirementsContainer}>
          <PasswordRequirements password={formData.password} />
        </View>
        <View style={styles.strengthContainer}>
          <Text style={styles.strengthLabel}>مؤشر القوة</Text>
          <PasswordStrengthIndicator
            password={formData.password}
            score={passwordStrength.score}
            label={passwordStrength.label}
            color={passwordStrength.color}
          />
        </View>
      </View>

      {/* Password Field */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>كلمة المرور الجديدة</Text>
        <View style={styles.passwordInputContainer}>
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.passwordInput,
              fieldErrors.password && styles.inputError,
            ]}
            value={formData.password}
            onChangeText={(text) => onChange("password", text)}
            placeholder="أدخل كلمة المرور الجديدة"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            textAlign="right"
          />
        </View>
        {fieldErrors.password && (
          <Text style={styles.fieldError}>{fieldErrors.password}</Text>
        )}
      </View>

      {/* Confirm Password Field */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>تأكيد كلمة المرور</Text>
        <View style={styles.passwordInputContainer}>
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.passwordInput,
              fieldErrors.confirmPassword && styles.inputError,
            ]}
            value={formData.confirmPassword}
            onChangeText={(text) => onChange("confirmPassword", text)}
            placeholder="أعد إدخال كلمة المرور"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirmPassword}
            textAlign="right"
          />
        </View>
        {fieldErrors.confirmPassword && (
          <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isLoading}>
          <Text style={styles.cancelButtonText}>إلغاء</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="key" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>تحديث كلمة المرور</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  successAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  alertTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#047857",
    marginBottom: 4,
    textAlign: "right",
  },
  successText: {
    fontSize: 11,
    color: "#10B981",
    textAlign: "right",
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: "#EF4444",
    textAlign: "right",
  },
  requirementsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  requirementsContainer: {
    flex: 2,
  },
  strengthContainer: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    justifyContent: "center",
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
    marginBottom: 8,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  passwordInputContainer: {
    position: "relative",
  },
  passwordInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 14,
    color: "#1F2937",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  fieldError: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    textAlign: "right",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
