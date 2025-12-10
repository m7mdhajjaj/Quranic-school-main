import React from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Components
import { WelcomeSection } from "./WelcomeSection";
import { LoginCard } from "./LoginCard";
import { LoginForm } from "./LoginForm";

// Hooks
import { useLoginLogic } from "./hooks";

const { height } = Dimensions.get("window");

const Login: React.FC = () => {
  const {
    userId,
    password,
    isSubmitting,
    rememberMe,
    showPassword,
    error,
    handleSubmit,
    handleUserIdChange,
    handlePasswordChange,
    handleRememberMeChange,
    handleTogglePassword,
    handleForgotPassword,
  } = useLoginLogic();

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#f8fafc", "#ecfdf5", "#f0fdfa"]}
        style={styles.backgroundGradient}
      />

      {/* Decorative Circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Welcome Section */}
          <WelcomeSection />

          {/* Login Card */}
          <LoginCard>
            <LoginForm
              userId={userId}
              password={password}
              rememberMe={rememberMe}
              showPassword={showPassword}
              isSubmitting={isSubmitting}
              error={error}
              onUserIdChange={handleUserIdChange}
              onPasswordChange={handlePasswordChange}
              onRememberMeChange={handleRememberMeChange}
              onTogglePassword={handleTogglePassword}
              onSubmit={handleSubmit}
              onForgotPassword={handleForgotPassword}
            />
          </LoginCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(20, 184, 166, 0.08)",
    bottom: 100,
    left: -50,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(6, 182, 212, 0.06)",
    top: height * 0.4,
    right: -30,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
});

export default Login;
