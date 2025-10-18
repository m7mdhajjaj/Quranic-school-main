// ============================================================================
// NotificationPrompt Component
// ============================================================================
// مكون لطلب صلاحيات الإشعارات من المستخدم
// يظهر كـ banner في أعلى الصفحة عندما لا تكون الصلاحيات ممنوحة
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationPromptProps {
  onRequestPermission: () => Promise<void>;
  isPermissionGranted: boolean;
}

/**
 * مكون لعرض طلب تفعيل الإشعارات
 */
export const NotificationPrompt: React.FC<NotificationPromptProps> = ({
  onRequestPermission,
  isPermissionGranted,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // إخفاء البانر إذا تم منح الصلاحيات أو إذا تم رفضها مسبقاً
    const dismissed = localStorage.getItem('notification_prompt_dismissed');
    
    if (Notification.permission === 'default' && !dismissed && !isPermissionGranted) {
      // إظهار البانر بعد 3 ثواني من فتح الصفحة
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isPermissionGranted]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // حفظ في localStorage لعدم إظهاره مرة أخرى (لمدة أسبوع)
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // أسبوع
    localStorage.setItem('notification_prompt_dismissed', expiry.toString());
  };

  const handleAllow = async () => {
    try {
      await onRequestPermission();
      setIsVisible(false);
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  if (!isVisible || isDismissed || isPermissionGranted) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg animate-slideDown">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Icon & Message */}
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base">
                فعّل الإشعارات لتبقى على اطلاع دائم
              </p>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                احصل على تنبيهات فورية للإعلانات، الدرجات، والأنشطة المهمة
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAllow}
              className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition-colors"
            >
              تفعيل
            </button>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
