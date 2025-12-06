import { useState } from 'react';
import axios from 'axios';
import { forgotPassword } from '@/Api/authApi';
import { validateForgotPasswordData } from '@/Validation/forgotPasswordValidation';
import type {
  ForgotPasswordFormData,
  FieldErrors,
} from '../../types';

export const useForgotPassword = () => {
  const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordFormData>({
    firstName: '',
    fatherName: '',
    grandFatherName: '',
    lastName: '',
    motherName: '',
    idNumber: '',
    birthDate: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // للحقل رقم الهوية، نسمح فقط بالأرقام و 9 أرقام كحد أقصى
    if (name === 'idNumber') {
      // إزالة أي حرف غير رقمي
      const numericValue = value.replace(/\D/g, '');
      // أخذ أول 9 أرقام فقط
      const limitedValue = numericValue.slice(0, 9);

      setForgotPasswordData((prev) => ({
        ...prev,
        [name]: limitedValue,
      }));
    } else {
      setForgotPasswordData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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
    const validation = validateForgotPasswordData(forgotPasswordData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      return;
    }

    setIsLoading(true);

    try {
      console.log('📤 Sending forgot password data:', forgotPasswordData);
      const response = await forgotPassword(forgotPasswordData);
      console.log('📥 Received response:', response);

      if (response.success) {
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false);
        setError(response.message || 'فشل في التحقق من البيانات');
      }
    } catch (error: unknown) {
      console.error('❌ Forgot password error:', error);
      setIsLoading(false);
      if (axios.isAxiosError(error)) {
        console.error('❌ Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        const message = error.response?.data?.message || error.message;
        const errors = error.response?.data?.errors;

        // عرض الأخطاء من Backend
        if (errors && Array.isArray(errors) && errors.length > 0) {
          setError(errors.join('\n'));
        } else {
          setError(message || 'فشل في التحقق من البيانات. رجاءً تأكد من صحة المعلومات.');
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('فشل في التحقق من البيانات. رجاءً تأكد من صحة المعلومات.');
      }
    }
  };

  const reset = () => {
    setForgotPasswordData({
      firstName: '',
      fatherName: '',
      grandFatherName: '',
      lastName: '',
      motherName: '',
      idNumber: '',
      birthDate: '',
    });
    setError('');
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
