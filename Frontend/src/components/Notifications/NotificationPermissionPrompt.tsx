// ============================================================================
// NotificationPermissionPrompt Component
// ============================================================================
// Component to request notification permissions from user
// Shows a beautiful modal when user logs in
// ============================================================================

import React, { useState, useEffect } from 'react';
import type { NotificationPermissionPromptProps } from './types';
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";

/**
 * مكون لطلب صلاحيات الإشعارات من المستخدم
 * يظهر نافذة منبثقة جميلة عند تسجيل الدخول
 */
export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({
  autoShow = false,
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { requestPermission } = useFirebaseMessaging();

  useEffect(() => {
    // Check if permission is already granted (direct check for instant response)
    if (Notification.permission === 'granted') {
      return;
    }

    // Check if user already dismissed the prompt
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    if (dismissed === 'true') {
      return;
    }

    // Show prompt after a delay (only for default permission state)
    if (autoShow && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000); // Wait 2 seconds after page load

      return () => clearTimeout(timer);
    }
  }, [autoShow]);

  const handleAllow = async () => {
    await requestPermission();
    setIsVisible(false);
    
    // Check if permission was granted
    if (Notification.permission === 'granted') {
      onPermissionGranted?.();
    } else {
      onPermissionDenied?.();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('notificationPromptDismissed', 'true');
    onPermissionDenied?.();
  };

  // Don't show if already granted or not visible
  if (!isVisible || Notification.permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 via-purple-900/30 to-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 animate-slideUp border border-purple-100/50">
        {/* Icon with animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 p-5 rounded-full shadow-lg">
              <svg
                className="w-14 h-14 text-white animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title with gradient */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent text-center mb-3">
          تفعيل الإشعارات 🔔
        </h2>

        {/* Description */}
        <p className="text-gray-700 text-center mb-6 font-medium leading-relaxed">
          احصل على إشعارات فورية للأخبار والأنشطة والرسائل الجديدة. 
          <span className="block mt-1 text-purple-600 font-semibold">لن تفوتك أي تحديثات مهمة! ✨</span>
        </p>

        {/* Benefits with beautiful cards */}
        <div className="space-y-3 mb-7">
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-200">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">📰 إشعارات الأخبار والأنشطة الجديدة</span>
          </div>
          
          <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-indigo-50 p-3 rounded-xl border border-pink-100 hover:shadow-md transition-all duration-200">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">💬 تنبيهات الرسائل الخاصة</span>
          </div>
          
          <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-100 hover:shadow-md transition-all duration-200">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">📊 تحديثات الدرجات والتقييمات</span>
          </div>
        </div>

        {/* Buttons with modern style */}
        <div className="flex gap-3">
          <button
            onClick={handleAllow}
            className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform"
          >
            🎉 تفعيل الآن
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-6 py-4 text-gray-600 hover:text-gray-800 font-bold text-lg hover:bg-gray-100 rounded-2xl transition-all duration-200"
          >
            ⏰ لاحقاً
          </button>
        </div>

        {/* Privacy note with icon */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-gray-500">
            يمكنك تعطيل الإشعارات في أي وقت من إعدادات المتصفح
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionPrompt;
