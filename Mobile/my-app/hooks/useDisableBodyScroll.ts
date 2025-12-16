// ============================================================================
// useDisableBodyScroll Hook - React Native Adaptation
// ============================================================================
// Note: In React Native, scroll behavior is different from web
// This hook is included for API compatibility but has no effect
// Modal/ScrollView scroll locking should be handled at component level
// ============================================================================

/**
 * Hook لتعطيل scroll عند فتح Modal
 * @param isOpen - حالة فتح/إغلاق الـ Modal
 *
 * Note: في React Native، يتم التحكم في الـ scroll بشكل مختلف عن الويب
 * هذا الـ Hook موجود للتوافق مع الكود فقط
 * يجب التحكم في الـ scroll من خلال props الـ Modal مثل:
 * - Modal component: يمنع التفاعل مع المحتوى خلفه تلقائياً
 * - ScrollView: استخدم scrollEnabled={!isModalOpen}
 */
export const useDisableBodyScroll = (isOpen: boolean) => {
  // No-op in React Native
  // React Native Modal components handle scroll locking automatically
  // If you need to disable scrolling in a ScrollView, use:
  // scrollEnabled={!isOpen}
};
