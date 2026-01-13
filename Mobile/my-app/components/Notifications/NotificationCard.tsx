import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { X } from "lucide-react-native";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sentAt?: string;
}

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onDelete: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, !notification.isRead && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
            {!notification.isRead && <View style={styles.dot} />}
          </Text>
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>

        <Text style={styles.time}>
          {formatTime(notification.sentAt || notification.createdAt)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(notification._id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <X size={16} color="#6b7280" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const formatTime = (dateString: string): string => {
  try {
    if (!dateString) {
      console.warn("⚠️ No date provided");
      return "الآن";
    }

    // محاولة تحويل التاريخ
    let date: Date;

    // إذا كان التاريخ رقم (timestamp)
    if (typeof dateString === "number" || !isNaN(Number(dateString))) {
      date = new Date(Number(dateString));
    } else {
      // إذا كان نص
      date = new Date(dateString);
    }

    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) {
      console.warn("⚠️ Invalid date:", dateString);
      return "الآن";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // إذا كان التاريخ في المستقبل
    if (diffInSeconds < 0) {
      return "الآن";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    // تم الإرسال الآن (أقل من 10 ثواني)
    if (diffInSeconds < 10) return "تم الإرسال الآن";

    // تم الإرسال قبل X ثانية (أقل من دقيقة)
    if (diffInSeconds < 60) {
      return `قبل ${diffInSeconds} ثانية`;
    }

    // تم الإرسال قبل X دقيقة (أقل من ساعة)
    if (diffInMinutes < 60) {
      return `قبل ${diffInMinutes} ${diffInMinutes === 1 ? "دقيقة" : diffInMinutes === 2 ? "دقيقتين" : "دقائق"}`;
    }

    // تم الإرسال قبل X ساعة (أقل من 24 ساعة)
    if (diffInHours < 24) {
      return `قبل ${diffInHours} ${diffInHours === 1 ? "ساعة" : diffInHours === 2 ? "ساعتين" : "ساعات"}`;
    }

    // تم الإرسال منذ X يوم (أقل من أسبوع)
    if (diffInDays < 7) {
      return `منذ ${diffInDays} ${diffInDays === 1 ? "يوم" : diffInDays === 2 ? "يومين" : "أيام"}`;
    }

    // تم الإرسال منذ X أسبوع (أقل من شهر)
    if (diffInDays < 30) {
      return `منذ ${diffInWeeks} ${diffInWeeks === 1 ? "أسبوع" : diffInWeeks === 2 ? "أسبوعين" : "أسابيع"}`;
    }

    // تم الإرسال منذ X شهر (أقل من سنة)
    if (diffInDays < 365) {
      return `منذ ${diffInMonths} ${diffInMonths === 1 ? "شهر" : diffInMonths === 2 ? "شهرين" : "أشهر"}`;
    }

    // أكثر من سنة - عرض التاريخ
    return date.toLocaleDateString("ar-SA");
  } catch (error) {
    console.error(
      "❌ Error formatting date:",
      error,
      "Original value:",
      dateString
    );
    return "الآن";
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  unread: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
  },
  message: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: "#9ca3af",
  },
  deleteButton: {
    padding: 4,
  },
});
