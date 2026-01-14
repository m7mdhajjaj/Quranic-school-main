import { motion, AnimatePresence } from "framer-motion";
import ForgotPasswordModal from "../ResetPassword/ForgotPasswordModal";
import { LoginForm } from "./LoginForm";
import { LoginCard } from "./LoginCard";
import { useLoginLogic, useClickRipples } from "./hooks";
import { AnimatedBackground, ClickRipples, BrandingSection, VerticalDivider } from "./components";

// ============================================================================
// Login Form Section - قسم نموذج تسجيل الدخول
// ============================================================================
interface LoginFormSectionProps {
  formData: { userId: string; password: string };
  error: string;
  isLoading: boolean;
  rememberMe: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

const LoginFormSection = ({
  formData,
  error,
  isLoading,
  rememberMe,
  onFormChange,
  onRememberMeChange,
  onSubmit,
  onForgotPassword,
}: LoginFormSectionProps) => (
  <motion.div
    className="flex-1 flex items-center justify-center lg:justify-start lg:pl-8 w-full max-w-sm lg:max-w-none"
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, delay: 0.2 }}
  >
    <div className="w-full max-w-sm">
      <LoginCard
        error={error}
        success={!error && !isLoading && formData.userId && formData.password}
      >
        <LoginForm
          formData={formData}
          error={error}
          isLoading={isLoading}
          rememberMe={rememberMe}
          onFormChange={onFormChange}
          onRememberMeChange={onRememberMeChange}
          onSubmit={onSubmit}
          onForgotPassword={onForgotPassword}
        />
      </LoginCard>
    </div>
  </motion.div>
);

// ============================================================================
// Main Login Component - مكون تسجيل الدخول الرئيسي
// ============================================================================
const Login = () => {
  // Login logic hook
  const {
    formData,
    error,
    isLoading,
    rememberMe,
    showForgotPasswordModal,
    setShowForgotPasswordModal,
    handleChange,
    handleSubmit,
    handleRememberMeChange,
    logoUrl,
    logoLoading,
  } = useLoginLogic();

  // Click ripple effect hook
  const { ripples, addRipple } = useClickRipples();

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center p-2"
      dir="rtl"
      onClick={addRipple}
    >
      {/* Click Ripples Effect */}
      <ClickRipples ripples={ripples} />

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row items-center lg:items-stretch gap-2 lg:gap-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Branding Section */}
        <BrandingSection logoUrl={logoUrl} logoLoading={logoLoading} />

        {/* Vertical Divider */}
        <VerticalDivider />

        {/* Login Form Section */}
        <LoginFormSection
          formData={formData}
          error={error}
          isLoading={isLoading}
          rememberMe={rememberMe}
          onFormChange={handleChange}
          onRememberMeChange={handleRememberMeChange}
          onSubmit={handleSubmit}
          onForgotPassword={() => setShowForgotPasswordModal(true)}
        />
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <ForgotPasswordModal
            isOpen={showForgotPasswordModal}
            onClose={() => setShowForgotPasswordModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
