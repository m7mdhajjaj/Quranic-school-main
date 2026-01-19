// ============================================================================
// NotificationCard Component - Modern & Beautiful Design
// ============================================================================
// بطاقة إشعار عصرية مع تصميم احترافي

import React from 'react';
import type { NotificationCardProps } from '../types';
import type { DailyMarkAction, NotificationAction } from '../types';
import { 
  getNotificationIconComponent, 
  getNotificationColorClass, 
  formatRelativeTime, 
  getPriorityBadge, 
  getDailyMarkActionText,
  getActionText,
  getCategoryName,
} from '../utils';
import { Trash2, Clock, ChevronLeft } from 'lucide-react';

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  refreshTime,
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
  const icon = getNotificationIconComponent(notification.type, notification.data);
  const colorClass = getNotificationColorClass(notification.type);
  const priorityBadge = getPriorityBadge(notification.priority);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    onClick?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification._id, e);
  };

  return (
    <div
      className={`
        group relative mx-1.5 my-1.5 rounded-xl cursor-pointer overflow-hidden
        transition-all duration-300 ease-out
        ${!notification.isRead
          ? 'bg-white shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-emerald-100/50 border border-gray-100'
          : 'bg-gray-50/80 border border-gray-100/50 hover:bg-white hover:shadow-md'
        }
        ${notification.isNew ? 'animate-[slideIn_0.4s_cubic-bezier(0.16,1,0.3,1)]' : ''}
        hover:-translate-y-0.5 active:scale-[0.98]
      `}
      onClick={handleClick}
    >
      {/* Gradient Accent Line */}
      <div className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colorClass} rounded-r-full`} />

      {/* Unread Indicator Glow */}
      {!notification.isRead && (
        <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br ${colorClass} blur-xl opacity-40`} />
      )}

      <div className="flex items-start gap-2.5 p-2.5 pr-3">
        {/* Icon Container */}
        <div className="relative flex-shrink-0">
          <div
            className={`
              w-9 h-9 rounded-lg flex items-center justify-center
              bg-gradient-to-br ${colorClass}
              shadow-md transition-all duration-300
              group-hover:scale-105 group-hover:shadow-lg
              [&>svg]:w-4 [&>svg]:h-4
            `}
          >
            {icon}
          </div>
          
          {/* New Badge */}
          {!notification.isRead && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-1.5">
            <h4
              className={`
                font-semibold text-xs leading-snug
                ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}
              `}
            >
              {notification.title}
            </h4>
            
            {/* Arrow Indicator */}
            <ChevronLeft 
              className={`
                w-3.5 h-3.5 flex-shrink-0 text-gray-300
                transition-all duration-300
                group-hover:text-emerald-500 group-hover:-translate-x-1
              `} 
            />
          </div>

          {/* Message */}
          {notification.type !== 'message' && (notification.messageSummary || notification.message) && (
            <p
              className={`
                text-[11px] leading-relaxed line-clamp-2
                ${!notification.isRead ? 'text-gray-600' : 'text-gray-500'}
              `}
            >
              {notification.messageSummary || notification.message}
            </p>
          )}

          {/* Tags Row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Daily Marks Tag */}
            {notification.type === 'daily_marks' && notification.data?.action && (
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-teal-700 bg-teal-50 rounded-full border border-teal-100">
                {getDailyMarkActionText(notification.data.action as DailyMarkAction)}
              </span>
            )}

            {/* Action Tag */}
            {notification.data?.action && notification.type !== 'daily_marks' && (
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-violet-700 bg-violet-50 rounded-full border border-violet-100">
                {getActionText(notification.data.action as NotificationAction)}
              </span>
            )}

            {/* Category Tag */}
            {notification.category && (
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded-full">
                {getCategoryName(notification.category)}
              </span>
            )}

            {/* Priority Badge */}
            {priorityBadge && (
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${priorityBadge.className}`}>
                {priorityBadge.text}
              </span>
            )}
          </div>

          {/* Time Row */}
          <div className="flex items-center gap-1 text-[10px] text-gray-400" key={refreshTime}>
            <Clock className="w-2.5 h-2.5" />
            <span className="font-medium">{formatRelativeTime(notification.sentAt)}</span>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className={`
            flex-shrink-0 p-1.5 rounded-lg
            text-gray-300 hover:text-red-500 
            hover:bg-red-50 active:bg-red-100
            transition-all duration-200
            opacity-0 group-hover:opacity-100
            hover:scale-110 active:scale-95
          `}
          title="حذف الإشعار"
          aria-label="حذف الإشعار"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
