import { useState } from 'react';
import axios from 'axios';
import { Lock, CheckCircle, Key } from 'lucide-react';
import { forgotPassword, resetPassword } from '../../../Api/authApi';
import {
  validateForgotPasswordData,
  validateResetPasswordData,
} from '../../../Validation/forgotPasswordValidation';
import { showSuccessMessage, showErrorMessage } from '../../../components/utils/sweetalertUtils';
import { Modal, Button, Input, Alert, PasswordRequirements, PasswordStrengthIndicator } from '../../../components/shared';
import type {
  ForgotPasswordModalProps,
  ForgotPasswordFormData,
  NewPasswordData,
  FieldErrors,
  ResetStep
} from '../types';

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordFormData>({
    firstName: '',
    fatherName: '',
    grandFatherName: '',
    lastName: '',
    motherName: '',
    idNumber: '',
    birthDate: '',
  });
  const [resetStep, setResetStep] = useState<ResetStep>(1);
  const [newPasswordData, setNewPasswordData] = useState<NewPasswordData>({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // حساب قوة كلمة المرور
  const calculatePasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-300' };

    let score = 0;
    const numberCount = (password.match(/[\d٠-٩]/g) || []).length;
    const letterCount = (password.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // الطول
    if (password.length >= 4) score += 25;
    if (password.length >= 8) score += 15;
    if (password.length >= 12) score += 10;

    // الأحرف والأرقام
    if (letterCount >= 3 && numberCount >= 1) score += 25;
    if (numberCount >= 4) score += 15;
    
    // التنوع
    if (letterCount > 0 && numberCount > 0) score += 10;
    if (hasSpecialChars) score += 15;

    // تحديد التصنيف واللون
    if (score >= 75) return { score, label: 'قوية جداً', color: 'bg-green-600' };
    if (score >= 50) return { score, label: 'قوية', color: 'bg-green-500' };
    if (score >= 25) return { score, label: 'متوسطة', color: 'bg-yellow-500' };
    return { score, label: 'ضعيفة', color: 'bg-red-500' };
  };

  const passwordStrength = calculatePasswordStrength(newPasswordData.password);

  const handleForgotPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const response = await forgotPassword(forgotPasswordData);

      if (response.success) {
        setIsLoading(false);
        setResetStep(2);
        await showSuccessMessage(
          'تم التحقق بنجاح',
          'تم التحقق من بياناتك بنجاح. يمكنك الآن إدخال كلمة المرور الجديدة'
        );
      } else {
        setIsLoading(false);
        await showErrorMessage(
          'فشل التحقق',
          response.message || 'فشل في التحقق من البيانات'
        );
      }
    } catch (error: unknown) {
      console.error('Forgot password error:', error);
      setIsLoading(false);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        await showErrorMessage(
          'فشل التحقق',
          message || 'فشل في التحقق من البيانات. رجاءً تأكد من صحة المعلومات.'
        );
      } else if (error instanceof Error) {
        await showErrorMessage('خطأ', error.message);
      } else {
        await showErrorMessage(
          'خطأ',
          'فشل في التحقق من البيانات. رجاءً تأكد من صحة المعلومات.'
        );
      }
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        await showSuccessMessage(
          'تم بنجاح',
          'تم تغيير كلمة المرور بنجاح!'
        );
        handleClose();
      } else {
        setIsLoading(false);
        await showErrorMessage(
          'فشل العملية',
          response.message || 'فشل في تغيير كلمة المرور'
        );
      }
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      setIsLoading(false);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        await showErrorMessage(
          'فشل العملية',
          message || 'فشل في تغيير كلمة المرور. رجاءً المحاولة مرة أخرى.'
        );
      } else if (error instanceof Error) {
        await showErrorMessage('خطأ', error.message);
      } else {
        await showErrorMessage(
          'خطأ',
          'فشل في تغيير كلمة المرور. رجاءً المحاولة مرة أخرى.'
        );
      }
    }
  };

  const handleClose = () => {
    setResetStep(1);
    setForgotPasswordData({
      firstName: '',
      fatherName: '',
      grandFatherName: '',
      lastName: '',
      motherName: '',
      idNumber: '',
      birthDate: '',
    });
    setNewPasswordData({
      password: '',
      confirmPassword: '',
    });
    setError('');
    setFieldErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      closeOnOverlayClick={false}
      showCloseButton={false}
      overlayClassName="backdrop-blur-sm"
    >
      <div dir="rtl" className="space-y-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                استعادة كلمة المرور
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {resetStep === 1
                  ? 'التحقق من هويتك للمتابعة'
                  : 'إنشاء كلمة مرور جديدة وآمنة'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-300 p-2.5 rounded-xl hover:bg-gray-100 hover:rotate-90 transform"
            aria-label="إغلاق"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-4 shadow-inner">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className={`relative transition-all duration-500 ${resetStep >= 1 ? 'scale-110' : 'scale-100'}`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-500 ${
                  resetStep >= 1
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-300'
                    : 'bg-white text-gray-400 border-2 border-gray-300'
                }`}
              >
                {resetStep > 1 ? (
                  <CheckCircle className="w-7 h-7" />
                ) : (
                  <span>1</span>
                )}
              </div>
              {resetStep >= 1 && (
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur opacity-30 animate-pulse"></div>
              )}
            </div>
            <div className="text-center">
              <p
                className={`font-bold text-base transition-colors duration-300 ${resetStep >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}
              >
                التحقق من الهوية
              </p>
              <p className="text-xs text-gray-500">أدخل بياناتك الشخصية</p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center">
            <div
              className={`h-2 w-32 rounded-full transition-all duration-700 relative shadow-sm ${
                resetStep >= 2
                  ? 'bg-gradient-to-l from-emerald-500 to-teal-500'
                  : 'bg-gray-300'
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-700 absolute left-0 ${
                  resetStep >= 2 ? 'bg-white w-1/2 animate-shimmer shadow-md' : 'w-0'
                }`}
              ></div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className={`relative transition-all duration-500 ${resetStep >= 2 ? 'scale-110' : 'scale-100'}`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-500 ${
                  resetStep >= 2
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-300'
                    : 'bg-white text-gray-400 border-2 border-gray-300'
                }`}
              >
                {resetStep >= 2 ? <Key className="w-7 h-7" /> : <span>2</span>}
              </div>
              {resetStep >= 2 && (
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur opacity-30 animate-pulse"></div>
              )}
            </div>
            <div className="text-center">
              <p
                className={`font-bold text-base transition-colors duration-300 ${resetStep >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}
              >
                كلمة المرور الجديدة
              </p>
              <p className="text-xs text-gray-500">إنشاء كلمة مرور آمنة</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Forms */}
        {resetStep === 1 ? (
          <form className="space-y-4" onSubmit={handleForgotPasswordSubmit}>
            <Alert variant="info">
              <p className="text-sm font-medium">معلومة هامة</p>
              <p className="text-xs mt-1">
                الرجاء إدخال بياناتك الشخصية بدقة كما هي مسجلة في النظام للتحقق
                من هويتك
              </p>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="الاسم الأول"
                name="firstName"
                value={forgotPasswordData.firstName}
                onChange={handleForgotPasswordChange}
                error={fieldErrors.firstName}
                placeholder="أدخل الاسم الأول"
                required
              />
              <Input
                label="اسم الأب"
                name="fatherName"
                value={forgotPasswordData.fatherName}
                onChange={handleForgotPasswordChange}
                error={fieldErrors.fatherName}
                placeholder="أدخل اسم الأب"
                required
              />
              <Input
                label="اسم الجد"
                name="grandFatherName"
                value={forgotPasswordData.grandFatherName}
                onChange={handleForgotPasswordChange}
                error={fieldErrors.grandFatherName}
                placeholder="أدخل اسم الجد"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="اسم العائلة"
                name="lastName"
                value={forgotPasswordData.lastName}
                onChange={handleForgotPasswordChange}
                error={fieldErrors.lastName}
                placeholder="أدخل اسم العائلة"
                required
              />
              <Input
                label="اسم الأم"
                name="motherName"
                value={forgotPasswordData.motherName}
                onChange={handleForgotPasswordChange}
                error={fieldErrors.motherName}
                placeholder="أدخل اسم الأم الكامل"
                required
              />
              <Input
                label="رقم الهوية"
                name="idNumber"
                type="text"
                value={forgotPasswordData.idNumber}
                onChange={handleForgotPasswordChange}
                error={fieldErrors.idNumber}
                placeholder="أدخل رقم الهوية (9 أرقام)"
                maxLength={9}
                required
              />
            </div>

            <Input
              label="تاريخ الميلاد"
              name="birthDate"
              type="date"
              value={forgotPasswordData.birthDate}
              onChange={handleForgotPasswordChange}
              error={fieldErrors.birthDate}
              placeholder="أدخل تاريخ الميلاد"
              required
            />

            <div className="flex gap-4 pt-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                loading={isLoading}
                leftIcon={
                  !isLoading && (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )
                }
              >
                {isLoading ? 'جارٍ التحقق...' : 'تحقق من البيانات'}
              </Button>

              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                size="md"
                className="px-6"
              >
                إلغاء
              </Button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleNewPasswordSubmit}>
            <Alert variant="success">
              <p className="text-sm font-bold">تم التحقق من هويتك بنجاح!</p>
              <p className="text-xs mt-1">
                يمكنك الآن إنشاء كلمة مرور جديدة وآمنة لحسابك
              </p>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <PasswordRequirements 
                  password={newPasswordData.password}
                  className="animate-fadeIn h-full"
                />
              </div>
              <div className="flex items-center">
                <div className="w-full p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-lg border border-emerald-200/50 h-full flex flex-col justify-center">
                  <p className="text-sm font-semibold text-emerald-900 mb-3 text-center">
                    مؤشر القوة
                  </p>
                  <PasswordStrengthIndicator
                    password={newPasswordData.password}
                    score={passwordStrength.score}
                    label={passwordStrength.label}
                    color={passwordStrength.color}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="كلمة المرور الجديدة"
                name="password"
                type="password"
                value={newPasswordData.password}
                onChange={handleNewPasswordChange}
                error={fieldErrors.password}
                placeholder="أدخل كلمة المرور الجديدة (4 أحرف على الأقل)"
                minLength={4}
                showPasswordToggle
                required
              />

              <Input
                label="تأكيد كلمة المرور"
                name="confirmPassword"
                type="password"
                value={newPasswordData.confirmPassword}
                onChange={handleNewPasswordChange}
                error={fieldErrors.confirmPassword}
                placeholder="أعد إدخال كلمة المرور للتأكيد"
                minLength={4}
                showPasswordToggle
                required
              />
            </div>

            <div className="flex gap-4 pt-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                loading={isLoading}
                leftIcon={
                  !isLoading && (
                    <Key className="w-5 h-5" />
                  )
                }
              >
                {isLoading ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
              </Button>

              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                size="md"
                className="px-6"
              >
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
