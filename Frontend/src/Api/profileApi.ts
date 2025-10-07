import api from './api';

// ============================================================================
// Profile API
// ============================================================================

export interface UserProfile {
  _id: string;
  idNumber?: string;
  firstName?: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  residence?: string;
  email?: string;
  phoneNumber?: string;
  groups?: string[];
  role?: 'student' | 'teacher' | 'admin';
  createdAt?: string;
  updatedAt?: string;
  age?: number;
  teacherId?: number;
  studentId?: number;
  group?: string;
  teacher?: string;
  avatar?: string;
}

type Endpoint = 'students' | 'teachers' | 'admins';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Get current user profile
export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/profile');
  return response.data;
};

// Update profile
export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.put('/profile', data);
  return response.data;
};

// Upload profile avatar
export const uploadAvatar = async (formData: FormData): Promise<{ avatar: string }> => {
  const response = await api.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Change password (profile specific)
export const changeUserPassword = async (data: ChangePasswordRequest): Promise<{ message: string }> => {
  const response = await api.put('/profile/change-password', data);
  return response.data;
};

// Get user by endpoint and ID
export const getUserById = async (endpoint: Endpoint, userId: string): Promise<UserProfile> => {
  const response = await api.get(`/${endpoint}/${userId}`);
  return response.data?.data ?? response.data;
};

// Update user by endpoint and ID
export const updateUserById = async (
  endpoint: Endpoint,
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> => {
  const response = await api.put(`/${endpoint}/${userId}`, data);
  return response.data?.data ?? response.data;
};

// Get user avatar
export const getUserAvatar = async (endpoint: Endpoint, userId: string): Promise<Blob> => {
  const response = await api.get(`/${endpoint}/${userId}/avatar`, {
    responseType: 'blob',
  });
  return response.data;
};

// Upload user avatar
export const uploadUserAvatar = async (
  endpoint: Endpoint,
  userId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/${endpoint}/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Helper function to determine user endpoint based on role
export const getUserEndpoint = (role?: string): Endpoint => {
  if (role === 'admin' || role?.includes('admin')) return 'admins';
  if (role === 'teacher' || role?.includes('teacher')) return 'teachers';
  return 'students';
};

// Helper function to fetch avatar blob URL
export const fetchAvatarBlobUrl = async (endpoint: Endpoint, userId: string): Promise<string | null> => {
  try {
    const blob = await getUserAvatar(endpoint, userId);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return null;
  }
};

// Get user with multiple endpoint fallback
export const getUserWithFallback = async (userId: string, userRole?: string): Promise<{
  user: UserProfile;
  endpoint: Endpoint;
}> => {
  const endpoints: Endpoint[] = [];
  
  // Try primary endpoint based on role first
  if (userRole === 'admin') endpoints.push('admins');
  if (userRole === 'teacher' || userRole?.includes('teacher')) endpoints.push('teachers');
  endpoints.push('students');
  
  // Add remaining endpoints as fallbacks
  if (!endpoints.includes('teachers')) endpoints.push('teachers');
  if (!endpoints.includes('admins')) endpoints.push('admins');
  
  for (const endpoint of endpoints) {
    try {
      const user = await getUserById(endpoint, userId);
      const role = user.role ?? (endpoint === 'admins' ? 'admin' : endpoint === 'teachers' ? 'teacher' : 'student');
      return { user: { ...user, role: role as 'student' | 'teacher' | 'admin' }, endpoint };
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status !== 404) {
        throw error; // Re-throw non-404 errors
      }
      // Continue to next endpoint for 404 errors
    }
  }
  
  throw new Error('المستخدم غير موجود في أي من قواعد البيانات');
};
