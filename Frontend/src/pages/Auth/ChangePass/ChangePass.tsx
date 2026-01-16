/**
 * ============================================================================
 * CHANGE PASSWORD MODAL - نافذة تغيير كلمة المرور
 * ============================================================================
 * مكون React محسّن UX/UI لعرض نافذة تغيير كلمة المرور مع:
 * - التحقق اللحظي (Real-time Validation)
 * - Password Strength Indicator
 * - Micro-interactions و Animations
 * - Responsive Design
 */

import { useLogo } from "@/components/Hooks/useLogo";
import { Modal } from "@/components/UI";
import { Input, Button, Logo } from "@/components/UI";
import { 
  PasswordRequirements, 
  SecurityTips, 
  PasswordStrengthIndicator 
} from "@/components/Auth";
import { Lock, CheckCircle2, XCircle, KeyRound } from 'lucide-react';
import { useChangePassword } from './hooks/useChangePassword';
import type { ChangePasswordModalProps } from '../types';

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  // ==========================================================================
  // HOOKS - الـ Hooks
  // ==========================================================================
  const { logoUrl, logoLoading } = useLogo();
  
  const {
    formData,
    isLoading,
    validationErrors,
    passwordStrength,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useChangePassword({ isOpen, onClose });

  // ==========================================================================
  // EARLY RETURN - إرجاع مبكر
  // ==========================================================================
  if (!isOpen) return null;

  // ==========================================================================
  // RENDER - العرض
  // ==========================================================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      showCloseButton={true}
      closeOnOverlayClick={true}
      bodyClassName="p-4 sm:p-6 lg:p-8"
      overlayClassName="bg-black/30 backdrop-blur-sm"
      className="max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4"
    >
      {logoLoading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">جاري التحميل...</p>
        </div>
      ) : (
        <div dir="rtl" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* ================================================================== */}
          {/* HEADER - رأس الصفحة */}
          {/* ================================================================== */}
          <div className="flex flex-col items-center mb-4 sm:mb-6 lg:mb-8">
            {/* Logo with Lock Icon - Animated */}
            <div className="relative mb-3 sm:mb-4 animate-in zoom-in duration-500">
              <Logo
                logoUrl={logoUrl}
                logoLoading={logoLoading}
                size="sm"
                showGlow={false}
                className="!h-14 !w-14 sm:!h-16 sm:!w-16 lg:!h-20 lg:!w-20"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full p-1 sm:p-1.5 shadow-lg shadow-emerald-500/50 animate-pulse">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-center mb-1 sm:mb-2 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-500">
              تغيير كلمة المرور
            </h1>
            
            {/* Subtitle */}
            <p className="text-center text-gray-600 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-500 delay-100 px-4">
              يرجى إدخال كلمة المرور الحالية والجديدة
            </p>
          </div>

          {/* ================================================================== */}
          {/* FORM - النموذج */}
          {/* ================================================================== */}
          <form 
            onSubmit={handleSubmit} 
            className="text-right" 
            dir="rtl"
          >
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

            {/* Form Content Grid - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6" dir="rtl">
              {/* ============================================================== */}
              {/* LEFT COLUMN - العمود الأيسر: حقول كلمة المرور */}
              {/* ============================================================== */}
              <div className="space-y-3 sm:space-y-4 order-2 lg:order-1">
                {/* Current Password Field */}
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 delay-75">
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
                    leftIcon={<KeyRound className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                {/* New Password Field */}
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
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
                    leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 delay-225">
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
                    leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                    rightIcon={
                      formData.confirmPassword && !validationErrors.confirmPassword ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 animate-in zoom-in duration-300" />
                      ) : undefined
                    }
                    required
                  />
                </div>

                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <PasswordStrengthIndicator
                      password={formData.newPassword}
                      score={passwordStrength.score}
                      label={passwordStrength.label}
                      color={passwordStrength.color}
                    />
                  </div>
                )}

                {/* Error Message - Animated */}
                {validationErrors.newPassword && (
                  <div 
                    className="animate-in fade-in slide-in-from-top-2 duration-300"
                    dir="rtl"
                  >
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1.5 sm:gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-[11px] sm:text-xs">{validationErrors.newPassword}</span>
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3" dir="rtl">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={isLoading}
                    disabled={
                      isLoading || 
                      Object.values(validationErrors).some((e) => e !== '') ||
                      !formData.currentPassword ||
                      !formData.newPassword ||
                      !formData.confirmPassword
                    }
                    leftIcon={
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    }
                    gradient={true}
                    className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base py-2 sm:py-2.5"
                  >
                    {isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={onClose}
                    disabled={isLoading}
                    leftIcon={<XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base py-2 sm:py-2.5"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>

              {/* ============================================================== */}
              {/* RIGHT COLUMN - العمود الأيمن: متطلبات ونصائح */}
              {/* ============================================================== */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-6 order-1 lg:order-2">
                {/* Password Requirements - Animated */}
                <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
                  <PasswordRequirements password={formData.newPassword} />
                </div>

                {/* Security Tips - Collapsible */}
                <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-150 hidden sm:block">
                  <SecurityTips collapsible={true} defaultOpen={false} />
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default ChangePasswordModal;
