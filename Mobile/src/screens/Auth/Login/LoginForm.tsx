import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LoginFormProps {
  userId: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
  isSubmitting: boolean;
  error: string;
  onUserIdChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  userId,
  password,
  rememberMe,
  showPassword,
  isSubmitting,
  error,
  onUserIdChange,
  onPasswordChange,
  onRememberMeChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
}) => {
  return (
    <View style={styles.form}>
      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* User ID Input */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>رقم المستخدم</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={onUserIdChange}
            placeholder="أدخل رقم المستخدم"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            textAlign="right"
          />
        </View>
      </View>

      {/* Password Input */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>كلمة المرور / رقم الهوية</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={onPasswordChange}
            placeholder="أدخل كلمة المرور أو رقم الهوية"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            textAlign="right"
          />
          <TouchableOpacity style={styles.eyeButton} onPress={onTogglePassword}>
            <Text>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Remember Me & Forgot Password */}
      <View style={styles.optionsRow}>
        <View style={styles.rememberMeContainer}>
          <Switch
            value={rememberMe}
            onValueChange={onRememberMeChange}
            trackColor={{ false: "#d1d5db", true: "#a7f3d0" }}
            thumbColor={rememberMe ? "#10b981" : "#f4f4f5"}
          />
          <Text style={styles.rememberMeText}>تذكرني</Text>
          <View style={styles.infoButton}>
            <Text style={styles.infoIcon}>ℹ️</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onForgotPassword}>
          <Text style={styles.forgotPassword}>نسيت كلمة المرور؟</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={onSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}>
        <LinearGradient
          colors={
            isSubmitting ? ["#9ca3af", "#9ca3af"] : ["#10b981", "#14b8a6"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.submitIcon}>🔐</Text>
              <Text style={styles.submitText}>تسجيل الدخول</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#dc2626",
    textAlign: "right",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1f2937",
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 8,
    marginRight: 8,
  },
  infoButton: {
    padding: 4,
  },
  infoIcon: {
    fontSize: 12,
  },
  forgotPassword: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  submitIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  submitText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
});
