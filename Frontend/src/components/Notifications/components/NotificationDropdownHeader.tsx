// ============================================================================
// NotificationDropdownHeader Component
// ============================================================================
// رأس القائمة المنسدلة

import React from 'react';
import { Button, Badge } from '@/components/UI';
import { IoClose } from 'react-icons/io5';

interface NotificationDropdownHeaderProps {
  unreadCount: number;
  isMarkingAll: boolean;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export const NotificationDropdownHeader: React.FC<NotificationDropdownHeaderProps> = ({
  unreadCount,
  isMarkingAll,
  onMarkAllAsRead,
  onClose,
}) => {
  return (
    <div className="p-4 sm:p-5 border-b-2 border-gray-100 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-3xl">🔔</div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-md">
              الإشعارات
            </h3>
            <div className="flex items-center gap-2 text-xs text-white/90">
              {unreadCount > 0 && (
                <Badge variant="info" size="sm" className="bg-white/20 text-white border-white/30">
                  {unreadCount} <span className="hidden sm:inline">جديد</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={unreadCount > 0 ? 'success' : 'ghost'}
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0 || isMarkingAll}
            loading={isMarkingAll}
            leftIcon={!isMarkingAll && <span>✓</span>}
            className="backdrop-blur-sm text-white border-none shadow-lg hover:shadow-xl"
            title={unreadCount === 0 ? 'لا توجد إشعارات غير مقروءة' : 'تحديد الكل كمقروء'}>
            <span className="hidden sm:inline">
              {isMarkingAll ? 'جاري التحديث...' : 'تحديد الكل كمقروء'}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm border-none p-2 hover:rotate-90"
            title="إغلاق"
            aria-label="إغلاق قائمة الإشعارات">
            <IoClose size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
};
