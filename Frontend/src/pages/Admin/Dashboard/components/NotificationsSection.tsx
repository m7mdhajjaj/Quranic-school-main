import React from "react";
import { Card } from "@/components/UI/Card";
import {
  FaBell,
  FaExclamationCircle,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";

export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  time: string;
}

interface NotificationsSectionProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  notifications,
  onMarkAsRead,
}) => {
  const getNotificationStyle = (type: string) => {
    const styles = {
      info: {
        icon: FaInfoCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      },
      warning: {
        icon: FaExclamationCircle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      },
      success: {
        icon: FaCheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
      error: {
        icon: FaExclamationCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      },
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaBell className="text-blue-600" />
        الإشعارات
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaBell className="text-5xl mx-auto mb-3 opacity-30" />
            <p className="text-lg">لا توجد إشعارات جديدة</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const style = getNotificationStyle(notification.type);
            const Icon = style.icon;

            return (
              <div
                key={notification.id}
                className={`
                  ${style.bgColor} ${style.borderColor} border-r-4 
                  p-4 rounded-lg transition-all duration-300 
                  hover:shadow-md hover:scale-[1.02] cursor-pointer
                  group
                `}
                onClick={() => onMarkAsRead?.(notification.id)}>
                <div className="flex items-start gap-3">
                  <Icon
                    className={`text-2xl ${style.color} flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300`}
                  />

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
