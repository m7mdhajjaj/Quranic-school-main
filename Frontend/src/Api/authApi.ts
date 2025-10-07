import api from './api';

// ============================================================================
// Authentication API
// ============================================================================

interface LoginStudentRequest {
  studentId: string;
  idNumber: string;
}

interface LoginTeacherRequest {
  teacherId: string;
  password: string;
  userType: 'teacher';
}

interface LoginAdminRequest {
  adminId: string;
  password: string;
  userType: 'admin';
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
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  success: boolean;
  user: any;
  token: string;
  message?: string;
}

// Student Login
export const loginStudent = async (data: LoginStudentRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data, {
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

// Teacher Login
export const loginTeacher = async (data: LoginTeacherRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// Admin Login
export const loginAdmin = async (data: LoginAdminRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// Forgot Password
export const forgotPassword = async (data: ForgotPasswordRequest) => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

// Reset Password
export const resetPassword = async (data: ResetPasswordRequest) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

// Verify Token
export const verifyToken = async () => {
  const response = await api.get('/auth/verify');
  return response.data;
};

// Change Password
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  userId: string;
  userType: 'student' | 'teacher' | 'admin';
}

export const changePassword = async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};
