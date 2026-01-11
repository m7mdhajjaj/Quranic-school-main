import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  VerificationForm,
  NewPasswordForm,
} from "../components/forgotPassword";
import {
  useForgotPassword,
  useResetPassword,
  usePasswordStrength,
} from "../hooks/forgotPassword";
import type {
  ForgotPasswordModalProps,
  ResetStep,
} from "../types/forgotPassword.types";

const { width } = Dimensions.get("window");

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const [resetStep, setResetStep] = useState<ResetStep>(1);

  // استخدام الـ hooks
  const forgotPasswordHook = useForgotPassword();
  const resetPasswordHook = useResetPassword(
    forgotPasswordHook.forgotPasswordData
  );
  const passwordStrength = usePasswordStrength(
    resetPasswordHook.newPasswordData.password
  );

  const handleForgotPasswordSubmit = async () => {
    await forgotPasswordHook.handleSubmit(() => {
      setResetStep(2);
    });
  };

  const handleNewPasswordSubmit = async () => {
    await resetPasswordHook.handleSubmit(() => {
      handleClose();
      Alert.alert("نجاح", "تم تغيير كلمة المرور بنجاح");
    });
  };

  const handleClose = () => {
    setResetStep(1);
    forgotPasswordHook.reset();
    resetPasswordHook.reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>استعادة كلمة المرور</Text>
                <Text style={styles.subtitle}>
                  {resetStep === 1
                    ? "الخطوة 1: التحقق من الهوية"
                    : "الخطوة 2: إنشاء كلمة مرور جديدة"}
                </Text>
              </View>
            </View>
          </View>

          {/* Steps Indicator */}
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  resetStep >= 1 && styles.stepCircleActive,
                ]}>
                {resetStep > 1 ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : (
                  <Text style={styles.stepNumber}>1</Text>
                )}
              </View>
              <Text style={styles.stepLabel}>التحقق من الهوية</Text>
            </View>

            <View
              style={[styles.stepLine, resetStep >= 2 && styles.stepLineActive]}
            />

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  resetStep >= 2 && styles.stepCircleActive,
                ]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepLabel}>كلمة مرور جديدة</Text>
            </View>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            {resetStep === 1 ? (
              <VerificationForm
                formData={forgotPasswordHook.forgotPasswordData}
                fieldErrors={forgotPasswordHook.fieldErrors}
                error={forgotPasswordHook.error}
                isLoading={forgotPasswordHook.isLoading}
                onChange={forgotPasswordHook.handleChange}
                onSubmit={handleForgotPasswordSubmit}
                onCancel={handleClose}
              />
            ) : (
              <NewPasswordForm
                formData={resetPasswordHook.newPasswordData}
                fieldErrors={resetPasswordHook.fieldErrors}
                error={resetPasswordHook.error}
                isLoading={resetPasswordHook.isLoading}
                passwordStrength={passwordStrength}
                onChange={resetPasswordHook.handleChange}
                onSubmit={handleNewPasswordSubmit}
                onCancel={handleClose}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: width > 600 ? 600 : width - 40,
    height: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "right",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "right",
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
  },
  stepItem: {
    alignItems: "center",
    gap: 8,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#059669",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  stepLineActive: {
    backgroundColor: "#059669",
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
});

export default ForgotPasswordModal;
