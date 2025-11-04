// ============================================================================
// NotificationList Component
// ============================================================================
// قائمة الإشعارات مع حالات التحميل والفارغة

import React from 'react';
import type { NotificationListProps } from '../types';
import { NotificationCard } from './NotificationCard';
import { LoadingSpinner, EmptyState, Button } from '@/components/UI';

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
  // حالة التحميل الأولي
  if (isLoading && notifications.length === 0) {
    return <LoadingSpinner size="lg" text="جاري التحميل..." />;
  }

  // حالة الفراغ
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon="🔕"
        title="لا توجد إشعارات"
        description="ستظهر الإشعارات الجديدة هنا"
      />
    );
  }

  return (
    <>
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
        <div className="p-4 text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onLoadMore}
            leftIcon={<span>📥</span>}>
            تحميل المزيد
          </Button>
        </div>
      )}

      {/* حالة التحميل للمزيد */}
      {isLoading && notifications.length > 0 && (
        <LoadingSpinner size="md" text="جاري التحميل..." />
      )}
    </>
  );
};
