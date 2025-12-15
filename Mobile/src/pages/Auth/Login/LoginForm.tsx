import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from "react-native";
import { LogIn, Eye, EyeOff, Info } from "lucide-react-native";
import type { LoginFormData } from "../types";

interface LoginFormProps {
  formData: LoginFormData;
  error: string;
  isLoading: boolean;
  rememberMe: boolean;
  onFormChange: (name: string, value: string) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  error,
  isLoading,
  rememberMe,
  onFormChange,
  onRememberMeChange,
  onSubmit,
  onForgotPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* رسالة الخطأ */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* حقل رقم المستخدم */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>رقم المستخدم</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل رقم المستخدم"
          value={formData.userId}
          onChangeText={(value) => onFormChange("userId", value)}
          autoCapitalize="none"
          keyboardType="default"
          textAlign="right"
        />
      </View>

      {/* حقل كلمة المرور */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>كلمة المرور / رقم الهوية</Text>
        <View style={styles.passwordContainer}>
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}>
            {showPassword ? (
              <EyeOff size={20} color="#6b7280" />
            ) : (
              <Eye size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="أدخل كلمة المرور أو رقم الهوية"
            value={formData.password}
            onChangeText={(value) => onFormChange("password", value)}
            secureTextEntry={!showPassword}
            textAlign="right"
          />
        </View>
      </View>

      {/* تذكرني و نسيت كلمة المرور */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          onPress={onForgotPassword}
          style={styles.forgotButton}>
          <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
        </TouchableOpacity>

        <View style={styles.rememberMeContainer}>
          <View style={styles.infoIconContainer}>
            <Info size={14} color="#10b981" />
          </View>
          <Text style={styles.rememberMeText}>تذكرني</Text>
          <Switch
            value={rememberMe}
            onValueChange={onRememberMeChange}
            trackColor={{ false: "#d1d5db", true: "#86efac" }}
            thumbColor={rememberMe ? "#10b981" : "#f3f4f6"}
          />
        </View>
      </View>

      {/* معلومات الجلسة */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionInfoText}>
          {rememberMe
            ? "✅ مفعّل: ستبقى متصلاً لمدة 7 أيام"
            : "⏰ غير مفعّل: سيتم تسجيل الخروج بعد 30 دقيقة"}
        </Text>
      </View>

      {/* زر تسجيل الدخول */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <View style={styles.submitButtonContent}>
            <LogIn size={20} color="#ffffff" />
            <Text style={styles.submitButtonText}>تسجيل الدخول</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "right",
    fontFamily: "System",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
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
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 14,
    zIndex: 1,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIconContainer: {
    backgroundColor: "#d1fae5",
    borderRadius: 50,
    padding: 4,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  forgotButton: {
    padding: 4,
  },
  forgotText: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
  },
  sessionInfo: {
    backgroundColor: "#f0fdfa",
    borderWidth: 1,
    borderColor: "#5eead4",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  sessionInfoText: {
    fontSize: 12,
    color: "#0f766e",
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0.1,
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
