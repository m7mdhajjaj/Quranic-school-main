/**
 * ============================================================================
 * FORGOT PASSWORD TYPES - أنواع نسيان كلمة المرور
 * ============================================================================
 * يحتوي هذا الملف على جميع الـ types الخاصة بنسيان كلمة المرور
 */

// ============================================================================
// FORM DATA TYPES - أنواع بيانات النماذج
// ============================================================================

export interface ForgotPasswordFormData {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  lastName: string;
  motherName: string;
  idNumber: string;
  birthDate: string;
}

export interface NewPasswordData {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordData extends ForgotPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// RESPONSE TYPES - أنواع الاستجابات
// ============================================================================

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

// ============================================================================
// VALIDATION TYPES - أنواع التحقق
// ============================================================================

export interface FieldErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FieldErrors;
}

// ============================================================================
// PASSWORD STRENGTH TYPES - أنواع قوة كلمة المرور
// ============================================================================

export interface PasswordStrengthResult {
  score: number;
  label: string;
  color: string;
}

// ============================================================================
// MODAL TYPES - أنواع النافذة المنبثقة
// ============================================================================

export type ResetStep = 1 | 2;

export interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

// ============================================================================
// HOOK RETURN TYPES - أنواع إرجاع الـ Hooks
// ============================================================================

export interface UseForgotPasswordReturn {
  forgotPasswordData: ForgotPasswordFormData;
  error: string;
  fieldErrors: FieldErrors;
  isLoading: boolean;
  handleChange: (field: keyof ForgotPasswordFormData, value: string) => void;
  handleSubmit: (onSuccess: () => void) => Promise<void>;
  reset: () => void;
}

export interface UseResetPasswordReturn {
  newPasswordData: NewPasswordData;
  error: string;
  fieldErrors: FieldErrors;
  isLoading: boolean;
  handleChange: (field: keyof NewPasswordData, value: string) => void;
  handleSubmit: (onSuccess: () => void) => Promise<void>;
  reset: () => void;
}
