import { useState, useEffect } from 'react';
import { changePassword } from '../Api/authApi';
import { showSuccessMessage, showErrorMessage } from '../utils/sweetalertUtils';
import { validatePasswordStrength } from '../utils/commonValidation';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
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
  requirements: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: 'text-gray-400',
    requirements: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
    },
  });

  // Handle ESC key to close modal and form reset
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
        color: 'text-gray-400',
        requirements: {
          length: false,
          lowercase: false,
          uppercase: false,
          number: false,
          special: false,
        },
      });
    }
  }, [isOpen]);

  // Update password strength bar width dynamically
  useEffect(() => {
    const strengthBar = document.querySelector('[data-width]') as HTMLElement;
    if (strengthBar) {
      strengthBar.style.width = `${passwordStrength.score * 25}%`;
    }
  }, [passwordStrength.score]);

  // Password strength calculator
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 4,
      lowercase: /[a-z\u0600-\u06FF]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    // استخدام القواعد الجديدة
    const validation = validatePasswordStrength(password);

    let score = 0;
    let label = '';
    let color = '';

    if (password.length === 0) {
      score = 0;
      label = '';
      color = 'bg-gray-300';
    } else if (!validation.isValid) {
      score = 25;
      label = 'ضعيفة جداً';
      color = 'bg-red-500';
    } else {
      switch (validation.strength) {
        case 'weak':
          score = 50;
          label = 'ضعيفة';
          color = 'bg-orange-500';
          break;
        case 'medium':
          score = 75;
          label = 'جيدة';
          color = 'bg-yellow-500';
          break;
        case 'strong':
          score = 100;
          label = 'ممتازة';
          color = 'bg-green-500';
          break;
      }
    }

    return { score, label, color, requirements };
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

  // Validate field
  const validateFieldLocal = (name: string, value: string): string => {
    switch (name) {
      case 'currentPassword': {
        if (!value) return 'كلمة المرور الحالية مطلوبة';
        if (value.length < 1) return 'كلمة المرور الحالية مطلوبة';
        return '';
      }

      case 'newPassword': {
        if (!value) return 'كلمة المرور الجديدة مطلوبة';

        // استخدام القواعد الجديدة
        const validation = validatePasswordStrength(value);
        if (!validation.isValid) {
          return validation.errors[0] || 'كلمة المرور غير صالحة';
        }

        if (value === formData.currentPassword)
          return 'يجب أن تكون مختلفة عن الحالية';
        return '';
      }

      case 'confirmPassword': {
        if (!value) return 'تأكيد كلمة المرور مطلوب';
        if (value !== formData.newPassword) return 'كلمة المرور غير متطابقة';
        return '';
      }

      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Calculate password strength for new password
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Real-time validation
    const fieldError = validateFieldLocal(name, value);
    setValidationErrors((prev) => ({ ...prev, [name]: fieldError }));

    // Clear any existing messages (handled by SweetAlert now)
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldError = validateFieldLocal(name, value);
    setValidationErrors({
      ...validationErrors,
      [name]: fieldError,
    });
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      currentPassword: validateFieldLocal(
        'currentPassword',
        formData.currentPassword
      ),
      newPassword: validateFieldLocal('newPassword', formData.newPassword),
      confirmPassword: validateFieldLocal(
        'confirmPassword',
        formData.confirmPassword
      ),
    };

    setValidationErrors(errors);
    return !Object.values(errors).some((error) => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
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
          requirements: {
            length: false,
            lowercase: false,
            uppercase: false,
            number: false,
            special: false,
          },
        });
        setValidationErrors({});
        setStep(1);

        // Show success message with SweetAlert
        showSuccessMessage('تم بنجاح! ✅', 'تم تغيير كلمة المرور بنجاح').then(
          () => {
            onClose();
          }
        );
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
          setValidationErrors({
            ...validationErrors,
            currentPassword: 'كلمة المرور الحالية غير صحيحة'
          });
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

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay - Less transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        dir="rtl"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose(); // Close modal when clicking backdrop
          }
        }}
      >
        {/* Modal Container - Wide and less transparent */}
        <div
          className="bg-gradient-to-br from-white/90 to-white/85 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-4xl border border-white/50 relative animate-fadeIn transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src="/src/images/logo.jpg"
                alt="مدرسة القرآن"
                className="h-20 w-20 rounded-full border-4 border-emerald-600 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full p-1.5 shadow-md">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            تغيير كلمة المرور
          </h1>
          <p className="text-center text-gray-600 text-sm mb-8">
            يرجى إدخال كلمة المرور الحالية والجديدة
          </p>

          <form onSubmit={handleSubmit} className="text-right">
            {/* Hidden username field for accessibility */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              className="hidden"
              readOnly
              value=""
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Right Column - Password Fields */}
              <div className="space-y-5">
                {/* Current Password */}
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-800 mb-2"
                    htmlFor="currentPassword"
                  >
                    كلمة المرور الحالية
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border text-right ${
                        validationErrors.currentPassword
                          ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 bg-white focus:ring-emerald-500 focus:border-emerald-500'
                      } text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300`}
                      placeholder="أدخل كلمة المرور الحالية"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    >
                      {showCurrentPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.currentPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {validationErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-800 mb-2"
                    htmlFor="newPassword"
                  >
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border text-right ${
                        validationErrors.newPassword
                          ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 bg-white focus:ring-emerald-500 focus:border-emerald-500'
                      } text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300`}
                      placeholder="أدخل كلمة المرور الجديدة"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    >
                      {showNewPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-800 mb-2"
                    htmlFor="confirmPassword"
                  >
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white text-right ${
                        validationErrors.confirmPassword
                          ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                          : formData.confirmPassword &&
                              !validationErrors.confirmPassword
                            ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
                            : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                      } text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300`}
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                    {formData.confirmPassword &&
                      !validationErrors.confirmPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* New Password Details */}
                <div>
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-700">
                          قوة كلمة المرور:
                        </span>
                        <span
                          className={`text-xs font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300 ease-out rounded-full`}
                          data-width={passwordStrength.score * 25}
                        />
                      </div>
                    </div>
                  )}

                  {validationErrors.newPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {validationErrors.newPassword}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        Object.values(validationErrors).some((e) => e !== '')
                      }
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          جاري التغيير...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          تغيير كلمة المرور
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onClose()}
                      disabled={isLoading}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        إلغاء
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Left Column - Password Requirements */}
              <div className="space-y-6">
                {/* Password Requirements */}
                <div className="p-4 bg-emerald-50/80 backdrop-blur-sm rounded-lg border border-emerald-200/50">
                  <p className="text-sm font-semibold text-emerald-900 mb-3">
                    متطلبات كلمة المرور الجديدة:
                  </p>
                  <ul className="space-y-2 text-sm text-emerald-800">
                    <li
                      className={`flex items-center gap-2 ${formData.newPassword.length >= 4 ? 'text-green-600' : ''}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${formData.newPassword.length >= 4 ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      4 أحرف على الأقل
                    </li>
                    <li
                      className={`flex items-center gap-2 ${(formData.newPassword.match(/\d/g) || []).length >= 4 ? 'text-green-600' : ''}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${(formData.newPassword.match(/\d/g) || []).length >= 4 ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      أو 4 أرقام على الأقل
                    </li>
                    <li
                      className={`flex items-center gap-2 ${(formData.newPassword.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length >= 3 && /\d/.test(formData.newPassword) ? 'text-green-600' : ''}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${(formData.newPassword.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length >= 3 && /\d/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      3 حروف مع أرقام
                    </li>
                    <li
                      className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'text-green-600' : ''}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      رموز خاصة (اختياري للقوة)
                    </li>
                  </ul>
                </div>

                {/* Security Tips */}
                <div className="p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">
                        نصائح الأمان
                      </h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• لا تشارك كلمة المرور مع أي شخص</li>
                        <li>• استخدم كلمة مرور فريدة لكل حساب</li>
                        <li>• غيّر كلمة المرور بانتظام</li>
                        <li>• استخدم أحرف وأرقام ورموز متنوعة</li>
                        <li>• تجنب المعلومات الشخصية الواضحة</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Close Button - RTL positioned */}
          <button
            type="button"
            onClick={() => onClose()}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-200/80 hover:bg-gray-300/80 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 border border-gray-300/50"
            aria-label="إغلاق"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }

        .animate-pulse-slow {
          animation: pulse 2s infinite;
        }

        input:focus {
          animation: pulse 0.3s ease-out;
        }

        button:active:not(:disabled) {
          animation: none;
        }

        .error-shake {
          animation: shake 0.5s;
        }
      `}</style>
      </div>
    </>
  );
};

export default ChangePasswordModal;
