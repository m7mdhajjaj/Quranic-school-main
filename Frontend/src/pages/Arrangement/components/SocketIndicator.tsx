/**
 * Socket Connection Indicator Component
 * Shows real-time connection status (for developers only in DEV mode)
 */

import type { SocketIndicatorProps } from "../types/arrangement";

export const SocketIndicator = ({
  isConnected,
  socketId,
  lastUpdate,
}: SocketIndicatorProps) => {
  // Only show in development mode
  if (!import.meta.env.DEV) return null;

  return (
    <div className="flex justify-center mb-4">
      <div
        className="flex items-center gap-1.5 cursor-help bg-white px-4 py-2 rounded-full shadow-sm"
        title={
          isConnected
            ? `💓 Heartbeat نشط (كل 30 ثانية)\nSocket ID: ${
                socketId || "N/A"
              }\nآخر تحديث: ${
                lastUpdate?.toLocaleTimeString("ar-SA") || "لا يوجد"
              }`
            : "Socket غير متصل - وضع التحديث التلقائي"
        }>
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-yellow-500"
          } animate-pulse`}></div>
        <span
          className={`text-xs font-medium ${
            isConnected ? "text-green-600" : "text-yellow-600"
          }`}>
          {isConnected ? "💓 تحديث مباشر" : "تحديث تلقائي"}
        </span>
      </div>
    </div>
  );
};
