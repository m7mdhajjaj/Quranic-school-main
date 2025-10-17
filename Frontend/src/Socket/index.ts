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
export { useArrangementSocket } from "./useArrangementSocket";
export { useDailyMarksSocket } from "./useDailyMarksSocket";
export { useAbsenceSocket } from "./useAbsenceSocket";
export { useActivitiesSocket } from "./useActivitiesSocket";
export { useNewsSocket } from "./useNewsSocket";
export { useExamScheduleSocket } from "./useExamScheduleSocket";
export { useTimetableSocket } from "./useTimetableSocket";
export { useProfileSocket } from "./useProfileSocket";
export { useWarningsSocket } from "./useWarningsSocket";

// يمكن إضافة المزيد من الـ Hooks هنا في المستقبل
// export { useChatSocket } from './useChatSocket';
