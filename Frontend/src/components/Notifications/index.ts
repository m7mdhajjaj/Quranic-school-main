// ============================================================================
// Notifications Module - Main Export Index
// ============================================================================

// Main Component
export { default as NotificationHeader } from './NotificationHeader';
export { default as NotificationPermissionPrompt } from './NotificationPermissionPrompt';

// Hooks
export {
  useNotificationData,
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
} from './utils';

// Types
export type { Notification, NotificationStats } from './hooks';
