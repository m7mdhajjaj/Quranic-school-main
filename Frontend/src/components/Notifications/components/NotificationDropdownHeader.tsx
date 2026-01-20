// ============================================================================
// NotificationDropdownHeader Component - Modern Design
// ============================================================================
// رأس القائمة المنسدلة بتصميم عصري

import React from 'react';
import type { NotificationDropdownHeaderProps } from '../types';
import { Bell, CheckCheck, X, Sparkles } from 'lucide-react';

export const NotificationDropdownHeader: React.FC<NotificationDropdownHeaderProps> = ({
  unreadCount,
  isMarkingAll,
  onMarkAllAsRead,
  onClose,
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Content */}
      <div className="relative px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Title Section */}
          <div className="flex items-center gap-2">
            {/* Icon Container */}
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg shadow-md">
              <Bell className="w-4 h-4 text-white" />
            </div>
            
            {/* Title & Badge */}
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white tracking-tight">
                الإشعارات
              </h3>
              {unreadCount > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-200" />
                  <span className="text-[10px] font-medium text-emerald-100">
                    {unreadCount} جديد
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                disabled={isMarkingAll}
                className="flex items-center gap-1 px-2 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-[10px] font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                title="تحديد الكل كمقروء"
              >
                {isMarkingAll ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">قراءة الكل</span>
                  </>
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 hover:text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              title="إغلاق"
              aria-label="إغلاق قائمة الإشعارات"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
