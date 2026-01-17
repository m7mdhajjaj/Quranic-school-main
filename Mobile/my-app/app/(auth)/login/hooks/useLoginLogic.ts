import { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import {
  loginStudent,
  loginTeacher,
  loginAdmin,
  loginSecretary,
  loginTeacherAssistant,
} from "@/Api/authApi";
import type { User } from "@/Context/AuthContext";
import type { LoginFormData } from "../LoginForm";

// Hook للحصول على الـ Logo
const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    // يمكن تحميل الـ Logo من API أو استخدام صورة محلية
    // للتبسيط، سنضع null ونترك الـ Logo component يعرض الـ fallback
    setLogoLoading(false);
  }, []);

  return { logoUrl, logoLoading };
};

export const useLoginLogic = () => {
  const { login: authLogin, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    userId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const { logoUrl, logoLoading } = useLogo();
  const [isInitialized, setIsInitialized] = useState(false);

  // Navigation and saved credentials
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedCredentials = await AsyncStorage.getItem("savedCredentials");
        if (savedCredentials) {
          const credentials = JSON.parse(savedCredentials);
          setFormData({
            userId: credentials.userId || "",
            password: credentials.password || "",
          });
          setRememberMe(true);
        }
      } catch {
        await AsyncStorage.removeItem("savedCredentials");
      }

      // Mark initialization as complete
      setTimeout(() => {
        setIsInitialized(true);
      }, 100);
    };

    initializeAuth();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleRememberMeChange = async (checked: boolean) => {
    setRememberMe(checked);

    if (!checked) {
      await AsyncStorage.removeItem("savedCredentials");
    }
  };

  const handleSubmit = async () => {
    // Prevent submission if not initialized yet
    if (!isInitialized) {
      console.log("Waiting for initialization...");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      let response;
      const loginErrors: string[] = [];

      // Try student login first
      try {
        response = await loginStudent({
          studentId: formData.userId,
          idNumber: formData.password,
          rememberMe: rememberMe,
        });
      } catch (studentError) {
        const studentMsg = axios.isAxiosError(studentError)
          ? studentError.response?.data?.message
          : "خطأ في تسجيل دخول الطالب";
        loginErrors.push(`طالب: ${studentMsg}`);

        // Try teacher login
        try {
          response = await loginTeacher({
            teacherId: formData.userId,
            password: formData.password,
            userType: "teacher",
            rememberMe: rememberMe,
          });
        } catch (teacherError) {
          const teacherMsg = axios.isAxiosError(teacherError)
            ? teacherError.response?.data?.message
            : "خطأ في تسجيل دخول المعلم";
          loginErrors.push(`معلم: ${teacherMsg}`);

          // Try admin login
          try {
            response = await loginAdmin({
              adminId: formData.userId,
              password: formData.password,
              userType: "admin",
              rememberMe: rememberMe,
            });
          } catch (adminError) {
            const adminMsg = axios.isAxiosError(adminError)
              ? adminError.response?.data?.message
              : "خطأ في تسجيل دخول الإداري";
            loginErrors.push(`إداري: ${adminMsg}`);

            // Try secretary login
            try {
              response = await loginSecretary({
                secretaryId: formData.userId,
                password: formData.password,
                userType: "secretary",
                rememberMe: rememberMe,
              });
            } catch (secretaryError) {
              const secretaryMsg = axios.isAxiosError(secretaryError)
                ? secretaryError.response?.data?.message
                : "خطأ في تسجيل دخول السكرتير";
              loginErrors.push(`سكرتير: ${secretaryMsg}`);

              // Try teacher assistant login
              try {
                response = await loginTeacherAssistant({
                  assistantId: formData.userId,
                  password: formData.password,
                  userType: "teacherAssistant",
                  rememberMe: rememberMe,
                });
              } catch (assistantError) {
                const assistantMsg = axios.isAxiosError(assistantError)
                  ? assistantError.response?.data?.message
                  : "خطأ في تسجيل دخول مساعد المدرس";
                loginErrors.push(`مساعد مدرس: ${assistantMsg}`);

                throw new Error(
                  `فشل تسجيل الدخول. البيانات غير صحيحة أو المستخدم غير موجود.`
                );
              }
            }
          }
        }
      }

      if (response && response.user && response.token) {
        await authLogin(response.user as unknown as User, response.token);
        setFailedAttempts(0);

        if (rememberMe) {
          await AsyncStorage.setItem(
            "savedCredentials",
            JSON.stringify({
              userId: formData.userId,
              password: formData.password,
            })
          );
        } else {
          await AsyncStorage.removeItem("savedCredentials");
        }

        // Navigate to main screen
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 100);
      } else {
        setError("رد غير صحيح من الخادم. رجاءً تأكد من بيانات الدخول.");
      }
    } catch (error: unknown) {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= 3) {
        setShowForgotPasswordModal(true);
      }

      if (error instanceof Error) {
        const errorMsg = error.message;
        setError(
          "البيانات المدخلة غير صحيحة. تأكد من رقم المستخدم وكلمة المرور."
        );
      } else if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setError(message || "فشل تسجيل الدخول. رجاءً تأكد من بيانات الدخول.");
      } else {
        setError("فشل تسجيل الدخول. رجاءً تأكد من بيانات الدخول.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    error,
    isLoading,
    rememberMe,
    showForgotPasswordModal,
    logoUrl,
    logoLoading,
    isInitialized,
    handleChange,
    handleRememberMeChange,
    handleSubmit,
    setShowForgotPasswordModal,
  };
};
