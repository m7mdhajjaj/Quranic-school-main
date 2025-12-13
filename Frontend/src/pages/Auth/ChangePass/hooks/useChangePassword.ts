import { useState, useEffect } from 'react';
import { changePassword } from "@/Api/authApi";
import { showErrorMessage } from "@/components/utils/sweetalertUtils";
import { showSuccessToast } from "@/components/utils/toastUtils";
import { 
  validatePassword, 
  calculatePasswordStrength,
  validateChangePassword,
  type ChangePasswordFormData 
} from "@/Validation/ChangePassValdation";
import type { PasswordValidationErrors } from '../../types';

interface UseChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export const useChangePassword = ({ isOpen, onClose }: UseChangePasswordProps) => {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<PasswordValidationErrors>({});
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: 'bg-gray-300',
  });

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setValidationErrors({});
      setStep(1);
      setPasswordStrength({
        score: 0,
        label: '',
        color: 'bg-gray-300',
      });
    }
  }, [isOpen]);

  // Update password strength
  const updatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: 'bg-gray-300' });
      return;
    }

    const { strength, score } = calculatePasswordStrength(password);
    
    let label = '';
    let color = 'bg-gray-300';

    switch (strength) {
      case 'weak':
        label = 'ضعيفة';
        color = 'bg-red-500';
        break;
      case 'medium':
        label = 'جيدة';
        color = 'bg-yellow-500';
        break;
      case 'strong':
        label = 'ممتازة';
        color = 'bg-green-500';
        break;
    }

    setPasswordStrength({ score, label, color });
  };

  // Auto-advance steps
  useEffect(() => {
    if (
      step === 1 &&
      formData.currentPassword &&
      !validationErrors.currentPassword
    ) {
      setTimeout(() => setStep(2), 500);
    }
    if (step === 2 && formData.newPassword && passwordStrength.score >= 75) {
      setTimeout(() => setStep(3), 500);
    }
  }, [step, formData, validationErrors, passwordStrength]);

  // Validate field using Yup (async for blur events)
  const validateField = async (name: string, value: string): Promise<string> => {
    // For real-time validation, we validate the field in context
    const tempFormData = { ...formData, [name]: value };
    
    try {
      // Validate the entire form using Yup schema to get field-specific errors
      const validation = await validateChangePassword(tempFormData);
      
      if (!validation.isValid && validation.errors) {
        return validation.errors[name] || '';
      }
      
      return '';
    } catch (error) {
      console.error('Validation error:', error);
      return '';
    }
  };

  // Synchronous validation for real-time feedback (uses Yup validateSync)
  const validateFieldSync = (name: string, value: string): string => {
    // Use validatePassword for newPassword field (sync)
    if (name === 'newPassword') {
      if (!value) return 'كلمة المرور الجديدة مطلوبة';
      
      const validation = validatePassword(value);
      if (!validation.isValid) {
        return validation.error || 'كلمة المرور غير صالحة';
      }
      
      // Check if new password is different from current
      if (value === formData.currentPassword) {
        return 'يجب أن تكون مختلفة عن كلمة المرور الحالية';
      }
      
      return '';
    }
    
    // For other fields, use basic validation
    if (name === 'currentPassword') {
      if (!value) return 'كلمة المرور الحالية مطلوبة';
      if (value.length < 1) return 'كلمة المرور الحالية مطلوبة';
      return '';
    }
    
    if (name === 'confirmPassword') {
      if (!value) return 'تأكيد كلمة المرور مطلوب';
      if (value !== formData.newPassword) return 'كلمة المرور غير متطابقة';
      return '';
    }
    
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update password strength for new password
    if (name === 'newPassword') {
      updatePasswordStrength(value);
    }

    // Real-time validation using sync validation
    const fieldError = validateFieldSync(name, value);
    setValidationErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldError = await validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const validateForm = async (): Promise<boolean> => {
    const validation = await validateChangePassword(formData);
    
    if (!validation.isValid && validation.errors) {
      setValidationErrors(validation.errors);
      return false;
    }
    
    setValidationErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form using Yup
    const isValid = await validateForm();
    if (!isValid) {
      showErrorMessage('خطأ في النموذج! ❌', 'يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');

      if (!token || !userJson) {
        showErrorMessage('خطأ في الدخول! ❌', 'يجب تسجيل الدخول أولاً').then(
          () => {
            onClose();
          }
        );
        return;
      }

      const user = JSON.parse(userJson);

      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        userId: user._id,
        userType: user.role || 'student',
      });

      if (response.success) {
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordStrength({
          score: 0,
          label: '',
          color: 'bg-gray-300',
        });
        setValidationErrors({});
        setStep(1);

        // Show success message with Toast
        showSuccessToast('تم تغيير كلمة المرور بنجاح ✅');
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: unknown) {
      console.error('Change password error:', error);

      let errorMessage = 'حدث خطأ أثناء تغيير كلمة المرور';

      // Type-safe error handling
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 400) {
          // Handle bad request - usually wrong current password
          errorMessage = 'كلمة المرور الحالية غير صحيحة';
          // Set validation error for current password field
          setValidationErrors((prev) => ({
            ...prev,
            currentPassword: 'كلمة المرور الحالية غير صحيحة'
          }));
          showErrorMessage('خطأ في كلمة المرور! ❌', errorMessage);
          return;
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى';
          showErrorMessage('خطأ في الجلسة! ❌', errorMessage).then(() => {
            onClose();
          });
          return;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else {
          errorMessage = `خطأ من الخادم: ${axiosError.response?.status || 'غير معروف'}`;
        }
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'request' in error
      ) {
        errorMessage = 'لا يمكن الوصول إلى الخادم. تأكد من أن الخادم يعمل';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Show error message with SweetAlert
      showErrorMessage('فشل تغيير كلمة المرور! ❌', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    validationErrors,
    step,
    passwordStrength,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};
