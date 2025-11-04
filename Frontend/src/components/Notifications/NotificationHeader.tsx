// ============================================================================
// NotificationHeader Component - Refactored & Modular
// ============================================================================
// المكون الرئيسي للإشعارات مع بنية محسنة وقابلة لإعادة الاستخدام

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsSocket } from '../../Socket';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import { useSound } from '@/components/Hooks/useSounds';
import { useNotificationData, usePrayerAlerts } from './hooks';
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
  const {
    lastNotification: socketNotification,
    refreshTrigger,
  } = useNotificationsSocket();

  const { lastNotification: firebaseNotification } = useFirebaseMessaging();

  // إدارة بيانات الإشعارات
  const {
    notifications,
    stats,
    isLoading,
    isMarkingAll,
    hasMore,
    fetchNotifications,
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

  const dropdownRef = useRef<HTMLDivElement>(null);

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
    // التنقل حسب النوع
    if (notification.type === 'message') {
      localStorage.setItem(
        'chatNotification',
        JSON.stringify({
          senderId: notification.data?.senderId,
          recipientId: notification.data?.recipientId,
        })
      );
      navigate('/chat');
      setShowDropdown(false);
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

  // Auto-refresh عند وصول إشعار جديد من Socket
  useEffect(() => {
    if (refreshTrigger > 0 && userId) {
      console.log('🔄 Auto-refresh triggered by Socket notification');
      fetchNotifications(1, true);
    }
  }, [refreshTrigger, userId, fetchNotifications]);

  // معالجة الإشعار الجديد من Socket
  useEffect(() => {
    if (socketNotification) {
      console.log('📬 New Socket notification:', socketNotification);
      addNotification(socketNotification as Notification);
      playSound();
    }
  }, [socketNotification, addNotification, playSound]);

  // معالجة الإشعار من Firebase
  useEffect(() => {
    if (firebaseNotification?.notification && userId) {
      console.log('🔥 Firebase notification received:', firebaseNotification);
      fetchNotifications(1, true);
      playSound();
    }
  }, [firebaseNotification, userId, fetchNotifications, playSound]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <div
        className={`relative ${showDropdown ? 'z-50' : ''}`}
        ref={dropdownRef}
        dir="rtl"
      >
        {/* زر الإشعارات */}
        <NotificationBell
          unreadCount={stats.unreadCount}
          onClick={() => setShowDropdown(!showDropdown)}
        />

        {/* القائمة المنسدلة */}
        {showDropdown && (
          <div className="absolute top-full left-0 sm:left-0 mt-3 w-screen sm:w-[420px] max-w-[95vw] sm:max-w-none max-h-[85vh] sm:max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden z-[1000] animate-slideDown -ml-4 sm:ml-0 border border-gray-200">
            {/* رأس القائمة */}
            <NotificationDropdownHeader
              unreadCount={stats.unreadCount}
              isMarkingAll={isMarkingAll}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClose={() => setShowDropdown(false)}
            />

            {/* محتوى الإشعارات */}
            <div className="max-h-[calc(85vh-120px)] sm:max-h-[450px] overflow-y-auto custom-scrollbar bg-gradient-to-b from-gray-50 to-white">
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
