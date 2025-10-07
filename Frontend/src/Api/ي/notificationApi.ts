import api from '../api';

// ============================================================================
// Notification API
// ============================================================================

export interface Notification {
  _id: string;
  recipient: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// Get all notifications for current user
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return response.data;
};

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  await api.put(`/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};

// Get unread count
export const getUnreadNotificationCount = async (): Promise<{ count: number }> => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};
