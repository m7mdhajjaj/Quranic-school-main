// ============================================================================
// Notifications Module - Main Export Index
// ============================================================================

// Main Component
export { default as NotificationHeader } from './NotificationHeader';
export { default as NotificationPermissionPrompt } from './NotificationPermissionPrompt';

// Hooks
export {
  useNotificationDataOptimized,
  usePrayerAlerts,
} from './hooks';

// Components
export {
  NotificationBell,
  NotificationDropdownHeader,
  NotificationCard,
  NotificationList,
} from './components';

// Utils
export {
  getNotificationIcon,
  getNotificationColor,
  formatRelativeTime,
  getPriorityBadge,
  getActionText,
  getCategoryFromType,
  getCategoryColor,
  getCategoryName,
  NOTIFICATION_TYPES,
} from './utils';

// Types - Export all types from the types folder
export type {
  // Core Types
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  NotificationAction,
  NotificationStats,
  NotificationSummary,
  NotificationDetails,
  NotificationWithDetails,
  PrayerData,
  
  // Component Props Types
  NotificationHeaderProps,
  NotificationBellProps,
  NotificationDropdownHeaderProps,
  NotificationListProps,
  NotificationCardProps,
  NotificationPermissionPromptProps,
  
  // Hook Types
  UseNotificationDataProps,
  UseNotificationDataReturn,
  UsePrayerAlertsReturn,
  
  // API Types
  NotificationsApiResponse,
  UnreadCountApiResponse,
  
  // Utility Types
  NotificationSoundOptions,
  NotificationDisplayOptions,
  NotificationColors,
  NotificationIcons,
} from './types';
