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
  onStudentStatusUpdated?: (data: { studentId: string; status: any }) => void,
  onSuspensionExpired?: (data: any) => void,
  onSuspensionRestored?: (data: any) => void
) => {
  useEffect(() => {
    const socket = socketManager.getSocket();
    if (!socket) {
      console.warn("⚠️ Socket not initialized");
      return;
    }

    // الانضمام إلى غرفة الإنذارات
    socket.emit("joinWarnings", { timestamp: new Date().toISOString() });

    // الاستماع لإنشاء إنذار جديد
    const handleWarningCreated = (warning: any) => {
      if (onWarningCreated) {
        onWarningCreated(warning);
      }
    };

    // الاستماع لحذف إنذار
    const handleWarningDeleted = (data: { warningId: string }) => {
      if (onWarningDeleted) {
        onWarningDeleted(data.warningId);
      }
    };

    // الاستماع لتحديث الإحصائيات
    const handleStatisticsUpdated = (statistics: any) => {
      if (onStatisticsUpdated) {
        onStatisticsUpdated(statistics);
      }
    };

    // الاستماع لتحديث حالة الطالب
    const handleStudentStatusUpdated = (data: { studentId: string; status: any }) => {
      if (onStudentStatusUpdated) {
        onStudentStatusUpdated(data);
      }
    };

    // الاستماع لانتهاء الفصل المؤقت
    const handleSuspensionExpired = (data: any) => {
      console.log("⏰ Suspension expired:", data);
      if (onSuspensionExpired) {
        onSuspensionExpired(data);
      }
    };

    // الاستماع لاستعادة الطالب بعد الفصل
    const handleSuspensionRestored = (data: any) => {
      console.log("✅ Suspension restored:", data);
      if (onSuspensionRestored) {
        onSuspensionRestored(data);
      }
    };

    // تسجيل المستمعين
    socket.on("warningCreated", handleWarningCreated);
    socket.on("warningDeleted", handleWarningDeleted);
    socket.on("statisticsUpdated", handleStatisticsUpdated);
    socket.on("studentStatusUpdated", handleStudentStatusUpdated);
    socket.on("suspensionExpired", handleSuspensionExpired);
    socket.on("suspensionRestored", handleSuspensionRestored);

    // تنظيف عند إزالة المكون
    return () => {
      socket.emit("leaveWarnings", { timestamp: new Date().toISOString() });
      socket.off("warningCreated", handleWarningCreated);
      socket.off("warningDeleted", handleWarningDeleted);
      socket.off("statisticsUpdated", handleStatisticsUpdated);
      socket.off("studentStatusUpdated", handleStudentStatusUpdated);
      socket.off("suspensionExpired", handleSuspensionExpired);
      socket.off("suspensionRestored", handleSuspensionRestored);
    };
  }, [onWarningCreated, onWarningDeleted, onStatisticsUpdated, onStudentStatusUpdated, onSuspensionExpired, onSuspensionRestored]);

  return socketManager.getSocket();
};
