/**
 * Socket System - نظام Socket منظم ومركزي لـ React Native
 * يوفر heartbeat تلقائي كل 30 ثانية
 */

// تصدير المدير الرئيسي
export { socketManager, default as SocketManager } from "./SocketManager";

// تصدير Hooks المخصصة
export { useUserStatusSocket, useTeachersSocket } from "./StatusSocket";

// ملاحظة: تم حذف الـ hooks غير المستخدمة في المرحلة الأولى من Mobile
// يمكن إضافتها لاحقاً عند الحاجة:
// - useGroupsSocket
// - useRankingSocket
// - useNotificationsSocket (سيتم إضافته مع نظام الإشعارات Push)
// - useDashboardSocket
// - useExamScheduleSocket
