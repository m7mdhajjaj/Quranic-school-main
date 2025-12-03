import { useEffect } from "react";
import { socketManager } from "./SocketManager";

/**
 * Hook لإدارة Socket.IO للإنذارات (Warnings)
 * يتيح الاستماع للتحديثات الفورية لجميع التغييرات في نظام الإنذارات
 */
export const useWarningsSocket = (
  onWarningCreated?: (warning: any) => void,
  onWarningDeleted?: (warningId: string) => void,
  onStatisticsUpdated?: (statistics: any) => void,
  onStudentStatusUpdated?: (data: { studentId: string; status: any }) => void
) => {
  useEffect(() => {
    const socket = socketManager.getSocket();
    if (!socket) {
      console.warn("⚠️ Socket not initialized");
      return;
    }

    // الانضمام إلى غرفة الإنذارات
    socket.emit("joinWarnings", { timestamp: new Date().toISOString() });
    console.log("📡 Joined warnings room");

    // الاستماع لإنشاء إنذار جديد
    const handleWarningCreated = (warning: any) => {
      console.log("⚠️ New warning created:", warning);
      if (onWarningCreated) {
        onWarningCreated(warning);
      }
    };

    // الاستماع لحذف إنذار
    const handleWarningDeleted = (data: { warningId: string }) => {
      console.log("🗑️ Warning deleted:", data.warningId);
      if (onWarningDeleted) {
        onWarningDeleted(data.warningId);
      }
    };

    // الاستماع لتحديث الإحصائيات
    const handleStatisticsUpdated = (statistics: any) => {
      console.log("📊 Statistics updated:", statistics);
      if (onStatisticsUpdated) {
        onStatisticsUpdated(statistics);
      }
    };

    // الاستماع لتحديث حالة الطالب
    const handleStudentStatusUpdated = (data: { studentId: string; status: any }) => {
      console.log("👤 Student status updated:", data);
      if (onStudentStatusUpdated) {
        onStudentStatusUpdated(data);
      }
    };

    // تسجيل المستمعين
    socket.on("warningCreated", handleWarningCreated);
    socket.on("warningDeleted", handleWarningDeleted);
    socket.on("statisticsUpdated", handleStatisticsUpdated);
    socket.on("studentStatusUpdated", handleStudentStatusUpdated);

    // تنظيف عند إزالة المكون
    return () => {
      socket.emit("leaveWarnings", { timestamp: new Date().toISOString() });
      socket.off("warningCreated", handleWarningCreated);
      socket.off("warningDeleted", handleWarningDeleted);
      socket.off("statisticsUpdated", handleStatisticsUpdated);
      socket.off("studentStatusUpdated", handleStudentStatusUpdated);
      console.log("🔌 Left warnings room");
    };
  }, [onWarningCreated, onWarningDeleted, onStatisticsUpdated, onStudentStatusUpdated]);

  return socketManager.getSocket();
};
