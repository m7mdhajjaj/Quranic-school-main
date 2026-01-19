import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Eye, EyeOff, Info } from "lucide-react-native";
import { useLoginLogic } from "./hooks";
import ForgotPasswordModal from "../../../components/ForgotPasswordModal";

const Login = () => {
  const router = useRouter();
  const {
    formData,
    error,
    isLoading,
    logoUrl,
    logoLoading,
    rememberMe,
    handleChange,
    handleRememberMeChange,
    handleSubmit,
  } = useLoginLogic();

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 150 : 200}>
      {/* Back to Welcome Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/welcome")}
        activeOpacity={0.7}>
        <ArrowRight size={20} color="#059669" />
        <Text style={styles.backButtonText}>العودة للصفحة الرئيسية</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          {logoLoading ? (
            <ActivityIndicator size="large" color="#059669" />
          ) : logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>📖</Text>
            </View>
          )}
          <Text style={styles.appName}>مدرسة القرآن الكريم</Text>
          <Text style={styles.appSubtitle}>نظام إدارة المدرسة</Text>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>مرحباً بعودتك</Text>
          <Text style={styles.welcomeSubtitle}>
            سجل الدخول لإدارة بياناتك
          </Text>
        </View>

          {/* Login Card */}
          <View style={styles.card}>
            {/* User ID Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>رقم المستخدم</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="أدخل رقم المستخدم"
                  placeholderTextColor="#9ca3af"
                  value={formData.userId}
                  onChangeText={(text) => handleChange("userId", text)}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor="#9ca3af"
                  value={formData.password}
                  onChangeText={(text) => handleChange("password", text)}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}>
                  {showPassword ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsContainer}>
              <View style={styles.rememberMeContainer}>
                <Switch
                  value={rememberMe}
                  onValueChange={handleRememberMeChange}
                  trackColor={{ false: "#d1d5db", true: "#6ee7b7" }}
                  thumbColor={rememberMe ? "#10b981" : "#f3f4f6"}
                />
                <Text style={styles.rememberMeText}>تذكرني</Text>
                <TouchableOpacity
                  style={styles.infoButton}
                  activeOpacity={0.7}>
                  <Info size={14} color="#10b981" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setShowForgotPasswordModal(true)}
                activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>نسيت كلمة المرور؟</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.signInButton,
                isLoading && styles.signInButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.signInButtonText}>تسجيل الدخول</Text>
                  <Text style={styles.signInButtonIcon}>←</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d1fae5", // Light green background
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 12,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#047857",
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#111827",
    paddingRight: 8,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rememberMeText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  infoButton: {
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  signInButton: {
    backgroundColor: "#059669",
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInButtonIcon: {
    color: "#ffffff",
    fontSize: 18,
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 24,
  },
  signUpText: {
    fontSize: 14,
    color: "#6b7280",
  },
  signUpLink: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
  },
});
