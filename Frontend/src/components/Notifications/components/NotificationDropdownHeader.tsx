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
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            {/* Icon Container */}
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg shadow-emerald-700/20">
              <Bell className="w-5 h-5 text-white" />
            </div>
            
            {/* Title & Badge */}
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-white tracking-tight">
                الإشعارات
              </h3>
              {unreadCount > 0 && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3 h-3 text-emerald-200" />
                  <span className="text-xs font-medium text-emerald-100">
                    {unreadCount} جديد
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                disabled={isMarkingAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                title="تحديد الكل كمقروء"
              >
                {isMarkingAll ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">قراءة الكل</span>
                  </>
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 hover:text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              title="إغلاق"
              aria-label="إغلاق قائمة الإشعارات"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
