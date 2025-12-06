import { useState } from 'react';
import axios from 'axios';
import { resetPassword } from '@/Api/authApi';
import { validateResetPasswordData } from '@/Validation/forgotPasswordValidation';
import type {
  ForgotPasswordFormData,
  NewPasswordData,
  FieldErrors,
} from '../../types';

export const useResetPassword = (forgotPasswordData: ForgotPasswordFormData) => {
  const [newPasswordData, setNewPasswordData] = useState<NewPasswordData>({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (error) setError('');
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (onSuccess: () => void) => {
    setError('');
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
        setError(response.message || 'فشل في تغيير كلمة المرور');
      }
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      setIsLoading(false);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setError(message || 'فشل في تغيير كلمة المرور. رجاءً المحاولة مرة أخرى.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('فشل في تغيير كلمة المرور. رجاءً المحاولة مرة أخرى.');
      }
    }
  };

  const reset = () => {
    setNewPasswordData({
      password: '',
      confirmPassword: '',
    });
    setError('');
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
