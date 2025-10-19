import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/NotificationHeader.css";
import { socketManager } from "../../Socket/SocketManager"; // ✅ استخدام النظام الجديد مباشرة
import {
  getRecentNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../Api/notificationApi";

interface Notification {
  _id: string;
  type:
    | "grade"
    | "message"
    | "prayer_time"
    | "activity"
    | "attendance"
    | "general";
  title: string;
  message: string;
  createdAt: string;
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
  socket: any;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  userId,
  socket,
}) => {
  // ✅ استخدام socketManager من النظام الجديد
  const [isConnected, setIsConnected] = useState(socketManager.isConnected());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // مراقبة حالة الاتصال
  useEffect(() => {
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      setIsConnected(connected);
    });
    return () => unsubscribe();
  }, []);
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

  // إنشاء صوت الإشعار (اختياري)
  useEffect(() => {
    // notificationSound.current = new Audio('/notification-sound.mp3');
  }, []);

  // جلب الإشعارات عند التحميل الأول
  useEffect(() => {
    if (userId) {
      fetchNotifications(1, true);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // نظام التحديث التلقائي للإشعارات
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

  // الاستماع للإشعارات الجديدة من Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: any) => {
      const newNotification: Notification = {
        _id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
        isRead: false,
        priority: notification.priority || "medium",
        data: notification.data,
      };
      showToastNotification(newNotification);
      playNotificationSound();
    };

    const handlePrayerNotification = (prayerData: any) => {
      toast.success(
        <div className="prayer-notification">
          <strong>{prayerData.title}</strong>
          <br />
          {prayerData.message}
        </div>,
        {
          position: "top-center",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "prayer-toast center-toast",
          style: { top: "40%", transform: "translateY(-50%)", zIndex: 9999 },
        }
      );
      playNotificationSound();
    };

    const handleQuranReminder = (reminderData: any) => {
      toast.info(
        <div className="quran-reminder">
          <strong>{reminderData.title}</strong>
          <br />
          {reminderData.message}
        </div>,
        {
          position: "top-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "quran-toast",
        }
      );
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("prayerNotification", handlePrayerNotification);
    socket.on("quranReminder", handleQuranReminder);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("prayerNotification", handlePrayerNotification);
      socket.off("quranReminder", handleQuranReminder);
    };
  }, [socket]);

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
        (apiNotification) => ({
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
          createdAt: apiNotification.createdAt,
          isRead: apiNotification.isRead,
          priority: apiNotification.priority || "medium",
          isNew: false,
          data: apiNotification.metadata,
        })
      );

      if (reset) {
        setNotifications(newNotifications);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
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
      // ✅ لا تعرض toast error إذا كان الخطأ بسبب عدم وجود إشعارات
      if (error instanceof Error && !error.message.includes("404")) {
        toast.error("خطأ في جلب الإشعارات");
      }
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

  // تحديد إشعار واحد كمقروء
  const markAsReadLocal = async (notificationId: string) => {
    if (!notificationId) {
      console.error("Notification ID is not provided");
      return;
    }

    try {
      await markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true, isNew: false } : n
        )
      );
      setStats((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        newCount: Math.max(0, prev.newCount - 1),
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("حدث خطأ في تحديث الإشعار");
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
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    } catch (e) {
      console.error("Error in mark all as read:", e);
      toast.error("تعذّر تحديد الكل كمقروء");
    } finally {
      setIsMarkingAll(false);
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
      toast.success("تم حذف الإشعار بنجاح");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("خطأ في حذف الإشعار");
    }
  };

  // إظهار toast notification
  const showToastNotification = (notification: Notification) => {
    const toastConfig = {
      position: "top-right" as const,
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      rtl: true,
    };
    switch (notification.type) {
      case "grade":
        toast.success(
          `${notification.title}: ${notification.message}`,
          toastConfig
        );
        break;
      case "message":
        toast.info(notification.title, toastConfig);
        break;
      case "attendance":
        toast.warning(notification.title, toastConfig);
        break;
      case "activity":
        toast.info(notification.title, toastConfig);
        break;
      default:
        toast.info(notification.title, toastConfig);
    }
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
      grade: "📊",
      message: "💬",
      prayer_time: "🕌",
      activity: "📅",
      attendance: "⚠️",
      general: "🔔",
    };
    return icons[type as keyof typeof icons] || "🔔";
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440)
      return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;

    return date.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`notification-container ${showDropdown ? "mobile-open" : ""}`}
      ref={dropdownRef}>
      <button
        type="button"
        className="notification-button"
        onClick={() => setShowDropdown(!showDropdown)}
        title="الإشعارات"
        aria-label="فتح/إغلاق الإشعارات">
        🔔
        {stats.unreadCount > 0 && (
          <span className="notification-badge">
            {stats.unreadCount > 99 ? "99+" : stats.unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3>الإشعارات</h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  color: isConnected ? "#10B981" : "#F59E0B",
                }}
                title={
                  isConnected
                    ? "تحديث فوري عبر Socket"
                    : "تحديث تلقائي كل دقيقة"
                }>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: isConnected ? "#10B981" : "#F59E0B",
                    animation: "pulse 2s infinite",
                  }}
                />
                <span>{isConnected ? "فوري" : "تلقائي"}</span>
              </div>
            </div>

            <div className="notification-actions">
              <button
                className="mark-all-btn"
                onClick={markAllAsReadLocal}
                disabled={stats.unreadCount === 0 || isMarkingAll}
                title={
                  stats.unreadCount === 0
                    ? "لا توجد إشعارات غير مقروءة"
                    : "تحديد جميع الإشعارات كمقروءة"
                }
                aria-label="تحديد جميع الإشعارات كمقروءة">
                {isMarkingAll ? "جارٍ التحديد..." : "تحديد الكل مقروء"}
              </button>

              <button
                className="close-notifications-btn"
                onClick={() => setShowDropdown(false)}
                title="إغلاق"
                aria-label="إغلاق قائمة الإشعارات">
                ✕
              </button>
            </div>
          </div>

          <div className="notification-list">
            {isLoading && notifications.length === 0 ? (
              <div className="notification-loading">جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">لا توجد إشعارات</div>
            ) : (
              <>
                {notifications.map((notification, index) => (
                  <div
                    key={`${notification._id}-${index}`}
                    className={`notification-item ${
                      !notification.isRead ? "unread" : ""
                    } ${notification.isNew ? "new" : ""}`}
                    data-type={notification.type}
                    data-priority={notification.priority}
                    onClick={() => {
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
                      } else {
                        markAsReadLocal(notification._id);
                      }
                    }}>
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      {notification.type !== "message" && (
                        <div className="notification-message">
                          {notification.message}
                        </div>
                      )}
                      <div className="notification-time">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    <button
                      className="delete-notification bg-transparent border-none text-red-500 cursor-pointer p-1 mr-2"
                      onClick={(e) =>
                        deleteNotificationLocal(notification._id, e)
                      }
                      title="حذف الإشعار"
                      aria-label="حذف الإشعار">
                      ✖
                    </button>
                  </div>
                ))}

                {hasMore && !isLoading && (
                  <div className="notification-footer">
                    <button onClick={loadMore}>تحميل المزيد</button>
                  </div>
                )}

                {isLoading && notifications.length > 0 && (
                  <div className="notification-loading">جاري التحميل...</div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="custom-toast"
      />
    </div>
  );
};

export default NotificationHeader;
