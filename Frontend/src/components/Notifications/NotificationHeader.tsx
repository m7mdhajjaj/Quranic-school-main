import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationsSocket } from "../../Socket"; // ✅ استخدام نظام Socket الجديد للإشعارات
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging"; // ✅ Firebase للإشعارات Push
import { socketManager } from "../../Socket"; // ✅ للاستماع لأحداث الصلاة
import Swal from "sweetalert2";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/Api/notificationApi";

interface Notification {
  _id: string;
  type:
    | "grade"
    | "message"
    | "prayer_time"
    | "activity"
    | "attendance"
    | "exam"
    | "general";
  title: string;
  message: string;
  createdAt: string; // وقت الإنشاء في قاعدة البيانات
  sentAt: string; // وقت الإرسال الفعلي
  isRead: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  isNew?: boolean;
  data?: any;
}

interface NotificationStats {
  unreadCount: number;
  newCount: number;
  totalCount: number;
}

interface NotificationHeaderProps {
  userId: string;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  userId,
}) => {
  // ✅ استخدام نظام Socket الجديد للإشعارات (مع auto-refresh)
  const {
    isConnected,
    lastNotification: socketNotification,
    notificationStats: socketStats,
    refreshTrigger,
  } = useNotificationsSocket();

  // ✅ استخدام Firebase للإشعارات Push
  const { lastNotification: firebaseNotification } = useFirebaseMessaging();

  // الحالات المحلية
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshTime, setRefreshTime] = useState(Date.now()); // لتحديث الوقت تلقائياً
  
  const [stats, setStats] = useState<NotificationStats>({
    unreadCount: 0,
    newCount: 0,
    totalCount: 0,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // ✅ نظام Toast مخصص بسيط
  const [toastMessage, setToastMessage] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'info' });

  // ✅ تحديث الوقت تلقائياً كل 10 ثواني (ديناميكي وسريع)
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(Date.now());
    }, 10000); // كل 10 ثواني

    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage({ show: true, message, type });
    setTimeout(() => {
      setToastMessage({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  // 🔧 تفعيل وضع المطور (اضغط D ثلاث مرات)
  useEffect(() => {
    let dCount = 0;
    let dTimer: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      // التأكد من أن المستخدم لا يكتب في input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // اضغط D ثلاث مرات خلال ثانيتين
      if (e.key === 'd' || e.key === 'D') {
        dCount++;
        
        if (dCount === 1) {
          dTimer = setTimeout(() => {
            dCount = 0;
          }, 2000);
        }
        
        if (dCount === 3) {
          e.preventDefault();
          const currentMode = (window as any).__DEV_MODE__;
          (window as any).__DEV_MODE__ = !currentMode;
          
          const newMode = (window as any).__DEV_MODE__;
          console.log(`🔧 وضع المطور: ${newMode ? 'مُفعَّل ✅' : 'مُعطَّل ❌'}`);
          
          // إعادة رسم المكون
          setStats(prev => ({...prev}));
          
          // إظهار تنبيه بصري
          const msg = newMode ? '🔧 وضع المطور مُفعَّل' : '❌ وضع المطور مُعطَّل';
          const toast = document.createElement('div');
          toast.textContent = msg;
          toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${newMode ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease-out;
          `;
          document.body.appendChild(toast);
          setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
          }, 2000);
          
          clearTimeout(dTimer);
          dCount = 0;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (dTimer) clearTimeout(dTimer);
    };
  }, []);

  // ✅ إنشاء صوت الإشعار
  useEffect(() => {
    // إنشاء عنصر الصوت - استخدام notification.mp3 من مجلد sounds
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.6; // حجم الصوت 60% (يمكن تعديله من 0.0 إلى 1.0)
    audio.preload = 'auto'; // تحميل مسبق للصوت
    notificationSound.current = audio;
    
    // في حالة عدم وجود الملف، استخدام صوت افتراضي
    audio.addEventListener('error', () => {
      console.warn('⚠️ لم يتم العثور على ملف notification.mp3، سيتم استخدام صوت افتراضي');
      // يمكن استخدام Web Audio API لإنشاء نغمة بسيطة
      notificationSound.current = null;
    });
  }, []);

  // جلب الإشعارات عند التحميل الأول
  useEffect(() => {
    if (userId) {
      fetchNotifications(1, true);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // تم إزالة نظام الحذف التلقائي للإشعارات (expiresAt تم حذفه)

  // ✅ Auto-refresh عند وصول إشعار جديد من Socket
  useEffect(() => {
    if (refreshTrigger > 0 && userId) {
      console.log('🔄 [NotificationHeader] Auto-refresh triggered by Socket notification');
      fetchNotifications(1, true);
    }
  }, [refreshTrigger, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ معالجة الإشعار الجديد من Socket
  useEffect(() => {
    if (socketNotification) {
      console.log('📬 [NotificationHeader] New Socket notification:', socketNotification);
      
      // إضافة sentAt إذا لم يكن موجوداً
      const notificationWithSentAt = {
        ...socketNotification,
        sentAt: (socketNotification as any).sentAt || socketNotification.createdAt || new Date().toISOString()
      };
      
      // إضافة الإشعار للقائمة مع إعادة الترتيب
      setNotifications((prev) => {
        const updated = [notificationWithSentAt, ...prev];
        // ترتيب: الغير مقروء أولاً ثم الأحدث
        return updated.sort((a, b) => {
          if (!a.isRead && b.isRead) return -1;
          if (a.isRead && !b.isRead) return 1;
          const dateA = new Date(a.sentAt || a.createdAt).getTime();
          const dateB = new Date(b.sentAt || b.createdAt).getTime();
          return dateB - dateA;
        });
      });
      
      // تحديث الإحصائيات
      setStats((prev) => ({
        unreadCount: prev.unreadCount + 1,
        newCount: prev.newCount + 1,
        totalCount: prev.totalCount + 1,
      }));
      
      // عرض Toast notification
      showToastNotification(notificationWithSentAt);
      playNotificationSound();
    }
  }, [socketNotification]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ معالجة الإشعار من Firebase (عندما التطبيق في الخلفية)
  useEffect(() => {
    if (firebaseNotification?.notification && userId) {
      console.log('🔥 [NotificationHeader] Firebase notification received:', firebaseNotification);
      
      // تحديث الإشعارات من الخادم
      fetchNotifications(1, true);
      
      playNotificationSound();
    }
  }, [firebaseNotification, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // نظام التحديث التلقائي للإشعارات (احتياطي)
  useEffect(() => {
    if (!userId) return;

    // تحديث تلقائي كل 60 ثانية عندما Socket غير متصل
    const refreshInterval = setInterval(() => {
      if (!isConnected && !isLoading) {
        console.log("🔔 تحديث تلقائي للإشعارات (وضع احتياطي)");
        fetchNotifications(1, true);
      }
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [userId, isConnected, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // الاستماع للإشعارات الجديدة من Socket.IO (تم نقلها لـ useNotificationsSocket)

  // استماع لأحداث الصلاة (التنبيه قبل 10 دقائق والأذان)
  useEffect(() => {
    const socketInstance = socketManager.getSocket();
    if (!socketInstance) return;

    // التنبيه قبل 10 دقائق من الصلاة
    const handlePrayerReminder = (data: {
      prayerName: string;
      prayerTime: string;
      emoji: string;
      minutesRemaining: number;
    }) => {
      console.log("⏰ Prayer reminder received:", data);
      
      // تشغيل صوت التنبيه
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.7;
        audio.play().catch((err) => console.error("Error playing sound:", err));
      } catch (error) {
        console.error("Error playing notification sound:", error);
      }

      // عرض Sweet Alert
      Swal.fire({
        title: `${data.emoji} تنبيه صلاة ${data.prayerName}`,
        html: `
          <div class="text-center">
            <div class="text-6xl mb-4">${data.emoji}</div>
            <p class="text-xl mb-2">باقي <strong>10 دقائق</strong> على صلاة ${data.prayerName}</p>
            <p class="text-lg text-gray-600">الوقت: ${data.prayerTime}</p>
            <p class="text-md text-emerald-600 mt-4">🕌 استعدوا للصلاة</p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#10b981",
        timer: 10000,
        timerProgressBar: true,
        backdrop: `
          rgba(0,123,255,0.1)
          left top
          no-repeat
        `,
      });
    };

    // الأذان عند وقت الصلاة
    const handlePrayerAdhan = (data: {
      prayerName: string;
      prayerTime: string;
      emoji: string;
      isAdhan: boolean;
    }) => {
      console.log("🔔 Prayer adhan received:", data);
      
      // تشغيل صوت الأذان أو تنبيه قوي
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 1.0;
        audio.play().catch((err) => console.error("Error playing sound:", err));
      } catch (error) {
        console.error("Error playing adhan sound:", error);
      }

      // عرض Sweet Alert مع أنيميشن
      Swal.fire({
        title: `${data.emoji} أذان ${data.prayerName}`,
        html: `
          <div class="text-center">
            <div class="text-8xl mb-4 animate-bounce">${data.emoji}</div>
            <p class="text-2xl font-bold mb-2">🕌 حان وقت صلاة ${data.prayerName}</p>
            <p class="text-xl text-gray-600 mb-4">${data.prayerTime}</p>
            <div class="text-3xl text-emerald-600 font-arabic mb-2">
              الله أكبر الله أكبر
            </div>
            <p class="text-lg text-gray-500">بارك الله فيكم</p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "الذهاب للصلاة",
        confirmButtonColor: "#059669",
        showCloseButton: true,
        allowOutsideClick: false,
        backdrop: `
          rgba(16,185,129,0.2)
          left top
          no-repeat
        `,
        customClass: {
          popup: "animate__animated animate__fadeInDown",
        },
      });
    };

    socketInstance.on("prayerReminder", handlePrayerReminder);
    socketInstance.on("prayerAdhan", handlePrayerAdhan);

    return () => {
      socketInstance.off("prayerReminder", handlePrayerReminder);
      socketInstance.off("prayerAdhan", handlePrayerAdhan);
    };
  }, []);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // جلب الإشعارات من الخادم
  const fetchNotifications = async (
    pageNum: number = 1,
    reset: boolean = false
  ) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const data = await getRecentNotifications(userId, 20);

      console.log("📬 البيانات المستلمة من API:", data);

      // ✅ التحقق من نوع البيانات المستلمة وتحويلها لـ array
      let notificationsArray: any[] = [];

      if (Array.isArray(data)) {
        notificationsArray = data;
      } else if (
        (data as any)?.notifications &&
        Array.isArray((data as any).notifications)
      ) {
        notificationsArray = (data as any).notifications;
      } else if ((data as any)?.data && Array.isArray((data as any).data)) {
        notificationsArray = (data as any).data;
      } else {
        console.warn("⚠️ البيانات ليست array:", data);
        notificationsArray = [];
      }

      const newNotifications: Notification[] = notificationsArray.map(
        (apiNotification) => {
          // ✅ طباعة البيانات الخام للتحقق
          console.log('🔍 Raw notification data:', {
            _id: apiNotification._id,
            type: apiNotification.type,
            createdAt: apiNotification.createdAt,
            sentAt: apiNotification.sentAt,
          });

          return {
            _id: apiNotification._id,
            type: apiNotification.type as
              | "grade"
              | "message"
              | "prayer_time"
              | "activity"
              | "attendance"
              | "general",
            title: apiNotification.title,
            message: apiNotification.message,
            createdAt: apiNotification.createdAt || new Date().toISOString(), // ✅ fallback
            sentAt: apiNotification.sentAt || apiNotification.createdAt || new Date().toISOString(), // ✅ وقت الإرسال
            isRead: apiNotification.isRead,
            priority: apiNotification.priority || "medium",
            isNew: false,
            data: apiNotification.metadata,
          };
        }
      );

      // ✅ ترتيب الإشعارات: الأولوية للغير مقروء ثم الأحدث
      const sortedNotifications = newNotifications.sort((a, b) => {
        // 1. الأولوية للغير مقروء
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        
        // 2. ترتيب حسب التاريخ (الأحدث أولاً)
        const dateA = new Date(a.sentAt || a.createdAt).getTime();
        const dateB = new Date(b.sentAt || b.createdAt).getTime();
        return dateB - dateA; // الأحدث أولاً
      });

      if (reset) {
        setNotifications(sortedNotifications);
      } else {
        // عند التحميل الإضافي، نضيف ثم نرتب
        setNotifications((prev) => {
          const combined = [...prev, ...sortedNotifications];
          return combined.sort((a, b) => {
            if (!a.isRead && b.isRead) return -1;
            if (a.isRead && !b.isRead) return 1;
            const dateA = new Date(a.sentAt || a.createdAt).getTime();
            const dateB = new Date(b.sentAt || b.createdAt).getTime();
            return dateB - dateA;
          });
        });
      }

      // جلب إحصائيات الإشعارات
      try {
        const unreadCount = await getUnreadNotificationCount(userId);
        setStats({
          unreadCount,
          newCount: 0,
          totalCount: newNotifications.length,
        });
      } catch (statsError) {
        console.warn("⚠️ خطأ في جلب إحصائيات الإشعارات:", statsError);
        setStats({
          unreadCount: newNotifications.filter((n) => !n.isRead).length,
          newCount: 0,
          totalCount: newNotifications.length,
        });
      }

      setPage(pageNum);
      setHasMore(newNotifications.length === 20);
    } catch (error) {
      console.error("❌ خطأ في جلب الإشعارات:", error);
      // تعيين array فارغ في حالة الخطأ
      setNotifications([]);
      setStats({ unreadCount: 0, newCount: 0, totalCount: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // تحميل المزيد من الإشعارات
  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchNotifications(page + 1, false);
    }
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsReadLocal = async () => {
    if (stats.unreadCount === 0 || isMarkingAll) return;

    try {
      setIsMarkingAll(true);
      await markAllAsRead(userId);

      // تحديث الحالة محليًا
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, isNew: false }))
      );
      setStats((prev) => ({ ...prev, unreadCount: 0, newCount: 0 }));
      
      showToast("✅ تم تحديد الكل كمقروء", "success");
    } catch (e) {
      console.error("Error in mark all as read:", e);
      showToast("❌ تعذّر تحديد الكل كمقروء", "error");
    } finally {
      setIsMarkingAll(false);
    }
  };

  // تحديد إشعار واحد كمقروء عند الضغط عليه
  const markNotificationAsRead = async (notificationId: string) => {
    const notification = notifications.find((n) => n._id === notificationId);
    
    // إذا كان مقروء مسبقاً، لا داعي لإعادة التحديد
    if (!notification || notification.isRead) return;

    try {
      // تحديث في الخادم
      await markAsRead(notificationId);

      // تحديث محلياً
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true, isNew: false } : n
        )
      );

      // تحديث العدادات
      setStats((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        newCount: notification.isNew ? Math.max(0, prev.newCount - 1) : prev.newCount,
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // حذف إشعار
  const deleteNotificationLocal = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    try {
      await deleteNotification(notificationId);

      const deletedNotification = notifications.find(
        (n) => n._id === notificationId
      );

      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setStats((prev) => ({
        ...prev,
        totalCount: prev.totalCount - 1,
        unreadCount:
          deletedNotification && !deletedNotification.isRead
            ? prev.unreadCount - 1
            : prev.unreadCount,
        newCount:
          deletedNotification && deletedNotification.isNew
            ? prev.newCount - 1
            : prev.newCount,
      }));
      showToast("تم حذف الإشعار بنجاح", "success");
    } catch (error) {
      console.error("Error deleting notification:", error);
      showToast("خطأ في حذف الإشعار", "error");
    }
  };

  // إظهار toast notification
  const showToastNotification = (notification: Notification) => {
    // لا حاجة للعرض المنبثق - الإشعار موجود في القائمة
    console.log('📬 إشعار جديد:', notification.title);
  };

  // تشغيل صوت الإشعار
  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.play().catch((e) => {
        console.log("Could not play notification sound:", e);
      });
    }
  };

  // الحصول على أيقونة الإشعار حسب النوع
  const getNotificationIcon = (type: string) => {
    const icons = {
      grade: "🎯",
      message: "💬",
      prayer_time: "🕌",
      activity: "✨",
      attendance: "⚡",
      exam: "📝",
      general: "🔔",
    };
    return icons[type as keyof typeof icons] || "🔔";
  };

  // تنسيق الوقت النسبي (منذ متى) - ديناميكي ومتجدد تلقائياً
  const formatDate = (dateString: string) => {
    try {
      // ✅ التعامل مع صيغة ISO 8601 من MongoDB
      // مثال: 2025-10-26T20:31:51.766+00:00
      const date = new Date(dateString);
      
      // التحقق من صحة التاريخ
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date:', dateString);
        return "توقيت غير صحيح";
      }

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);
      const diffInYears = Math.floor(diffInDays / 365);

      // تم الإرسال الآن (أقل من 10 ثواني)
      if (diffInSeconds < 10) return "تم الإرسال الآن";
      
      // تم الإرسال قبل X ثانية (أقل من دقيقة)
      if (diffInSeconds < 60) {
        return `قبل ${diffInSeconds} ثانية`;
      }
      
      // تم الإرسال قبل X دقيقة (أقل من ساعة)
      if (diffInMinutes < 60) {
        return `قبل ${diffInMinutes} ${diffInMinutes === 1 ? 'دقيقة' : diffInMinutes === 2 ? 'دقيقتين' : 'دقائق'}`;
      }
      
      // تم الإرسال قبل X ساعة (أقل من 24 ساعة)
      if (diffInHours < 24) {
        return `قبل ${diffInHours} ${diffInHours === 1 ? 'ساعة' : diffInHours === 2 ? 'ساعتين' : 'ساعات'}`;
      }
      
      // تم الإرسال منذ X يوم (أقل من أسبوع)
      if (diffInDays < 7) {
        return `منذ ${diffInDays} ${diffInDays === 1 ? 'يوم' : diffInDays === 2 ? 'يومين' : 'أيام'}`;
      }
      
      // تم الإرسال منذ X أسبوع (أقل من شهر)
      if (diffInDays < 30) {
        return `منذ ${diffInWeeks} ${diffInWeeks === 1 ? 'أسبوع' : diffInWeeks === 2 ? 'أسبوعين' : 'أسابيع'}`;
      }
      
      // تم الإرسال منذ X شهر (أقل من سنة)
      if (diffInDays < 365) {
        return `منذ ${diffInMonths} ${diffInMonths === 1 ? 'شهر' : diffInMonths === 2 ? 'شهرين' : 'أشهر'}`;
      }

      // أكثر من سنة
      if (diffInYears === 1) {
        return `منذ سنة`;
      } else if (diffInYears === 2) {
        return `منذ سنتين`;
      } else if (diffInYears < 10) {
        return `منذ ${diffInYears} سنوات`;
      }

      // أكثر من 10 سنوات - نعرض التاريخ الكامل
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      console.error('❌ Error formatting date:', dateString, error);
      return "توقيت غير صحيح";
    }
  };

  return (
    <div
      className={`relative ${showDropdown ? "z-50" : ""}`}
      ref={dropdownRef}
      dir="rtl">
      <button
        type="button"
        className="relative cursor-pointer transition-transform duration-300 hover:scale-110 text-2xl"
        onClick={() => setShowDropdown(!showDropdown)}
        title="الإشعارات"
        aria-label="فتح/إغلاق الإشعارات">
        🔔
        {stats.unreadCount > 0 && (
          <span className="absolute -top-2 -left-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-lg shadow-red-500/40 animate-pulse">
            {stats.unreadCount > 99 ? "99+" : stats.unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 sm:left-0 mt-3 w-screen sm:w-[420px] max-w-[95vw] sm:max-w-none max-h-[85vh] sm:max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden z-[1000] animate-slideDown -ml-4 sm:ml-0 border border-gray-200">
          {/* رأس القائمة المحسّن */}
          <div className="p-4 sm:p-5 border-b-2 border-gray-100 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-3xl">🔔</div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-md">الإشعارات</h3>
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    {/* حالة الاتصال - للمطورين فقط (اضغط Shift 3 مرات لإظهارها) */}
                    {(window as any).__DEV_MODE__ && (
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                          isConnected 
                            ? "bg-white/25 backdrop-blur-sm border border-white/30" 
                            : "bg-amber-500/30 backdrop-blur-sm border border-amber-400/50"
                        }`}
                        title={
                          isConnected
                            ? "إشعارات فورية: سيصلك الإشعار مباشرة بدون تأخير عبر Socket.IO"
                            : "تحديث تلقائي: سيتم تحديث الإشعارات كل دقيقة"
                        }>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isConnected ? "bg-white animate-pulse shadow-sm shadow-white/50" : "bg-amber-300 animate-pulse shadow-sm shadow-amber-300/50"
                          }`}></div>
                        <span className="hidden sm:inline font-semibold">
                          {isConnected ? "🚀 فوري" : "⏰ تلقائي"}
                        </span>
                        <span className="sm:hidden font-semibold">
                          {isConnected ? "🚀" : "⏰"}
                        </span>
                      </div>
                    )}
                    {stats.unreadCount > 0 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="font-bold">{stats.unreadCount}</span>
                        <span className="hidden sm:inline">جديد</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={`text-xs sm:text-sm px-3 py-2 backdrop-blur-sm text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                    stats.unreadCount > 0 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" 
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                  onClick={markAllAsReadLocal}
                  disabled={stats.unreadCount === 0 || isMarkingAll}
                  title={
                    stats.unreadCount === 0
                      ? "لا توجد إشعارات غير مقروءة"
                      : "تحديد الكل كمقروء"
                  }
                  aria-label="تحديد الكل كمقروء">
                  {isMarkingAll ? (
                    <>⏳ <span className="hidden sm:inline">جاري التحديث...</span></>
                  ) : (
                    <>✓ <span className="hidden sm:inline">تحديد الكل كمقروء</span></>
                  )}
                </button>

                <button
                  className="text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm text-2xl font-bold transition-all duration-200 p-2 rounded-xl hover:rotate-90 transform"
                  onClick={() => setShowDropdown(false)}
                  title="إغلاق"
                  aria-label="إغلاق قائمة الإشعارات">
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* محتوى الإشعارات المحسّن */}
          <div className="max-h-[calc(85vh-120px)] sm:max-h-[450px] overflow-y-auto custom-scrollbar bg-gradient-to-b from-gray-50 to-white">
            {isLoading && notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin text-4xl mb-3">⏳</div>
                <div className="text-gray-500 font-medium">جاري التحميل...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4 opacity-30">🔕</div>
                <div className="text-gray-500 font-medium text-lg">لا توجد إشعارات</div>
                <div className="text-gray-400 text-sm mt-2">ستظهر الإشعارات الجديدة هنا</div>
              </div>
            ) : (
              <>
                {notifications.map((notification, index) => (
                  <div
                    key={`${notification._id}-${index}`}
                    className={`group relative mx-2 my-2 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                      !notification.isRead 
                        ? "bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-200 shadow-md hover:shadow-xl opacity-100" 
                        : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg opacity-40 hover:opacity-70"
                    } ${notification.isNew ? "animate-[slideIn_0.5s_ease-out]" : ""} transform hover:scale-[1.02] active:scale-[0.98]`}
                    data-type={notification.type}
                    data-priority={notification.priority}
                    onClick={() => {
                      // تحديد كمقروء عند الضغط
                      markNotificationAsRead(notification._id);
                      
                      // التنقل حسب النوع
                      if (notification.type === "message") {
                        localStorage.setItem(
                          "chatNotification",
                          JSON.stringify({
                            senderId: notification.data?.senderId,
                            recipientId: notification.data?.recipientId,
                          })
                        );
                        navigate("/chat");
                        setShowDropdown(false);
                      }
                    }}>
                    
                    {/* شريط جانبي ملون حسب النوع */}
                    <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${
                      notification.type === 'attendance' ? 'bg-gradient-to-b from-yellow-400 to-orange-500' :
                      notification.type === 'grade' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                      notification.type === 'message' ? 'bg-gradient-to-b from-blue-400 to-blue-600' :
                      notification.type === 'prayer_time' ? 'bg-gradient-to-b from-purple-400 to-purple-600' :
                      notification.type === 'activity' ? 'bg-gradient-to-b from-orange-400 to-orange-600' :
                      notification.type === 'exam' ? 'bg-gradient-to-b from-pink-400 to-pink-600' :
                      'bg-gradient-to-b from-gray-400 to-gray-600'
                    }`}></div>
                    
                    <div className="flex items-start gap-3 p-4">
                      {/* أيقونة الإشعار */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg transform transition-transform group-hover:scale-110 ${
                        notification.type === 'attendance' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        notification.type === 'grade' ? 'bg-gradient-to-br from-green-400 to-green-500' :
                        notification.type === 'message' ? 'bg-gradient-to-br from-blue-400 to-blue-500' :
                        notification.type === 'prayer_time' ? 'bg-gradient-to-br from-purple-400 to-purple-500' :
                        notification.type === 'activity' ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                        notification.type === 'exam' ? 'bg-gradient-to-br from-pink-400 to-pink-500' :
                        'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* محتوى الإشعار */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className={`font-bold text-sm sm:text-base leading-snug ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                            {!notification.isRead && (
                              <span className="inline-block mr-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            )}
                          </div>
                        </div>
                        
                        {notification.type !== "message" && (
                          <div className={`text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2 ${
                            !notification.isRead ? 'text-gray-700' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </div>
                        )}
                        
                        {/* معلومات التواريخ */}
                        <div className="space-y-1">
                          {/* وقت الإرسال - يتحدث تلقائياً كل 10 ثواني */}
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                            <span 
                              className="flex items-center gap-1 time-update" 
                              key={refreshTime}
                            >
                              📤 <span className="font-medium">{formatDate(notification.sentAt)}</span>
                            </span>
                            {notification.priority === 'urgent' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold animate-pulse">⚡ عاجل</span>
                            )}
                            {notification.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-semibold">⭐ مهم</span>
                            )}
                          </div>
                          
                          {/* تم إزالة تاريخ الانتهاء */}
                        </div>
                      </div>
                      
                      {/* زر الحذف */}
                      <button
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-transparent hover:bg-red-50 border-none text-gray-400 hover:text-red-600 cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-90"
                        onClick={(e) =>
                          deleteNotificationLocal(notification._id, e)
                        }
                        title="حذف الإشعار"
                        aria-label="حذف الإشعار">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {hasMore && !isLoading && (
                  <div className="p-4 text-center">
                    <button 
                      onClick={loadMore}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                      📥 تحميل المزيد
                    </button>
                  </div>
                )}

                {isLoading && notifications.length > 0 && (
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-gray-500">
                      <div className="animate-spin text-xl">⏳</div>
                      <span className="font-medium">جاري التحميل...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast مخصص */}
      {toastMessage.show && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
            toastMessage.type === "success"
              ? "bg-green-500"
              : toastMessage.type === "error"
              ? "bg-red-500"
              : toastMessage.type === "warning"
              ? "bg-yellow-500"
              : "bg-blue-500"
          } animate-slideDown`}
        >
          {toastMessage.message}
        </div>
      )}
      
      {/* CSS مخصص للأنيميشن */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }
        
        .time-update {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        /* Scrollbar مخصص */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #14b8a6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #0d9488);
        }
        
        /* تحسين Toast */
        .custom-toast {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default NotificationHeader;
