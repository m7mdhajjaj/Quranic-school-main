import api from './api';

// ============================================================================
// Refresh API - إدارة التحديث والـ Refresh
// ============================================================================

// Types for API responses
export interface UserStatusResponse {
  success: boolean;
  isActive: boolean;
  lastSeen: string | null;
}

export interface UserResponse {
  success: boolean;
  user: {
    _id: string;
    role: string;
    firstName: string;
    lastName?: string;
    email?: string;
    gender?: string;
    avatar?: {
      url?: string;
      publicId?: string;
    };
  };
}

export interface OnlineStatusRequest {
  userId: string;
  isOnline: boolean;
  isActive?: boolean;
  lastSeen: string;
}

export interface ActivityRequest {
  userId: string;
  lastSeen: string;
}

export interface OnlineUsersResponse {
  success: boolean;
  users: Array<{
    _id: string;
    firstName: string;
    lastName?: string;
    avatar?: {
      url?: string;
      publicId?: string;
    };
    lastSeen: string;
    role: 'student' | 'teacher' | 'admin' | 'secretary';
  }>;
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// User Status APIs
// ============================================================================

/**
 * جلب حالة مستخدم معين
 */
export const getUserStatus = async (userId: string): Promise<UserStatusResponse> => {
  try {
    const response = await api.get(`/users/${userId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user status:', error);
    throw error;
  }
};

/**
 * تحديث حالة الاتصال للمستخدم
 */
export const updateOnlineStatus = async (data: OnlineStatusRequest): Promise<UserStatusResponse> => {
  try {
    const response = await api.post('/users/online-status', data);
    return response.data;
  } catch (error) {
    console.error('Error updating online status:', error);
    throw error;
  }
};

/**
 * جلب حالة الاتصال لمستخدم معين
 */
export const getOnlineStatus = async (userId: string): Promise<UserStatusResponse> => {
  try {
    const response = await api.get(`/users/online-status/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching online status:', error);
    throw error;
  }
};

/**
 * تحديث نشاط المستخدم (Heartbeat)
 */
export const updateUserActivity = async (data: ActivityRequest): Promise<{ success: boolean; lastSeen: string; isActive: boolean }> => {
  try {
    const response = await api.post('/users/activity', data);
    return response.data;
  } catch (error) {
    console.error('Error updating user activity:', error);
    throw error;
  }
};

/**
 * تعيين المستخدم كغير متصل
 */
export const setUserOffline = async (userId: string): Promise<{ success: boolean; isActive: boolean; lastSeen: string }> => {
  try {
    const response = await api.post('/users/offline', { userId });
    return response.data;
  } catch (error) {
    console.error('Error setting user offline:', error);
    throw error;
  }
};

/**
 * جلب جميع المستخدمين المتصلين
 */
export const getOnlineUsers = async (page: number = 1, limit: number = 50): Promise<OnlineUsersResponse> => {
  try {
    const response = await api.get(`/users/online?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching online users:', error);
    throw error;
  }
};

// ============================================================================
// Auth & User APIs
// ============================================================================

/**
 * التحقق من صحة التوكن
 */
export const verifyToken = async (): Promise<UserResponse> => {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

/**
 * تحديث بيانات المستخدم الحالي
 */
export const refreshCurrentUser = async (): Promise<UserResponse> => {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Error refreshing current user:', error);
    throw error;
  }
};

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * تحديث شامل - يتضمن حالة المستخدم والتوكن
 */
export const refreshAll = async (userId: string): Promise<{
  userStatus: UserStatusResponse;
  userData: UserResponse;
  tokenValid: boolean;
}> => {
  try {
    const [userStatusResponse, userDataResponse, tokenResponse] = await Promise.allSettled([
      getUserStatus(userId),
      refreshCurrentUser(),
      verifyToken()
    ]);

    return {
      userStatus: userStatusResponse.status === 'fulfilled' 
        ? userStatusResponse.value 
        : { success: false, isActive: false, lastSeen: null },
      userData: userDataResponse.status === 'fulfilled' 
        ? userDataResponse.value 
        : { 
          success: false, 
          user: {
            _id: '',
            role: '',
            firstName: ''
          }
        },
      tokenValid: tokenResponse.status === 'fulfilled' && tokenResponse.value.success
    };
  } catch (error) {
    console.error('Error in batch refresh:', error);
    throw error;
  }
};