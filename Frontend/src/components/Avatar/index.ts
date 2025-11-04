/**
 * Avatar Component Exports
 * @module Avatar
 * 
 * @description
 * مكون الأفاتار مع دعم كامل لحالة الاتصال (Online Status)
 * 
 * @example
 * // استخدام بسيط
 * <Avatar user={user} size="md" />
 * 
 * @example
 * // مع عرض حالة الاتصال
 * <Avatar user={user} size="lg" showStatus={true} />
 * 
 * @note
 * OnlineStatus مدمجة تلقائياً - لا حاجة لاستيرادها منفصلة
 */

// Main Component
export { default as Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

// Hook - استخدم هذا Hook مباشرة لجلب صور الأفاتار
export { useAvatar } from '../Hooks/useAvatar';
export type { UseAvatarOptions, UseAvatarReturn } from '../Hooks/useAvatar';

// Utility Functions
export * from './utils';
