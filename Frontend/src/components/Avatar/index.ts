/**
 * Avatar Component Exports
 * @module Avatar
 */

// Main Component
export { default as Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

// Hook - استخدم هذا Hook مباشرة لجلب صور الأفاتار
export { useAvatar } from '../Hooks/useAvatar';
export type { UseAvatarOptions, UseAvatarReturn } from '../Hooks/useAvatar';

// Utility Functions
export * from './utils';
