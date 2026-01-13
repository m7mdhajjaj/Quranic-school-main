/**
 * Socket System - نظام Socket منظم ومركزي لـ React Native
 * يوفر heartbeat تلقائي كل 30 ثانية
 */

// تصدير المدير الرئيسي
export { socketManager, default as SocketManager } from "./SocketManager";

// تصدير Hooks المخصصة
export { useUserStatusSocket, useTeachersSocket } from "./StatusSocket";
export { useNotificationsSocket } from "./useNotificationsSocket";

// ملاحظة: يمكن إضافة المزيد من الـ hooks لاحقاً عند الحاجة:
// - useGroupsSocket
// - useRankingSocket
// - useDashboardSocket
// - useExamScheduleSocket
