/**
 * ملف index لتصدير جميع مكونات Auth
 * يسهل الاستيراد من مكان واحد
 */

export { default as ForgotPasswordModal } from './ResetPassword/ForgotPasswordModal';
export { default as LoginPage } from './Login';
export { default as ChangePasswordPage } from './ChangePass';

// تصدير الأنواع (Types)
export type {
  ForgotPasswordModalProps,
  ForgotPasswordFormData,
  NewPasswordData,
  FieldErrors,
  ResetStep,
} from './types';
