// ============================================================================
// Notifications Types - Central Type Definitions
// ============================================================================
// جميع أنواع البيانات المستخدمة في نظام الإشعارات

// ============================================================================
// Core Notification Types
// ============================================================================

/**
 * نوع الإشعار
 */
export type NotificationType = 
  | 'grade'           // إشعار علامة
  | 'message'         // رسالة
  | 'prayer_time'     // وقت صلاة
  | 'attendance'      // حضور/غياب
  | 'exam'            // امتحان
  | 'assignment'      // مقطع/واجب
  | 'news'            // خبر/منشور
  | 'general'         // عام
  | 'daily_marks'     // العلامات اليومية
  | 'warning'         // إنذار/تنبيه
  | 'system'          // إشعار نظام
  | 'success'         // نجاح/إنجاز
  | 'alert';          // تنبيه هام/حذف

/**
 * أولوية الإشعار
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * أنواع العمليات للعلامات اليومية
 */
export type DailyMarkAction = 
  | 'section_added'      // إضافة مقطع
  | 'section_updated'    // تعديل مقطع
  | 'section_deleted'    // حذف مقطع
  | 'mark_added'         // إضافة علامة
  | 'mark_updated'       // تعديل علامة
  | 'mark_deleted';      // حذف علامة

/**
 * بيانات إشعار العلامات اليومية
 */
export interface DailyMarkNotificationData {
  action: DailyMarkAction;
  sectionId?: string;
  studentId?: string;
  sectionDate?: string;
  memorizationSection?: string;
  reviewSection?: string;
  group?: string;
  teacher?: string;
  totalMark?: number;
  reviewMark?: number;
  memorizationMark?: number;
  oldTotalMark?: number;
  deletedMark?: number;
  [key: string]: unknown;
}

/**
 * واجهة الإشعار الرئيسية
 */
export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  sentAt: string;
  isRead: boolean;
  priority: NotificationPriority;
  isNew?: boolean;
  link?: string;
  data?: DailyMarkNotificationData | Record<string, unknown>;
}

/**
 * إحصائيات الإشعارات
 */
export interface NotificationStats {
  unreadCount: number;
  newCount: number;
  totalCount: number;
}

// ============================================================================
// Prayer Alert Types
// ============================================================================

/**
 * بيانات إشعار الصلاة
 */
export interface PrayerData {
  prayerName: string;
  prayerTime: string;
  emoji: string;
  minutesRemaining?: number;
  isAdhan?: boolean;
  type?: 'prayer_reminder' | 'prayer_adhan' | 'quran_reminder';
  title?: string;
  message?: string;
  timestamp?: Date;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * خصائص مكون NotificationHeader
 */
export interface NotificationHeaderProps {
  userId: string;
}

/**
 * خصائص مكون NotificationBell
 */
export interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

/**
 * خصائص مكون NotificationDropdownHeader
 */
export interface NotificationDropdownHeaderProps {
  unreadCount: number;
  isMarkingAll: boolean;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

/**
 * خصائص مكون NotificationList
 */
export interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  hasMore: boolean;
  refreshTime: number;
  onLoadMore: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string, event: React.MouseEvent) => void;
  onNotificationClick?: (notification: Notification) => void;
}

/**
 * خصائص مكون NotificationCard
 */
export interface NotificationCardProps {
  notification: Notification;
  refreshTime: number;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string, event: React.MouseEvent) => void;
  onClick?: () => void;
}

/**
 * خصائص مكون NotificationPermissionPrompt
 */
export interface NotificationPermissionPromptProps {
  /** Show prompt automatically on mount */
  autoShow?: boolean;
  /** Callback when user grants permission */
  onPermissionGranted?: () => void;
  /** Callback when user denies permission */
  onPermissionDenied?: () => void;
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * خصائص hook useNotificationData
 */
export interface UseNotificationDataProps {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * قيمة الإرجاع من hook useNotificationData
 */
export interface UseNotificationDataReturn {
  notifications: Notification[];
  stats: NotificationStats;
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  refreshTime: number;
  fetchNotifications: (pageNum?: number, reset?: boolean) => Promise<void>;
  handleMarkAsRead: (id: string) => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  loadMore: () => void;
  addNotification: (notification: Notification) => void;
  updateNotificationReadStatus: (id: string) => void;
  incrementUnreadCount: () => void;
}

/**
 * قيمة الإرجاع من hook usePrayerAlerts
 */
export interface UsePrayerAlertsReturn {
  showPrayerReminder: (data: PrayerData) => void;
  showPreAdhanReminder: (data: PrayerData) => void;
  showPrayerAdhan: (data: PrayerData) => void;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * استجابة API للإشعارات
 */
export interface NotificationsApiResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
    hasMore: boolean;
  };
}

/**
 * استجابة API لعدد الإشعارات غير المقروءة
 */
export interface UnreadCountApiResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * خيارات الصوت للإشعارات
 */
export interface NotificationSoundOptions {
  soundPath?: string;
  volume?: number;
  enabled?: boolean;
}

/**
 * خيارات عرض الإشعار
 */
export interface NotificationDisplayOptions {
  showIcon?: boolean;
  showPriority?: boolean;
  showTime?: boolean;
  showDeleteButton?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

/**
 * ألوان الإشعارات حسب النوع
 */
export interface NotificationColors {
  [key: string]: string;
}

/**
 * أيقونات الإشعارات حسب النوع
 */
export interface NotificationIcons {
  [key: string]: string;
}
