/**
 * ============================================================================
 * AUTH TYPES - أنواع صفحات المصادقة
 * ============================================================================
 * يحتوي هذا الملف على جميع الـ types الخاصة بملفات Auth
 */

// ============================================================================
// LOGIN TYPES - أنواع تسجيل الدخول
// ============================================================================

export interface LoginFormData {
  userId: string;
  password: string;
}

export interface LoginCredentials {
  userId: string;
  password: string;
}

export interface StudentLoginData {
  studentId: string;
  idNumber: string;
  rememberMe?: boolean;
}

export interface TeacherLoginData {
  teacherId: string;
  password: string;
  userType: 'teacher';
  rememberMe?: boolean;
}

export interface AdminLoginData {
  adminId: string;
  password: string;
  userType: 'admin';
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    fatherName?: string;
    name?: string;
    role: 'student' | 'teacher' | 'admin';
    email?: string;
    studentId?: string;
    teacherId?: string;
    adminId?: string;
    group?: string;
    imageUrl?: string;
    avatar?: {
      url?: string;
      publicId?: string;
    };
    isActive?: boolean;
  };
  token?: string;
  message?: string;
}

// ============================================================================
// FORGOT PASSWORD MODAL TYPES - أنواع نافذة نسيان كلمة المرور
// ============================================================================

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ForgotPasswordFormData {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  lastName: string;
  motherName: string;
  idNumber: string;
  birthDate: string;
}

export interface ForgotPasswordData {
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

export interface ResetPasswordData extends ForgotPasswordData {
  newPassword: string;
  confirmPassword: string;
}

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

export interface ForgotPasswordValidationResult {
  isValid: boolean;
  errors: {
    firstName?: string;
    fatherName?: string;
    grandFatherName?: string;
    lastName?: string;
    motherName?: string;
    idNumber?: string;
    birthDate?: string;
    password?: string;
    confirmPassword?: string;
  };
}

// ============================================================================
// CHANGE PASSWORD MODAL TYPES - أنواع نافذة تغيير كلمة المرور
// ============================================================================

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  userId: string;
  userType: 'student' | 'teacher' | 'admin';
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface PasswordValidationErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface PasswordStrength {
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

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

// ============================================================================
// AUTHENTICATION STATE TYPES - أنواع حالة المصادقة
// ============================================================================

export interface AuthState {
  isLoading: boolean;
  error: string;
  rememberMe: boolean;
  failedAttempts: number;
  showPassword: boolean;
  showForgotPasswordModal: boolean;
}

export interface SavedCredentials {
  userId: string;
  password: string;
}

// ============================================================================
// LOGO TYPES - أنواع الشعار
// ============================================================================

export interface LogoData {
  success: boolean;
  url?: string;
  message?: string;
}

// ============================================================================
// FIELD ERROR TYPES - أنواع أخطاء الحقول
// ============================================================================

export type FieldErrors = Record<string, string>;

export interface FormFieldError {
  field: string;
  message: string;
}

// ============================================================================
// VALIDATION TYPES - أنواع التحقق
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: FieldErrors;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
}

// ============================================================================
// UTILITY TYPES - أنواع مساعدة
// ============================================================================

export type UserType = 'student' | 'teacher' | 'admin';
export type ResetStep = 1 | 2;
export type PasswordVisibility = {
  current: boolean;
  new: boolean;
  confirm: boolean;
};

// جميع الـ types تم تصديرها بالأعلى بشكل مباشر
