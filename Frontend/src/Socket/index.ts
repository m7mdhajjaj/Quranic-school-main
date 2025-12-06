/**
 * Socket System - نظام Socket منظم ومركزي
 * يوفر heartbeat تلقائي كل 30 ثانية
 */

// تصدير المدير الرئيسي
export { socketManager, default as SocketManager } from "./SocketManager";

// تصدير Hooks المخصصة
export { useDashboardSocket } from "./useDashboardSocket";
export { useTeachersSocket } from "./useTeachersSocket";
export { useStudentsSocket } from "./useStudentsSocket";
export { useGroupsSocket } from "./useGroupsSocket";
export { useMyStudentsSocket } from "./useMyStudentsSocket";
export { useRankingSocket } from "./useRankingSocket";
export { useExamScheduleSocket } from "./useExamScheduleSocket";
export { useNotificationsSocket } from "./useNotificationsSocket"; // ✅ نظام الإشعارات

// يمكن إضافة المزيد من الـ Hooks هنا في المستقبل
// export { useChatSocket } from './useChatSocket';
