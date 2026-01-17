import api from "./api";

// ============================================================================
// Authentication API
// ============================================================================

interface LoginStudentRequest {
  studentId: string;
  idNumber: string;
  rememberMe?: boolean;
}

interface LoginTeacherRequest {
  teacherId: string;
  password: string;
  userType: "teacher";
  rememberMe?: boolean;
}

interface LoginAdminRequest {
  adminId: string;
  password: string;
  userType: "admin";
  rememberMe?: boolean;
}

interface LoginSecretaryRequest {
  secretaryId: string;
  password: string;
  userType: "secretary";
  rememberMe?: boolean;
}

interface LoginTeacherAssistantRequest {
  assistantId: string;
  password: string;
  userType: "teacherAssistant";
  rememberMe?: boolean;
}

interface VerifyIdentityRequest {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  lastName: string;
  motherName: string;
  idNumber: string;
  birthDate: string;
}

interface ForgotPasswordRequest {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  lastName: string;
  motherName: string;
  idNumber: string;
  birthDate: string;
}

interface ResetPasswordRequest {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  lastName: string;
  motherName: string;
  idNumber: string;
  birthDate: string;
  newPassword: string;
  confirmPassword?: string;
}

interface AuthResponse {
  success: boolean;
  user: Record<string, unknown>;
  token: string;
  message?: string;
}

// Student Login
export const loginStudent = async (
  data: LoginStudentRequest
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data, {
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// Teacher Login
export const loginTeacher = async (
  data: LoginTeacherRequest
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// Admin Login
export const loginAdmin = async (
  data: LoginAdminRequest
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// Secretary Login
export const loginSecretary = async (
  data: LoginSecretaryRequest
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// Teacher Assistant Login
export const loginTeacherAssistant = async (
  data: LoginTeacherAssistantRequest
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// Verify Identity (Step 1 of forgot password)
export const verifyIdentity = async (data: VerifyIdentityRequest) => {
  const response = await api.post("/auth/verify-identity", data);
  return response.data;
};

// Forgot Password (Deprecated - use verifyIdentity instead)
export const forgotPassword = async (data: ForgotPasswordRequest) => {
  const response = await api.post("/auth/verify-identity", data);
  return response.data;
};

// Reset Password (Step 2 - requires all data + new password)
export const resetPassword = async (data: ResetPasswordRequest) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

// Verify Token
export const verifyToken = async () => {
  const response = await api.get("/auth/verify");
  return response.data;
};

// Change Password
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  userId: string;
  userType: "student" | "teacher" | "admin";
}

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};
