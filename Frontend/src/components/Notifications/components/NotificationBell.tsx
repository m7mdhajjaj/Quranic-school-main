// ============================================================================
// NotificationBell Component - Modern & Beautiful
// ============================================================================
// زر الإشعارات العصري مع تأثيرات متقدمة

import React from 'react';
import type { NotificationBellProps } from '../types';
import { Bell } from 'lucide-react';

export const NotificationBell: React.FC<NotificationBellProps & { buttonRef?: React.RefObject<HTMLButtonElement> }> = ({ unreadCount, onClick, buttonRef }) => {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="relative group"
      onClick={onClick}
      title="الإشعارات"
      aria-label="فتح/إغلاق الإشعارات">
      {/* Main Button Container */}
      <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-teal-50 border border-gray-200 hover:border-emerald-200 shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 group-hover:scale-105 group-active:scale-95 overflow-hidden">
        
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 via-teal-400/0 to-cyan-400/0 group-hover:from-emerald-400/10 group-hover:via-teal-400/10 group-hover:to-cyan-400/10 transition-all duration-500" />
        
        {/* Bell Icon */}
        <Bell className="relative z-10 w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition-all duration-300 group-hover:animate-[wiggle_0.5s_ease-in-out]" />

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      </div>

      {/* Badge */}
      {unreadCount > 0 && (
        <div className="absolute -top-1.5 -right-1.5 z-20">
          {/* Pulse Ring */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-rose-500 animate-ping opacity-50" />
          
          {/* Badge Container */}
          <span className="relative flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 text-white text-[10px] font-bold rounded-full shadow-lg shadow-red-500/40 ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
        <span className="flex items-center gap-1.5">
          <Bell className="w-3 h-3" />
          {unreadCount > 0 ? `${unreadCount} إشعار جديد` : 'الإشعارات'}
        </span>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </div>
    </button>
  );
};
