import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from "react-native";
import { useLoginLogic } from "./hooks";
import ForgotPasswordModal from "../../../components/ForgotPasswordModal";

const Login = () => {
  const {
    formData,
    error,
    isLoading,
    logoUrl,
    logoLoading,
    handleChange,
    handleSubmit,
  } = useLoginLogic();

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View
          style={[
            styles.content,
            keyboardVisible && styles.contentKeyboardOpen,
          ]}>
          {/* Logo Section - Hide when keyboard is open */}
          {!keyboardVisible && (
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
          )}

          {/* Welcome Text - Hide when keyboard is open */}
          {!keyboardVisible && (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>مرحباً بعودتك</Text>
              <Text style={styles.welcomeSubtitle}>
                سجل الدخول لإدارة بياناتك
              </Text>
            </View>
          )}

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
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => setShowForgotPasswordModal(true)}>
              <Text style={styles.forgotPasswordText}>نسيت كلمة المرور؟</Text>
            </TouchableOpacity>

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
      </ScrollView>

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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  contentKeyboardOpen: {
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: "flex-start",
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
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 16,
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
