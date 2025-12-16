import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LoginForm } from "./LoginForm";
import { WelcomeSection } from "./WelcomeSection";
import { LoginCard } from "./LoginCard";
import { useLoginLogic } from "./hooks";

const Login = () => {
  const {
    formData,
    error,
    isLoading,
    rememberMe,
    showForgotPasswordModal,
    logoUrl,
    logoLoading,
    handleChange,
    handleRememberMeChange,
    handleSubmit,
    setShowForgotPasswordModal,
  } = useLoginLogic();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Background Gradient Effect */}
        <View style={styles.background} />

        {/* Main Content Container */}
        <View style={styles.content}>
          {/* Welcome Section - Shows first on mobile */}
          <WelcomeSection logoUrl={logoUrl} logoLoading={logoLoading} />

          {/* Login Form */}
          <LoginCard>
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
          </LoginCard>
        </View>

        {/* Forgot Password Modal - يمكن إضافته لاحقاً */}
        {/* <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
        /> */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdfa",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f0fdfa",
    // يمكن إضافة gradient هنا باستخدام LinearGradient
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    gap: 24,
    paddingHorizontal: 16,
  },
});
