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
  userType: "teacher";
  rememberMe?: boolean;
}

export interface AdminLoginData {
  adminId: string;
  password: string;
  userType: "admin";
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
    role: "student" | "teacher" | "admin";
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
  isVisible: boolean; // في React Native نستخدم isVisible بدلاً من isOpen
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

// ============================================================================
// CHANGE PASSWORD TYPES - أنواع تغيير كلمة المرور
// ============================================================================

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  userId: string;
  userType: "student" | "teacher" | "admin";
}

// ============================================================================
// RESET PASSWORD TYPES - أنواع إعادة تعيين كلمة المرور
// ============================================================================

export interface ResetPasswordFormData {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  lastName: string;
  motherName: string;
  idNumber: string;
  birthDate: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyIdentityData {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  lastName: string;
  motherName: string;
  idNumber: string;
  birthDate: string;
}

// ============================================================================
// AUTH CONTEXT TYPES
// ============================================================================

export interface AuthUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  name?: string;
  role: "student" | "teacher" | "admin";
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
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => Promise<void>;
}
