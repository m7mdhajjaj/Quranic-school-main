import { useState } from 'react';
import { Modal } from '@/components/UI';
import {
  ModalHeader,
  StepsIndicator,
  VerificationForm,
  NewPasswordForm,
} from './components';
import {
  useForgotPassword,
  useResetPassword,
  usePasswordStrength,
} from './hooks';
import type { ForgotPasswordModalProps, ResetStep } from '../types';

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [resetStep, setResetStep] = useState<ResetStep>(1);

  // استخدام الـ hooks
  const forgotPasswordHook = useForgotPassword();
  const resetPasswordHook = useResetPassword(forgotPasswordHook.forgotPasswordData);
  const passwordStrength = usePasswordStrength(resetPasswordHook.newPasswordData.password);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPasswordHook.handleSubmit(() => {
      setResetStep(2);
    });
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPasswordHook.handleSubmit(() => {
      handleClose();
    });
  };

  const handleClose = () => {
    setResetStep(1);
    forgotPasswordHook.reset();
    resetPasswordHook.reset();
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
      <div dir="rtl" className="space-y-3 sm:space-y-5 p-2 sm:p-0">
        {/* Header */}
        <ModalHeader currentStep={resetStep} onClose={handleClose} />

        {/* Steps Indicator */}
        <StepsIndicator currentStep={resetStep} />

        {/* Forms */}
        {resetStep === 1 ? (
          <VerificationForm
            formData={forgotPasswordHook.forgotPasswordData}
            fieldErrors={forgotPasswordHook.fieldErrors}
            error={forgotPasswordHook.error}
            isLoading={forgotPasswordHook.isLoading}
            onChange={forgotPasswordHook.handleChange}
            onSubmit={handleForgotPasswordSubmit}
            onCancel={handleClose}
          />
        ) : (
          <NewPasswordForm
            formData={resetPasswordHook.newPasswordData}
            fieldErrors={resetPasswordHook.fieldErrors}
            error={resetPasswordHook.error}
            isLoading={resetPasswordHook.isLoading}
            passwordStrength={passwordStrength}
            onChange={resetPasswordHook.handleChange}
            onSubmit={handleNewPasswordSubmit}
            onCancel={handleClose}
          />
        )}
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
