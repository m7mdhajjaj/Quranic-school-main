/**
 * Socket System - نظام Socket منظم ومركزي
 * يوفر heartbeat تلقائي كل 30 ثانية
 */

// تصدير المدير الرئيسي
export { socketManager, default as SocketManager } from "./SocketManager";

// تصدير Hooks المخصصة
export { useRankingSocket } from "./useRankingSocket";
export { useNotificationsSocket } from "./useNotificationsSocket";
export { useDashboardSocket } from "./useDashboardSocket";
