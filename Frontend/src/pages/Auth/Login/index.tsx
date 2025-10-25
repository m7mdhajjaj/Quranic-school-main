import ForgotPasswordModal from "../ResetPassword/ForgotPasswordModal";
import { LoginForm } from './LoginForm';
import { WelcomeSection } from './WelcomeSection';
import { AuthBackground } from '../../../components/shared/AuthBackground';
import { LoginCard } from './LoginCard';
import { useLoginLogic } from './useLoginLogic';

const Login = () => {
  const {
    formData,
    error,
    isLoading,
    rememberMe,
    showForgotPasswordModal,
    logoUrl,
    logoLoading,
    handleChange,
    handleRememberMeChange,
    handleSubmit,
    setShowForgotPasswordModal,
  } = useLoginLogic();

  return (
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50"
      dir="rtl">
      <AuthBackground variant="emerald" showPattern={true} />

      {/* Main Content Container - Two Columns */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-16 px-4 sm:px-6 lg:px-8 py-8 lg:py-0">
        
        {/* Right Side - Login Form */}
        <LoginCard>
          <LoginForm
            formData={formData}
            error={error}
            isLoading={isLoading}
            rememberMe={rememberMe}
            onFormChange={handleChange}
            onRememberMeChange={handleRememberMeChange}
            onSubmit={handleSubmit}
            onForgotPassword={() => setShowForgotPasswordModal(true)}
          />
        </LoginCard>

        {/* Left Side - Welcome Content */}
        <WelcomeSection logoUrl={logoUrl} logoLoading={logoLoading} />

      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default Login;
