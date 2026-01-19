// ============================================================================
// NotificationList Component - Modern Design
// ============================================================================
// قائمة الإشعارات مع تصميم عصري

import React from 'react';
import type { NotificationListProps } from '../types';
import { NotificationCard } from './NotificationCard';
import { Bell, BellOff, Loader2, ChevronDown } from 'lucide-react';

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  hasMore,
  refreshTime,
  onLoadMore,
  onMarkAsRead,
  onDelete,
  onNotificationClick,
}) => {
  // حالة الفراغ
  if (notifications.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4">
        {/* Icon Container */}
        <div className="relative mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-inner">
            <BellOff className="w-7 h-7 text-gray-400" />
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-100 rounded-full" />
          <div className="absolute -bottom-0.5 -left-2 w-3 h-3 bg-gray-200 rounded-full" />
        </div>
        
        {/* Text */}
        <h3 className="text-sm font-bold text-gray-700 mb-1">لا توجد إشعارات</h3>
        <p className="text-xs text-gray-500 text-center max-w-[180px]">
          ستظهر الإشعارات الجديدة هنا
        </p>
        
        {/* Decorative Bell */}
        <div className="mt-4 flex items-center gap-1.5 text-gray-400">
          <Bell className="w-3 h-3" />
          <span className="text-[10px]">في انتظار الإشعارات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-1">
      {/* قائمة الإشعارات */}
      {notifications.map((notification, index) => (
        <NotificationCard
          key={`${notification._id}-${index}`}
          notification={notification}
          refreshTime={refreshTime}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          onClick={() => onNotificationClick?.(notification)}
        />
      ))}

      {/* زر تحميل المزيد */}
      {hasMore && !isLoading && (
        <div className="p-2">
          <button
            onClick={onLoadMore}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-teal-50 border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 text-xs font-semibold rounded-lg transition-all duration-300 hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>تحميل المزيد</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && notifications.length > 0 && (
        <div className="flex items-center justify-center py-3 gap-1.5 text-emerald-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-medium">جاري التحميل...</span>
        </div>
      )}
    </div>
  );
};
