// ============================================================================
// NotificationCard Component
// ============================================================================
// بطاقة إشعار واحدة

import React from 'react';
import type { NotificationCardProps } from '../types';
import { getNotificationIcon, getNotificationColor, formatRelativeTime, getPriorityBadge } from '../utils';
import { Button } from '@/components/UI';
import { IoTrashOutline } from 'react-icons/io5';

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  refreshTime,
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
  const icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);
  const priorityBadge = getPriorityBadge(notification.priority);

  const handleClick = () => {
    onMarkAsRead(notification._id);
    onClick?.();
  };

  return (
    <div
      className={`group relative mx-3 my-2 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
        !notification.isRead
          ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-200 shadow-md hover:shadow-xl'
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg opacity-70 hover:opacity-90'
      } ${notification.isNew ? 'animate-[slideIn_0.5s_ease-out]' : ''} transform hover:scale-[1.01] active:scale-[0.99]`}
      onClick={handleClick}>
      {/* شريط جانبي ملون */}
      <div className={`absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${colorClass}`}></div>

      <div className="flex items-start gap-3 p-4">
        {/* أيقونة الإشعار */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg transform transition-transform group-hover:scale-110 bg-gradient-to-br ${colorClass}`}>
          {icon}
        </div>

        {/* محتوى الإشعار */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div
              className={`font-bold text-sm sm:text-base leading-snug ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
              }`}>
              {notification.title}
              {!notification.isRead && (
                <span className="inline-block mr-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>

          {notification.type !== 'message' && (
            <div
              className={`text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2 ${
                !notification.isRead ? 'text-gray-700' : 'text-gray-600'
              }`}>
              {notification.message}
            </div>
          )}

          {/* معلومات التواريخ */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
              <span className="flex items-center gap-1 time-update" key={refreshTime}>
                📤 <span className="font-medium">{formatRelativeTime(notification.sentAt)}</span>
              </span>
              {priorityBadge && (
                <span className={priorityBadge.className}>{priorityBadge.text}</span>
              )}
            </div>
          </div>
        </div>

        {/* زر الحذف */}
        <Button
          variant="ghost"
          size="xs"
          onClick={(e) => onDelete(notification._id, e)}
          className="flex-shrink-0 text-gray-400 hover:text-red-600 hover:bg-red-50 border-none"
          title="حذف الإشعار"
          aria-label="حذف الإشعار">
          <IoTrashOutline size={18} />
        </Button>
      </div>
    </div>
  );
};
