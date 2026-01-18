import api from './api';

// ============================================================================
// Notification API - User Notifications Management (Optimized)
// ============================================================================

/**
 * أنواع الإشعارات المدعومة - متطابقة مع Backend
 */
export const NOTIFICATION_TYPES = {
  GENERAL: ["general", "system", "success", "alert", "warning", "message", "mention", "news", "chat", "reminder"],
  ACADEMIC: ["grade", "daily_marks", "exam", "attendance", "quran_progress", "memorization", "review", "test_result", "student_update", "timetable"],
  ADMIN: [
    "teacher_added", "teacher_updated", "teacher_deleted",
    "student_added", "student_updated", "student_deleted",
    "group_assigned", "group_updated", "group_deleted", "group_transferred",
    "secretary_added", "secretary_updated", "secretary_deleted",
    "admin_action", "user_approval", "role_change", "system_update",
  ],
  OTHER: ["prayer_time", "goal", "achievement", "points", "ranking", "other"],
} as const;

export type NotificationType = 
  | 'grade' | 'message' | 'prayer_time' | 'attendance' | 'exam' 
  | 'general' | 'daily_marks' | 'warning' | 'system' | 'success' | 'alert'
  | 'news' | 'chat' | 'timetable' | 'mention' | 'reminder'
  | 'quran_progress' | 'memorization' | 'review' | 'test_result' | 'student_update'
  | 'teacher_added' | 'teacher_updated' | 'teacher_deleted'
  | 'student_added' | 'student_updated' | 'student_deleted'
  | 'group_assigned' | 'group_updated' | 'group_deleted' | 'group_transferred'
  | 'secretary_added' | 'secretary_updated' | 'secretary_deleted'
  | 'admin_action' | 'user_approval' | 'role_change' | 'system_update'
  | 'goal' | 'achievement' | 'points' | 'ranking' | 'other';

export type NotificationCategory = 'general' | 'academic' | 'admin' | 'other';

export interface NotificationSummary {
  action?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
}

export interface NotificationDetails {
  _id: string;
  message: string;
  data: Record<string, unknown>;
  link?: string;
  displayData?: {
    icon?: string;
    color?: string;
    image?: string;
    actionText?: string;
    actionUrl?: string;
  };
  createdAt: string;
}

export interface Notification {
  _id: string;
  id?: number;
  title: string;
  message?: string;
  messageSummary?: string;
  type: NotificationType;
  category?: NotificationCategory;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  userId?: string;
  recipient?: string;
  recipientModel?: string;
  createdAt: string;
  sentAt: string;
  summary?: NotificationSummary;
  data?: { action?: string } & Record<string, unknown>;
  details?: string | NotificationDetails;
  isNew?: boolean;
  icon?: string;
  color?: string;
  time?: string;
  unread?: boolean;
  link?: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  total?: number;
  unreadCount?: number;
}

export interface NotificationPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
}

export interface NotificationStats {
  unreadCount: number;
  newCount: number;
  totalCount: number;
}

// Get recent notifications for a user (Lightweight)
export const getRecentNotifications = async (userId: string, limit: number = 10): Promise<Notification[]> => {
  try {
    const response = await api.get(`/notifications/${userId}?limit=${limit}`);
    const notifications = response.data?.data?.notifications || response.data?.data || [];
    console.log('📬 Fetched notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('Failed to get recent notifications:', error);
    return [];
  }
};

// Get unread notification count (Fast)
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const response = await api.get(`/notifications/${userId}/unread-count`);
    return response.data.unreadCount || 0;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    return 0;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data.success;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
};

// Mark all notifications as read for current user (uses auth token)
export const markAllAsRead = async (): Promise<boolean> => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data.success;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return false;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data.success;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return false;
  }
};

// Get all notifications for a user (paginated - Lightweight)
export const getAllNotifications = async (
  userId: string, 
  page: number = 1, 
  limit: number = 20,
  filters?: { type?: NotificationType; category?: NotificationCategory; isRead?: boolean }
): Promise<{
  notifications: Notification[];
  total: number;
  hasMore: boolean;
  pagination: NotificationPagination;
  stats: NotificationStats;
}> => {
  try {
    let url = `/notifications/${userId}?page=${page}&limit=${limit}`;
    
    if (filters?.type) url += `&type=${filters.type}`;
    if (filters?.category) url += `&category=${filters.category}`;
    if (filters?.isRead !== undefined) url += `&isRead=${filters.isRead}`;
    
    const response = await api.get(url);
    const responseData = response.data?.data;
    
    return {
      notifications: responseData?.notifications || [],
      total: responseData?.stats?.totalCount || 0,
      hasMore: responseData?.pagination?.hasNextPage || false,
      pagination: responseData?.pagination || {
        currentPage: page,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
      },
      stats: responseData?.stats || {
        unreadCount: 0,
        newCount: 0,
        totalCount: 0,
      },
    };
  } catch (error) {
    console.error('Failed to get all notifications:', error);
    return {
      notifications: [],
      total: 0,
      hasMore: false,
      pagination: { currentPage: 1, totalPages: 1, totalCount: 0, hasNextPage: false },
      stats: { unreadCount: 0, newCount: 0, totalCount: 0 },
    };
  }
};

// Get notification details (Full data - on demand)
export const getNotificationDetails = async (notificationId: string): Promise<Notification | null> => {
  try {
    const response = await api.get(`/notifications/${notificationId}/details`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get notification details:', error);
    return null;
  }
};

// Create a new notification (admin only)
export const createNotification = async (notification: Omit<Notification, '_id' | 'createdAt'>): Promise<Notification | null> => {
  try {
    const response = await api.post('/notifications', notification);
    return response.data.data;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

// Get notifications by category
export const getNotificationsByCategory = async (
  userId: string,
  category: NotificationCategory,
  page: number = 1,
  limit: number = 20
): Promise<{ notifications: Notification[]; hasMore: boolean }> => {
  try {
    const response = await api.get(
      `/notifications/${userId}?page=${page}&limit=${limit}&category=${category}`
    );
    const responseData = response.data?.data;
    return {
      notifications: responseData?.notifications || [],
      hasMore: responseData?.pagination?.hasNextPage || false,
    };
  } catch (error) {
    console.error('Failed to get notifications by category:', error);
    return { notifications: [], hasMore: false };
  }
};

// Get quick stats
export const getQuickStats = async (userId: string): Promise<NotificationStats> => {
  try {
    const response = await api.get(`/notifications/${userId}?page=1&limit=1`);
    return response.data?.data?.stats || { unreadCount: 0, newCount: 0, totalCount: 0 };
  } catch (error) {
    console.error('Failed to get quick stats:', error);
    return { unreadCount: 0, newCount: 0, totalCount: 0 };
  }
};