// ============================================================================
// NotificationBell Component - Modern & Beautiful
// ============================================================================
// زر الإشعارات العصري مع تأثيرات متقدمة

import React from 'react';
import type { NotificationBellProps } from '../types';
import { IoNotificationsOutline } from 'react-icons/io5';

export const NotificationBell: React.FC<NotificationBellProps> = ({ unreadCount, onClick }) => {
  return (
    <button
      type="button"
      className="relative group"
      onClick={onClick}
      title="الإشعارات"
      aria-label="فتح/إغلاق الإشعارات">
      {/* Container with gradient background */}
      <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-active:scale-95 overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-cyan-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Bell Icon with animation */}
        <IoNotificationsOutline className="relative z-10 w-6 h-6 text-slate-700 dark:text-slate-200 group-hover:animate-[swing_0.5s_ease-in-out] transition-colors duration-300" />

        {/* Ripple effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      </div>

      {/* Badge with modern design */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 text-white text-[10px] font-bold rounded-full shadow-lg shadow-red-500/50 ring-2 ring-white dark:ring-slate-900 animate-[bounce_1s_ease-in-out_infinite]">
          <span className="relative z-10">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
        </span>
      )}

      {/* Tooltip on hover */}
      {/* Tooltip on hover */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
        {unreadCount > 0 ? `${unreadCount} إشعار جديد` : 'الإشعارات'}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45"></div>
      </div>
    </button>
  );
};
