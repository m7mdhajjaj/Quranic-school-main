import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./NotificationHeader.css";

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
  apiUrl?: string;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  userId,
  socket,
  apiUrl = "http://localhost:5005",
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    unreadCount: 0,
    newCount: 0,
    totalCount: 0,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // إنشاء صوت الإشعار
  useEffect(() => {
    // يمكن إضافة ملف صوتي للإشعارات هنا
    // notificationSound.current = new Audio('/notification-sound.mp3');
  }, []);

  // جلب الإشعارات عند التحميل الأول
  useEffect(() => {
    if (userId) {
      fetchNotifications(1, true);
    }
  }, [userId]);

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
        isNew: notification.isNew || true,
        data: notification.data,
      };

      // إضافة الإشعار الجديد للقائمة
      setNotifications((prev) => [newNotification, ...prev]);
      setStats((prev) => ({
        ...prev,
        unreadCount: prev.unreadCount + 1,
        newCount: prev.newCount + 1,
        totalCount: prev.totalCount + 1,
      }));

      // إظهار toast notification
      showToastNotification(newNotification);

      // تشغيل الصوت
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
          className: "prayer-toast",
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
      const response = await fetch(
        `${apiUrl}/api/notifications/${userId}?page=${pageNum}&limit=20`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      if (data.success) {
        const newNotifications = data.data.notifications;

        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }

        setStats(data.data.stats);
        setPage(pageNum);
        setHasMore(data.data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("خطأ في جلب الإشعارات");
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
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/notifications/${notificationId}/read`,
        { method: "PATCH" }
      );

      if (response.ok) {
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
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/notifications/${userId}/read-all`,
        { method: "PATCH" }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, isNew: false }))
        );
        setStats((prev) => ({
          ...prev,
          unreadCount: 0,
          newCount: 0,
        }));

        toast.success("تم تحديد جميع الإشعارات كمقروءة");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("خطأ في تحديث الإشعارات");
    }
  };

  // حذف إشعار
  const deleteNotification = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    try {
      const response = await fetch(
        `${apiUrl}/api/notifications/${notificationId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        const deletedNotification = notifications.find(
          (n) => n._id === notificationId
        );

        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
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
      }
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
    <div className="notification-container" ref={dropdownRef}>
      <button
        className="notification-button"
        onClick={() => setShowDropdown(!showDropdown)}
        title="الإشعارات">
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
            <h3>الإشعارات</h3>
            {stats.unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                تحديد الكل كمقروء
              </button>
            )}
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
                    onClick={() => markAsRead(notification._id)}>
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    <button
                      className="delete-notification"
                      onClick={(e) => deleteNotification(notification._id, e)}
                      title="حذف الإشعار"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "4px",
                        marginRight: "8px",
                      }}>
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
