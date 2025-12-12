/**
 * Socket System - نظام Socket منظم ومركزي
 * يوفر heartbeat تلقائي كل 30 ثانية
 */

// تصدير المدير الرئيسي
export { socketManager, default as SocketManager } from "./SocketManager";

// تصدير Hooks المخصصة
export { useDashboardSocket } from "./useDashboardSocket";
export { useGroupsSocket } from "./useGroupsSocket";
export { useRankingSocket } from "./useRankingSocket";
export { useNotificationsSocket } from "./useNotificationsSocket"; // ✅ نظام الإشعارات
export { useUserStatusSocket, useTeachersSocket } from "./useTeachersSocket"; // ✅ تحديثات الحالة للمعلمين والطلاب والأدمن

// يمكن إضافة المزيد من الـ Hooks هنا في المستقبل
// export { useChatSocket } from './useChatSocket';
