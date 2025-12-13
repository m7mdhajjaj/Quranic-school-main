import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import {
  loginStudent,
  loginTeacher,
  loginAdmin,
} from "../../../../Api/authApi";
import { StorageHelper, AuthStorage } from "../../../../utils/storage";
import type { LoginFormData, AuthUser } from "../../types";

export const useLoginLogic = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState<LoginFormData>({
    userId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // تحميل بيانات الدخول المحفوظة
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedCredentials = await StorageHelper.getObject<{
          userId: string;
          password: string;
        }>("savedCredentials");

        if (savedCredentials) {
          setFormData({
            userId: savedCredentials.userId || "",
            password: savedCredentials.password || "",
          });
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadSavedCredentials();
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
      await StorageHelper.removeItem("savedCredentials");
    }
  };

  const handleSubmit = async () => {
    if (!isInitialized) {
      console.log("Waiting for initialization...");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      let response;
      const loginErrors: string[] = [];

      // محاولة تسجيل دخول الطالب أولاً
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

        // محاولة تسجيل دخول المعلم
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

          // محاولة تسجيل دخول الإداري
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

            throw new Error(
              "فشل تسجيل الدخول. البيانات غير صحيحة أو المستخدم غير موجود."
            );
          }
        }
      }

      if (response && response.user && response.token) {
        // حفظ البيانات
        await AuthStorage.saveToken(response.token);
        await AuthStorage.saveUser(response.user);
        await StorageHelper.setItem("userId", String(response.user._id));

        setFailedAttempts(0);

        // حفظ بيانات الدخول إذا كان "تذكرني" مفعل
        if (rememberMe) {
          await StorageHelper.setObject("savedCredentials", {
            userId: formData.userId,
            password: formData.password,
          });
        } else {
          await StorageHelper.removeItem("savedCredentials");
        }

        // عرض رسالة نجاح
        Alert.alert(
          "تم تسجيل الدخول",
          `مرحباً ${response.user.firstName || response.user.name || "بك"}!`,
          [{ text: "حسناً" }]
        );

        // التنقل للصفحة الرئيسية (سيتم معالجته في Navigation)
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'Home' }],
        // });
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
          errorMsg ||
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
    isInitialized,
    handleChange,
    handleRememberMeChange,
    handleSubmit,
    setShowForgotPasswordModal,
  };
};
