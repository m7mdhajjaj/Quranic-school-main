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
      <div className="flex flex-col items-center justify-center py-16 px-6">
        {/* Icon Container */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
            <BellOff className="w-10 h-10 text-gray-400" />
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 rounded-full" />
          <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-gray-200 rounded-full" />
        </div>
        
        {/* Text */}
        <h3 className="text-lg font-bold text-gray-700 mb-2">لا توجد إشعارات</h3>
        <p className="text-sm text-gray-500 text-center max-w-[200px]">
          ستظهر الإشعارات الجديدة هنا عندما تصلك
        </p>
        
        {/* Decorative Bell */}
        <div className="mt-6 flex items-center gap-2 text-gray-400">
          <Bell className="w-4 h-4" />
          <span className="text-xs">في انتظار الإشعارات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
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
        <div className="p-4">
          <button
            onClick={onLoadMore}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-teal-50 border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <ChevronDown className="w-4 h-4" />
            <span>تحميل المزيد</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && notifications.length > 0 && (
        <div className="flex items-center justify-center py-4 gap-2 text-emerald-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">جاري التحميل...</span>
        </div>
      )}
    </div>
  );
};
