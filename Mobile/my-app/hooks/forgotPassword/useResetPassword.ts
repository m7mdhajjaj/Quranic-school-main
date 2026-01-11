import { useState } from "react";
import { Alert } from "react-native";
import { resetPassword } from "../../Api/authApi";
import { validateResetPasswordData } from "../../Validation/forgotPasswordValidation";
import type {
  ForgotPasswordFormData,
  NewPasswordData,
  FieldErrors,
  UseResetPasswordReturn,
} from "../../types/forgotPassword.types";

export const useResetPassword = (
  forgotPasswordData: ForgotPasswordFormData
): UseResetPasswordReturn => {
  const [newPasswordData, setNewPasswordData] = useState<NewPasswordData>({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof NewPasswordData, value: string) => {
    setNewPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user types
    if (error) setError("");
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (onSuccess: () => void) => {
    setError("");
    setFieldErrors({});

    // Frontend validation
    const validation = validateResetPasswordData({
      ...forgotPasswordData,
      password: newPasswordData.password,
      confirmPassword: newPasswordData.confirmPassword,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword({
        ...forgotPasswordData,
        newPassword: newPasswordData.password,
        confirmPassword: newPasswordData.confirmPassword,
      });

      if (response.success) {
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false);
        setError(response.message || "فشل في تغيير كلمة المرور");
      }
    } catch (error: unknown) {
      setIsLoading(false);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string; errors?: string[] } };
        };
        const message = axiosError.response?.data?.message;
        const errors = axiosError.response?.data?.errors;

        if (errors && Array.isArray(errors) && errors.length > 0) {
          setError(errors.join("\n"));
        } else {
          setError(message || "فشل في تغيير كلمة المرور");
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("فشل في تغيير كلمة المرور");
      }
    }
  };

  const reset = () => {
    setNewPasswordData({
      password: "",
      confirmPassword: "",
    });
    setError("");
    setFieldErrors({});
  };

  return {
    newPasswordData,
    error,
    fieldErrors,
    isLoading,
    handleChange,
    handleSubmit,
    reset,
  };
};
