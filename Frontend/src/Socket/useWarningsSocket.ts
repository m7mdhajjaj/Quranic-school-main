import { useEffect } from "react";
import { socketManager } from "./SocketManager";

/**
 * Hook لإدارة Socket.IO للإنذارات (Warnings)
 * يتيح الاستماع للتحديثات الفورية عند إعطاء إنذار جديد
 */
export const useWarningsSocket = (
  onWarningCreated?: (warning: any) => void,
  onWarningDeleted?: (warningId: string) => void
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

    // تسجيل المستمعين
    socket.on("warningCreated", handleWarningCreated);
    socket.on("warningDeleted", handleWarningDeleted);

    // تنظيف عند إزالة المكون
    return () => {
      socket.emit("leaveWarnings", { timestamp: new Date().toISOString() });
      socket.off("warningCreated", handleWarningCreated);
      socket.off("warningDeleted", handleWarningDeleted);
      console.log("🔌 Left warnings room");
    };
  }, [onWarningCreated, onWarningDeleted]);

  return socketManager.getSocket();
};
