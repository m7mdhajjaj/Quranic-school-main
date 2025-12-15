// ============================================================================
// NotificationCard Component
// ============================================================================
// بطاقة إشعار واحدة

import React from 'react';
import type { NotificationCardProps } from '../types';
import type { DailyMarkAction } from '../types';
import { getNotificationIcon, getNotificationColor, formatRelativeTime, getPriorityBadge, getDailyMarkActionText } from '../utils';
import { Button } from '@/components/UI';
import { IoTrashOutline } from 'react-icons/io5';

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  refreshTime,
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
  const icon = getNotificationIcon(notification.type, notification.data);
  const colorClass = getNotificationColor(notification.type);
  const priorityBadge = getPriorityBadge(notification.priority);

  const handleClick = () => {
    onMarkAsRead(notification._id);
    onClick?.();
  };

  return (
    <div
      className={`group relative mx-2 my-1.5 rounded-lg transition-all duration-200 cursor-pointer overflow-hidden ${
        !notification.isRead
          ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border border-blue-200 shadow-sm hover:shadow-md'
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm opacity-70 hover:opacity-90'
      } ${notification.isNew ? 'animate-[slideIn_0.5s_ease-out]' : ''} transform hover:scale-[1.005] active:scale-[0.995]`}
      onClick={handleClick}>
      {/* شريط جانبي ملون */}
      <div className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colorClass}`}></div>

      <div className="flex items-start gap-2 p-2.5">
        {/* أيقونة الإشعار */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg shadow-md transform transition-transform group-hover:scale-105 bg-gradient-to-br ${colorClass}`}>
          {icon}
        </div>

        {/* محتوى الإشعار */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div
              className={`font-semibold text-xs leading-tight ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
              }`}>
              {notification.title}
              {!notification.isRead && (
                <span className="inline-block mr-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>

          {notification.type !== 'message' && (
            <div
              className={`text-xs leading-relaxed mb-1.5 line-clamp-2 ${
                !notification.isRead ? 'text-gray-700' : 'text-gray-600'
              }`}>
              {notification.message}
            </div>
          )}

          {/* معلومات إضافية للعلامات اليومية */}
          {notification.type === 'daily_marks' && notification.data?.action && (
            <div className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mb-1.5 inline-block">
              {getDailyMarkActionText(notification.data.action as DailyMarkAction)}
            </div>
          )}

          {/* معلومات التواريخ */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="flex items-center gap-1 time-update" key={refreshTime}>
              <span className="text-xs">📤</span>
              <span className="font-medium">{formatRelativeTime(notification.sentAt)}</span>
            </span>
            {priorityBadge && (
              <span className={`${priorityBadge.className} text-[10px]`}>{priorityBadge.text}</span>
            )}
          </div>
        </div>

        {/* زر الحذف */}
        <button
          onClick={(e) => onDelete(notification._id, e)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="حذف الإشعار"
          aria-label="حذف الإشعار">
          <IoTrashOutline size={14} />
        </button>
      </div>
    </div>
  );
};
