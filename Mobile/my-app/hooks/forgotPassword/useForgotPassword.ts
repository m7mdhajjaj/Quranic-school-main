import { useState } from "react";
import { Alert } from "react-native";
import { forgotPassword } from "../../Api/authApi";
import { validateForgotPasswordData } from "../../Validation/forgotPasswordValidation";
import type {
  ForgotPasswordFormData,
  FieldErrors,
  UseForgotPasswordReturn,
} from "../../types/forgotPassword.types";

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [forgotPasswordData, setForgotPasswordData] =
    useState<ForgotPasswordFormData>({
      firstName: "",
      fatherName: "",
      grandFatherName: "",
      lastName: "",
      motherName: "",
      idNumber: "",
      birthDate: "",
    });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof ForgotPasswordFormData, value: string) => {
    // للحقل رقم الهوية، نسمح فقط بالأرقام و 9 أرقام كحد أقصى
    if (field === "idNumber") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length > 9) return;
      setForgotPasswordData((prev) => ({
        ...prev,
        [field]: numericValue,
      }));
    } else {
      setForgotPasswordData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

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
    const validation = validateForgotPasswordData(forgotPasswordData);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword(forgotPasswordData);

      if (response.success) {
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false);
        setError(
          response.message ||
            "فشل في التحقق من البيانات. رجاءً تأكد من صحة المعلومات."
        );
      }
    } catch (error: unknown) {
      setIsLoading(false);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string; errors?: string[] } };
        };
        const message = axiosError.response?.data?.message;
        const errors = axiosError.response?.data?.errors;

        // عرض الأخطاء من Backend
        if (errors && Array.isArray(errors) && errors.length > 0) {
          setError(errors.join("\n"));
        } else {
          setError(
            message || "فشل في التحقق من البيانات. رجاءً تأكد من صحة المعلومات."
          );
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("فشل في التحقق من البيانات. رجاءً تأكد من صحة المعلومات.");
      }
    }
  };

  const reset = () => {
    setForgotPasswordData({
      firstName: "",
      fatherName: "",
      grandFatherName: "",
      lastName: "",
      motherName: "",
      idNumber: "",
      birthDate: "",
    });
    setError("");
    setFieldErrors({});
  };

  return {
    forgotPasswordData,
    error,
    fieldErrors,
    isLoading,
    handleChange,
    handleSubmit,
    reset,
  };
};
