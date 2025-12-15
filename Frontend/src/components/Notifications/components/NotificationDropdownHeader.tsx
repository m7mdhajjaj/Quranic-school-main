// ============================================================================
// NotificationDropdownHeader Component
// ============================================================================
// رأس القائمة المنسدلة

import React from 'react';
import type { NotificationDropdownHeaderProps } from '../types';
import { Button, Badge } from '@/components/UI';
import { IoClose } from 'react-icons/io5';

export const NotificationDropdownHeader: React.FC<NotificationDropdownHeaderProps> = ({
  unreadCount,
  isMarkingAll,
  onMarkAllAsRead,
  onClose,
}) => {
  return (
    <div className="p-3 border-b border-gray-200 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="text-2xl">🔔</div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-bold text-white drop-shadow-sm">
              الإشعارات
            </h3>
            {unreadCount > 0 && (
              <Badge variant="info" size="sm" className="bg-white/20 text-white border-white/30 text-xs">
                {unreadCount} جديد
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={isMarkingAll}
              loading={isMarkingAll}
              className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm border-none px-2 py-1 text-xs"
              title="تحديد الكل كمقروء">
              <span className="text-xs">✓</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm border-none p-1.5"
            title="إغلاق"
            aria-label="إغلاق قائمة الإشعارات">
            <IoClose size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
