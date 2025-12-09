/**
 * Socket System - نظام Socket منظم ومركزي
 * يوفر heartbeat تلقائي كل 30 ثانية
 */

// تصدير المدير الرئيسي
export { socketManager, default as SocketManager } from "./SocketManager";

// تصدير Hooks المخصصة
export { useDashboardSocket } from "./useDashboardSocket";
export { useTeachersSocket } from "./useTeachersSocket";
export { useGroupsSocket } from "./useGroupsSocket";
export { useRankingSocket } from "./useRankingSocket";
export { useNotificationsSocket } from "./useNotificationsSocket"; // ✅ نظام الإشعارات

// يمكن إضافة المزيد من الـ Hooks هنا في المستقبل
// export { useChatSocket } from './useChatSocket';
