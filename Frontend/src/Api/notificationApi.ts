import api from './api';

// ============================================================================
// Notification API - User Notifications Management
// ============================================================================

export interface Notification {
  _id: string;
  id?: number;
  title: string;
  message: string;
  type: 'grade' | 'message' | 'prayer_time' | 'activity' | 'attendance' | 'exam' | 'general' | 'daily_marks'; // ✅ متطابق مع Backend
  priority: 'low' | 'medium' | 'high' | 'urgent'; // ✅ متطابق مع Backend
  isRead: boolean;
  userId?: string;
  recipient?: string;
  recipientModel?: string;
  createdAt: string;
  sentAt: string; // وقت الإرسال الفعلي
  data?: Record<string, unknown>;
  isNew?: boolean;
  icon?: string;
  color?: string;
  time?: string;
  unread?: boolean;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  total?: number;
  unreadCount?: number;
}

// Get recent notifications for a user
export const getRecentNotifications = async (userId: string, limit: number = 10): Promise<Notification[]> => {
  try {
    const response = await api.get(`/notifications/${userId}?limit=${limit}`);
    // ✅ Backend يعيد data.notifications وليس data فقط
    const notifications = response.data?.data?.notifications || response.data?.data || [];
    console.log('📬 Fetched notifications:', notifications);
    return notifications;
  } catch (error) {
    console.error('Failed to get recent notifications:', error);
    return [];
  }
};

// Get unread notification count
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

// Mark all notifications as read for a user
export const markAllAsRead = async (userId: string): Promise<boolean> => {
  try {
    const response = await api.put(`/notifications/read-all`);
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

// Get all notifications for a user (paginated)
export const getAllNotifications = async (
  userId: string, 
  page: number = 1, 
  limit: number = 20
): Promise<{notifications: Notification[], total: number, hasMore: boolean}> => {
  try {
    const response = await api.get(`/notifications/${userId}?page=${page}&limit=${limit}`);
    return {
      notifications: response.data.data || [],
      total: response.data.total || 0,
      hasMore: response.data.hasMore || false
    };
  } catch (error) {
    console.error('Failed to get all notifications:', error);
    return { notifications: [], total: 0, hasMore: false };
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