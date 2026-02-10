import api from "./api";

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
  role?: "student" | "teacher" | "admin" | "secretary" | "teacherAssistant";
  createdAt?: string;
  updatedAt?: string;
  age?: number;
  teacherId?: number;
  studentId?: number;
  secretaryId?: number;
  group?: string;
  teacher?: string;
  avatar?: string;
  permissions?: {
    canManageStudents?: boolean;
    canManageAttendance?: boolean;
    canManageNews?: boolean;
    canViewReports?: boolean;
    canManageTimetable?: boolean;
    canManageMessages?: boolean;
  };
}

type Endpoint =
  | "students"
  | "teachers"
  | "admins"
  | "secretaries"
  | "teacher-assistants";

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Get current user profile
export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get("/profile");
  return response.data;
};

// Update profile
export const updateProfile = async (
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  const response = await api.put("/me", data);
  return response.data;
};

// Upload profile avatar
export const uploadAvatar = async (
  formData: FormData,
): Promise<{ avatar: string }> => {
  const response = await api.post("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Change password (profile specific)
export const changeUserPassword = async (
  data: ChangePasswordRequest,
): Promise<{ message: string }> => {
  const response = await api.put("/profile/change-password", data);
  return response.data;
};

// Get user by endpoint and ID
export const getUserById = async (
  endpoint: Endpoint,
  userId: string,
): Promise<UserProfile> => {
  const response = await api.get(`/${endpoint}/${userId}`);
  return response.data?.data ?? response.data;
};

// Update user by endpoint and ID
export const updateUserById = async (
  endpoint: Endpoint,
  userId: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  const response = await api.put(`/${endpoint}/${userId}`, data);
  return response.data?.data ?? response.data;
};

// Get user avatar URL from Cloudinary
export const getUserAvatar = async (
  endpoint: Endpoint,
  userId: string,
): Promise<{ avatarUrl: string | null }> => {
  try {
    const response = await api.get(`/${endpoint}/${userId}/avatar`);
    return {
      avatarUrl: response.data?.avatarUrl || response.data?.avatar?.url || null,
    };
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return { avatarUrl: null };
  }
};

// Upload user avatar
export const uploadUserAvatar = async (
  endpoint: Endpoint,
  userId: string,
  formData: FormData,
): Promise<{
  success: boolean;
  message: string;
  avatar?: { url: string; publicId: string };
  avatarUrl?: string;
  user?: UserProfile;
}> => {
  const response = await api.post(`/${endpoint}/${userId}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Delete user avatar
export const deleteUserAvatar = async (
  endpoint: Endpoint,
  userId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/${endpoint}/${userId}/avatar`);
  return response.data;
};

// Helper function to determine user endpoint based on role
export const getUserEndpoint = (role?: string): Endpoint => {
  if (role === "admin" || role?.includes("admin")) return "admins";
  // Check teacherAssistant BEFORE teacher to avoid false match
  if (role === "teacherAssistant") return "teacher-assistants";
  if (role === "teacher") return "teachers";
  if (role === "secretary" || role?.includes("secretary")) return "secretaries";
  return "students";
};

// Helper function to fetch avatar URL from Cloudinary
export const fetchAvatarBlobUrl = async (
  endpoint: Endpoint,
  userId: string,
): Promise<string | null> => {
  try {
    const { avatarUrl } = await getUserAvatar(endpoint, userId);
    return avatarUrl;
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return null;
  }
};

// Get current user profile using unified /profile endpoint
export const getUserWithFallback = async (
  userId: string,
  userRole?: string,
): Promise<{
  user: UserProfile;
  endpoint: Endpoint;
}> => {
  try {
    // استخدام الـ unified /profile endpoint - يعمل لجميع الأدوار
    const user = await getProfile();

    // تحديد الـ endpoint بناءً على الـ role
    const role =
      user.role ??
      (userRole as
        | "student"
        | "teacher"
        | "admin"
        | "secretary"
        | "teacherAssistant");
    const endpoint = getUserEndpoint(role);

    return { user: { ...user, role }, endpoint };
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number } };

    // If 404, the user was deleted
    if (axiosError?.response?.status === 404) {
      throw new Error("المستخدم غير موجود - قد يكون تم حذف الحساب");
    }

    // If 401, unauthorized
    if (axiosError?.response?.status === 401) {
      throw error;
    }

    throw error;
  }
};

// Check duplicate field value (real-time validation)
export const checkDuplicateField = async (
  field: "email" | "phoneNumber" | "idNumber",
  value: string,
): Promise<{
  success: boolean;
  isDuplicate: boolean;
  message?: string;
  existingUserType?: string;
  existingUserName?: string;
}> => {
  try {
    const params = new URLSearchParams({ field, value });
    const response = await api.get(`/profile/check-duplicate?${params}`);
    return response.data;
  } catch (error) {
    console.error("خطأ في التحقق من التكرار:", error);
    const axiosError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      isDuplicate: false,
      message: axiosError?.response?.data?.message || "حدث خطأ أثناء التحقق",
    };
  }
};

// Get edit limits for a specific field
export const getEditLimits = async (
  field: "birthDate",
): Promise<{
  success: boolean;
  field: string;
  editLimit: {
    allowed: boolean;
    remaining: number;
    count: number;
    maxEdits: number;
    periodDays: number;
  };
}> => {
  try {
    const response = await api.get(`/profile/edit-limits/${field}`);
    return response.data;
  } catch (error) {
    console.error("خطأ في جلب حدود التعديل:", error);
    const axiosError = error as { response?: { data?: { message?: string } } };
    throw new Error(
      axiosError?.response?.data?.message || "حدث خطأ أثناء جلب حدود التعديل",
    );
  }
};
