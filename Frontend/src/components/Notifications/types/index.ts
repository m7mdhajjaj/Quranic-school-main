// ============================================================================
// Notifications Types - Central Type Definitions
// ============================================================================
// جميع أنواع البيانات المستخدمة في نظام الإشعارات

// ============================================================================
// Core Notification Types
// ============================================================================

/**
 * أنواع الإشعارات المدعومة - متطابقة مع Backend
 */
export const NOTIFICATION_TYPES = {
  // إشعارات عامة
  GENERAL: ["general", "system", "success", "alert", "warning", "message", "mention", "news", "chat", "reminder"] as const,
  
  // إشعارات الطلاب والمعلمين
  ACADEMIC: ["grade", "daily_marks", "exam", "attendance", "quran_progress", "memorization", "review", "test_result", "student_update", "timetable"] as const,
  
  // إشعارات الإدارة
  ADMIN: [
    "teacher_added", "teacher_updated", "teacher_deleted",
    "student_added", "student_updated", "student_deleted",
    "group_assigned", "group_updated", "group_deleted", "group_transferred",
    "secretary_added", "secretary_updated", "secretary_deleted",
    "admin_action", "user_approval", "role_change", "system_update",
  ] as const,
  
  // إشعارات أخرى
  OTHER: ["prayer_time", "goal", "achievement", "points", "ranking", "other"] as const,
} as const;

/**
 * نوع الإشعار
 */
export type NotificationType = 
  // General
  | 'general' | 'system' | 'success' | 'alert' | 'warning' | 'message' | 'mention' | 'news' | 'chat' | 'reminder'
  // Academic
  | 'grade' | 'daily_marks' | 'exam' | 'attendance' | 'quran_progress' | 'memorization' | 'review' | 'test_result' | 'student_update' | 'timetable'
  // Admin
  | 'teacher_added' | 'teacher_updated' | 'teacher_deleted'
  | 'student_added' | 'student_updated' | 'student_deleted'
  | 'group_assigned' | 'group_updated' | 'group_deleted' | 'group_transferred'
  | 'secretary_added' | 'secretary_updated' | 'secretary_deleted'
  | 'admin_action' | 'user_approval' | 'role_change' | 'system_update'
  // Other
  | 'prayer_time' | 'goal' | 'achievement' | 'points' | 'ranking' | 'other';

/**
 * فئة الإشعار
 */
export type NotificationCategory = 'general' | 'academic' | 'admin' | 'other';

/**
 * أولوية الإشعار
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * نوع الكيان المرتبط بالإشعار
 */
export type NotificationEntityType = 
  | 'student' | 'teacher' | 'group' | 'section' 
  | 'mark' | 'exam' | 'news' | 'timetable' | 'warning' | 'message' | 'attendance' | 'system' | 'other';

/**
 * أنواع العمليات العامة
 */
export type NotificationAction = 
  // Section actions
  | 'section_added' | 'section_updated' | 'section_deleted'
  // Mark actions
  | 'mark_added' | 'mark_updated' | 'mark_deleted'
  // Group actions
  | 'group_assigned' | 'group_updated' | 'group_deleted' | 'group_transferred'
  | 'group_transferred_from' | 'group_transferred_to' | 'group_renamed'
  // Student actions
  | 'student_added' | 'student_removed' | 'student_moved' | 'student_moved_in' | 'student_moved_out'
  // News actions
  | 'news_created' | 'news_updated' | 'news_deleted'
  // Attendance actions
  | 'absence_recorded' | 'absence_removed'
  // Timetable actions
  | 'timetable_created' | 'timetable_updated' | 'timetable_deleted'
  // Warning actions
  | 'warning_received' | 'warning_issued'
  // Chat actions
  | 'new_message' | 'mentioned'
  // General actions
  | 'created' | 'updated' | 'deleted' | 'system_message';

/**
 * أنواع العمليات للعلامات اليومية (للتوافقية)
 */
export type DailyMarkAction = 
  | 'section_added' | 'section_updated' | 'section_deleted'
  | 'mark_added' | 'mark_updated' | 'mark_deleted';

/**
 * ملخص الإشعار (للعرض السريع في القائمة)
 */
export interface NotificationSummary {
  action?: string;
  entityType?: NotificationEntityType;
  entityId?: string;
  entityName?: string;
}

/**
 * بيانات العرض الإضافية
 */
export interface NotificationDisplayData {
  icon?: string;
  color?: string;
  image?: string;
  actionText?: string;
  actionUrl?: string;
}

/**
 * تفاصيل الإشعار الكاملة (يتم جلبها عند الطلب)
 */
export interface NotificationDetails {
  _id: string;
  message: string;
  data: Record<string, unknown>;
  link?: string;
  displayData?: NotificationDisplayData;
  createdAt: string;
}

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
 * واجهة الإشعار الرئيسية (خفيفة - للقائمة)
 */
export interface Notification {
  _id: string;
  type: NotificationType;
  category?: NotificationCategory;
  title: string;
  message?: string;
  messageSummary?: string;
  createdAt: string;
  sentAt: string;
  isRead: boolean;
  priority: NotificationPriority;
  isNew?: boolean;
  link?: string;
  summary?: NotificationSummary;
  data?: { action?: string } & Record<string, unknown>;
  // مرجع للتفاصيل الكاملة (يتم جلبها عند الحاجة)
  details?: string | NotificationDetails;
}

/**
 * إشعار كامل مع التفاصيل
 */
export interface NotificationWithDetails extends Notification {
  details: NotificationDetails;
  data: DailyMarkNotificationData | Record<string, unknown>;
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
