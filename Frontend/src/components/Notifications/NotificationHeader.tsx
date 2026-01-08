// ============================================================================
// NotificationHeader Component - Refactored & Modular
// ============================================================================
// المكون الرئيسي للإشعارات مع بنية محسنة وقابلة لإعادة الاستخدام

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsSocket } from '../../Socket';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import { useSound } from '@/components/Hooks/useSounds';
import { useNotificationDataOptimized as useNotificationData, usePrayerAlerts } from './hooks';
import type { Notification, NotificationHeaderProps } from './types';
import {
  NotificationBell,
  NotificationDropdownHeader,
  NotificationList,
} from './components';

const NotificationHeader: React.FC<NotificationHeaderProps> = ({ userId }) => {
  // ============================================================================
  // Hooks
  // ============================================================================

  // Socket & Firebase للإشعارات الفورية
  const { lastNotification: socketNotification } = useNotificationsSocket();

  const { lastNotification: firebaseNotification } = useFirebaseMessaging();

  // إدارة بيانات الإشعارات
  const {
    notifications,
    stats,
    isLoading,
    isMarkingAll,
    hasMore,
    loadMore,
    markAllAsReadLocal,
    markNotificationAsRead,
    deleteNotificationLocal,
    addNotification,
  } = useNotificationData({ userId });

  // إدارة الأصوات
  const { playSound } = useSound();

  // تنبيهات الصلاة
  usePrayerAlerts();

  // Navigation
  const navigate = useNavigate();

  // ============================================================================
  // Local State
  // ============================================================================

  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshTime, setRefreshTime] = useState(Date.now());
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleMarkAllAsRead = async () => {
    await markAllAsReadLocal();
  };

  const handleDeleteNotification = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    await deleteNotificationLocal(notificationId);
  };

  const handleNotificationClick = (notification: Notification) => {
    // إغلاق القائمة المنسدلة مباشرةً عند النقر على أي إشعار
    setShowDropdown(false);
    
    // التنقل حسب النوع
    if (notification.type === 'message') {
      localStorage.setItem(
        'chatNotification',
        JSON.stringify(notification.data)
      );
      window.dispatchEvent(new Event('chat-notification-click'));
      navigate('/chat');
    } else if (notification.type === 'news') {
      navigate('/news');
    }
  };

  // ============================================================================
  // Effects
  // ============================================================================

  // تحديث الوقت تلقائياً كل 10 ثواني
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // معالجة الإشعار الجديد من Socket
  useEffect(() => {
    if (socketNotification) {
      console.log('📬 New Socket notification received in NotificationHeader:', {
        id: socketNotification._id,
        type: socketNotification.type,
        title: socketNotification.title,
        isNew: socketNotification.isNew
      });
      
      // التأكد من إضافة الإشعار فوراً
      addNotification(socketNotification as Notification);
      
      // الصوت يتم تشغيله الآن مركزياً في useNotificationsSocket
      // playSound(); 
      
      console.log('✅ Socket notification processed in NotificationHeader');
    }
  }, [socketNotification, addNotification, playSound]);

  // ملاحظة: تم تعطيل Auto-refresh من refreshTrigger لأن addNotification يضيف الإشعار مباشرة
  // لا حاجة لإعادة جلب كل الإشعارات من الخادم

  // معالجة الإشعار من Firebase (بدون fetch لتجنب التكرار)
  useEffect(() => {
    if (firebaseNotification?.notification && userId) {
      console.log('🔥 Firebase notification received:', firebaseNotification);
      // لا نستدعي fetchNotifications هنا لأن Socket سيرسل الإشعار
      // فقط نشغل الصوت إذا لم يكن Socket قد شغله
      // playSound(); // معطل لأن Socket يشغل الصوت
    }
  }, [firebaseNotification, userId]);

  // حساب موضع القائمة المنسدلة - محاذاة ذكية (RTL/LTR)
  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return;
        
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const dropdownWidth = screenWidth >= 640 ? 380 : 320;
        
        // تحديد المحاذاة بناءً على موقع الزر في الشاشة
        // إذا كان الزر في النصف الأيسر (كما في RTL)، نحاذي الحافة اليسرى
        // إذا كان في النصف الأيمن، نحاذي الحافة اليمنى
        let rightPosition;
        
        if (buttonRect.left < screenWidth / 2) {
          // محاذاة الحافة اليسرى للقائمة مع الحافة اليسرى للزر
          // right = screenWidth - (buttonRect.left + dropdownWidth)
          rightPosition = screenWidth - (buttonRect.left + dropdownWidth);
        } else {
          // محاذاة الحافة اليمنى للقائمة مع الحافة اليمنى للزر
          rightPosition = screenWidth - buttonRect.right;
        }
        
        // حساب الموضع العمودي - مباشرة تحت الزر مع مسافة صغيرة
        let topPosition = buttonRect.bottom + 6;
        
        // إذا لم يكن هناك مساحة كافية في الأسفل، افتح القائمة للأعلى
        const estimatedHeight = Math.min(500, screenHeight * 0.7);
        if (topPosition + estimatedHeight > screenHeight - 16) {
          topPosition = buttonRect.top - estimatedHeight - 6;
          if (topPosition < 16) {
            topPosition = 16;
          }
        }
        
        setDropdownPosition({
          top: Math.max(16, topPosition),
          right: rightPosition,
        });
      };
      
      // حساب الموضع فوراً
      updatePosition();
      
      // إعادة حساب الموضع عند تغيير حجم النافذة أو التمرير
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [showDropdown]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <div className="relative" ref={dropdownRef} dir="rtl">
        {/* زر الإشعارات */}
        <NotificationBell
          unreadCount={stats.unreadCount}
          onClick={() => setShowDropdown(!showDropdown)}
          buttonRef={buttonRef}
        />

        {/* Overlay للإغلاق */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-[140]"
            onClick={() => setShowDropdown(false)}
          />
        )}

        {/* القائمة المنسدلة */}
        {showDropdown && (
          <div 
            className="fixed w-[320px] sm:w-[380px] bg-white rounded-xl shadow-2xl z-[150] animate-slideDown border border-gray-200 flex flex-col max-h-[70vh] sm:max-h-[500px]"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس القائمة */}
            <div className="flex-shrink-0 rounded-t-2xl overflow-hidden">
              <NotificationDropdownHeader
                unreadCount={stats.unreadCount}
                isMarkingAll={isMarkingAll}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClose={() => setShowDropdown(false)}
              />
            </div>

            {/* محتوى الإشعارات */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-gray-50 to-white rounded-b-2xl min-h-0">
              <NotificationList
                notifications={notifications}
                isLoading={isLoading}
                hasMore={hasMore}
                refreshTime={refreshTime}
                onLoadMore={loadMore}
                onMarkAsRead={markNotificationAsRead}
                onDelete={handleDeleteNotification}
                onNotificationClick={handleNotificationClick}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationHeader;
