import { useState, useEffect } from 'react';
import { changePassword } from '../../../Api/authApi';
import { getLogo } from '../../../Api/uploadApi';
import { showSuccessMessage, showErrorMessage } from '../../../components/sweetalertUtils';
import { Modal } from '../../../components/shared/Modal';
import { Input } from '../../../components/shared/Input';
import { Button } from '../../../components/shared/Button';
import { Logo } from '../../../components/shared/Logo';
import { ChangePasswordSkeleton } from '../../../components/shared/Skeleton';
import { PasswordRequirements } from '../../../components/shared/PasswordRequirements';
import { SecurityTips } from '../../../components/shared/SecurityTips';
import { PasswordStrengthIndicator } from '../../../components/shared/PasswordStrengthIndicator';
import { validatePassword, calculatePasswordStrength } from '../../../utils/passwordValidation';
import { Lock, CheckCircle2, XCircle } from 'lucide-react';
import type {
  ChangePasswordModalProps,
  ChangePasswordFormData,
  PasswordValidationErrors
} from '../types';

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<PasswordValidationErrors>(
    {}
  );
  const [step, setStep] = useState(1);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({
    score: 0,
    label: '',
    color: 'bg-gray-300',
  });

  // Load Logo
  useEffect(() => {
    const fetchLogo = async () => {
      setLogoLoading(true);
      try {
        const data = await getLogo();
        if (data.success && data.url) {
          setLogoUrl(data.url);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchLogo();
  }, []);

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

        const validation = validatePassword(value);
        if (!validation.isValid) {
          return validation.error || 'كلمة المرور غير صالحة';
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

    // Update password strength for new password
    if (name === 'newPassword') {
      updatePasswordStrength(value);
    }

    // Real-time validation
    const fieldError = validateFieldLocal(name, value);
    setValidationErrors((prev) => ({ ...prev, [name]: fieldError }));
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
    const errors: PasswordValidationErrors = {
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      showCloseButton={true}
      closeOnOverlayClick={true}
      bodyClassName="p-8"
      overlayClassName="bg-black/30"
    >
      {logoLoading ? (
        <ChangePasswordSkeleton />
      ) : (
        <div dir="rtl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Logo
                logoUrl={logoUrl}
                logoLoading={logoLoading}
                size="sm"
                showGlow={false}
                className="!h-20 !w-20"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full p-1.5 shadow-md shadow-emerald-500/50">
                <Lock className="w-4 h-4 text-white" />
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
                <Input
                  label="كلمة المرور الحالية"
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="أدخل كلمة المرور الحالية"
                  autoComplete="current-password"
                  error={validationErrors.currentPassword}
                  showPasswordToggle={true}
                  required
                />

                {/* New Password */}
                <Input
                  label="كلمة المرور الجديدة"
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="أدخل كلمة المرور الجديدة"
                  autoComplete="new-password"
                  error={validationErrors.newPassword}
                  showPasswordToggle={true}
                  required
                />

                {/* Confirm Password */}
                <div>
                  <Input
                    label="تأكيد كلمة المرور الجديدة"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    autoComplete="new-password"
                    error={validationErrors.confirmPassword}
                    showPasswordToggle={true}
                    rightIcon={
                      formData.confirmPassword && !validationErrors.confirmPassword ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : undefined
                    }
                    required
                  />
                </div>

                {/* New Password Details */}
                <div>
                  {/* Password Strength Indicator */}
                  <PasswordStrengthIndicator
                    password={formData.newPassword}
                    score={passwordStrength.score}
                    label={passwordStrength.label}
                    color={passwordStrength.color}
                  />

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
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      fullWidth
                      loading={isLoading}
                      disabled={Object.values(validationErrors).some((e) => e !== '')}
                      leftIcon={
                        <CheckCircle2 className="w-4 h-4" />
                      }
                      gradient={true}
                    >
                      {isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={() => onClose()}
                      disabled={isLoading}
                      leftIcon={
                        <XCircle className="w-4 h-4" />
                      }
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </div>

              {/* Left Column - Password Requirements */}
              <div className="space-y-6">
                {/* Password Requirements - Reusable Component */}
                <PasswordRequirements password={formData.newPassword} />

                {/* Security Tips */}
                <SecurityTips />
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
  
export default ChangePasswordModal;
