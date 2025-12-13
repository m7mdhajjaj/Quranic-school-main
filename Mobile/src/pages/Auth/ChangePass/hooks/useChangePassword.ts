import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { changePassword } from "../../../../Api/authApi";
import { StorageHelper } from "../../../../utils/storage";

interface UseChangePasswordProps {
  isVisible: boolean;
  onClose: () => void;
}

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export const useChangePassword = ({
  isVisible,
  onClose,
}: UseChangePasswordProps) => {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "",
    color: "#9ca3af",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isVisible) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setValidationErrors({});
      setPasswordStrength({
        score: 0,
        label: "",
        color: "#9ca3af",
      });
    }
  }, [isVisible]);

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      return { score: 0, label: "", color: "#9ca3af" };
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;

    // Contains lowercase
    if (/[a-z]/.test(password)) score += 15;

    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 15;

    // Contains numbers
    if (/\d/.test(password)) score += 15;

    // Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    let label = "";
    let color = "#9ca3af";

    if (score < 50) {
      label = "ضعيفة";
      color = "#ef4444";
    } else if (score < 75) {
      label = "جيدة";
      color = "#eab308";
    } else {
      label = "ممتازة";
      color = "#10b981";
    }

    return { score, label, color };
  };

  // Validate password
  const validatePassword = (password: string): string => {
    if (!password) return "كلمة المرور الجديدة مطلوبة";
    if (password.length < 8) return "يجب أن تكون 8 أحرف على الأقل";
    if (!/[a-z]/.test(password)) return "يجب أن تحتوي على حرف صغير";
    if (!/[A-Z]/.test(password)) return "يجب أن تحتوي على حرف كبير";
    if (!/\d/.test(password)) return "يجب أن تحتوي على رقم";
    if (password === formData.currentPassword)
      return "يجب أن تكون مختلفة عن كلمة المرور الحالية";
    return "";
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update password strength for new password
    if (name === "newPassword") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);

      // Validate
      const error = validatePassword(value);
      setValidationErrors((prev) => ({ ...prev, newPassword: error }));
    }

    // Validate confirm password
    if (name === "confirmPassword") {
      const error =
        value !== formData.newPassword ? "كلمة المرور غير متطابقة" : "";
      setValidationErrors((prev) => ({ ...prev, confirmPassword: error }));
    }

    // Clear error for current field
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.currentPassword) {
      errors.currentPassword = "كلمة المرور الحالية مطلوبة";
    }

    const newPasswordError = validatePassword(formData.newPassword);
    if (newPasswordError) {
      errors.newPassword = newPasswordError;
    }

    if (formData.confirmPassword !== formData.newPassword) {
      errors.confirmPassword = "كلمة المرور غير متطابقة";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("خطأ في النموذج", "يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsLoading(true);

    try {
      const token = await StorageHelper.getItem("token");
      const userJson = await StorageHelper.getItem("user");

      if (!token || !userJson) {
        Alert.alert("خطأ في الدخول", "يجب تسجيل الدخول أولاً");
        onClose();
        return;
      }

      const user = JSON.parse(userJson);

      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        userId: user._id,
        userType: user.role || "student",
      });

      if (response.success) {
        // Reset form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength({
          score: 0,
          label: "",
          color: "#9ca3af",
        });
        setValidationErrors({});

        // Show success message
        Alert.alert("تم تغيير كلمة المرور", "تم تغيير كلمة المرور بنجاح ✅", [
          {
            text: "حسناً",
            onPress: () => onClose(),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Change password error:", error);

      let errorMessage = "حدث خطأ أثناء تغيير كلمة المرور";

      if (error.response?.status === 400) {
        errorMessage = "كلمة المرور الحالية غير صحيحة";
        setValidationErrors((prev) => ({
          ...prev,
          currentPassword: "كلمة المرور الحالية غير صحيحة",
        }));
      } else if (error.response?.status === 401) {
        errorMessage = "انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("خطأ", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    validationErrors,
    passwordStrength,
    handleChange,
    handleSubmit,
  };
};
