import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";

export const useLoginLogic = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async () => {
    setError("");

    if (!userId || !password) {
      setError("الرجاء إدخال رقم المستخدم وكلمة المرور");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: userId, password });
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserIdChange = (value: string) => {
    setUserId(value);
    if (error) setError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError("");
  };

  const handleRememberMeChange = (value: boolean) => {
    setRememberMe(value);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
  };

  return {
    // State
    userId,
    password,
    isSubmitting,
    rememberMe,
    showPassword,
    error,
    showForgotPasswordModal,

    // Handlers
    handleSubmit,
    handleUserIdChange,
    handlePasswordChange,
    handleRememberMeChange,
    handleTogglePassword,
    handleForgotPassword,
    setShowForgotPasswordModal,
  };
};
