import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LoginForm } from "./LoginForm";
import { useLoginLogic } from "./hooks";
import ForgotPasswordModal from "../ResetPassword/ForgotPasswordModal";

const Login = () => {
  const {
    formData,
    error,
    isLoading,
    rememberMe,
    showForgotPasswordModal,
    isInitialized,
    handleChange,
    handleRememberMeChange,
    handleSubmit,
    setShowForgotPasswordModal,
  } = useLoginLogic();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <LinearGradient
          colors={["#f0fdf4", "#d1fae5", "#a7f3d0"]}
          style={styles.gradient}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                {/* يمكنك إضافة اللوغو هنا */}
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoText}>📖</Text>
                </View>
              </View>

              <Text style={styles.title}>مدرسة القرآن الكريم</Text>
              <Text style={styles.subtitle}>نظام إدارة الطلاب المتكامل</Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>تسجيل الدخول</Text>
                <Text style={styles.cardSubtitle}>
                  قم بإدخال معلومات الدخول الخاصة بك
                </Text>
              </View>

              <View style={styles.divider} />

              <LoginForm
                formData={formData}
                error={error}
                isLoading={isLoading}
                rememberMe={rememberMe}
                onFormChange={handleChange}
                onRememberMeChange={handleRememberMeChange}
                onSubmit={handleSubmit}
                onForgotPassword={() => setShowForgotPasswordModal(true)}
              />

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  جميع الحقوق محفوظة © {new Date().getFullYear()}
                </Text>
                <Text style={styles.footerSubtext}>مدرسة القرآن الكريم</Text>
              </View>
            </View>

            {/* Features List */}
            <View style={styles.featuresSection}>
              <FeatureItem icon="📚" text="إدارة شاملة للطلاب والمعلمين" />
              <FeatureItem icon="📊" text="تتبع الحضور والأداء الأكاديمي" />
              <FeatureItem icon="📝" text="تقارير تفصيلية ومتابعة دقيقة" />
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isVisible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </SafeAreaView>
  );
};

// Feature Item Component
const FeatureItem: React.FC<{ icon: string; text: string }> = ({
  icon,
  text,
}) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  keyboardView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#065f46",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#047857",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 24,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 20,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  footerSubtext: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 4,
  },
  featuresSection: {
    marginTop: 8,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    textAlign: "right",
  },
});

export default Login;
