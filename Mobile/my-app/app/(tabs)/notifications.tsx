// ============================================================================
// صفحة الإشعارات - Notifications Page
// ============================================================================

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Settings,
} from "lucide-react-native";
import { useNotifications } from "@/Context/NotificationContext";
import { NotificationCard } from "@/components/Notifications/NotificationCard";
import { Notification } from "@/Api/notificationApi";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isPermissionGranted,
    refreshNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    requestPushPermission,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  // ================== Handlers ==================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      if (!notification.isRead) {
        await handleMarkAsRead(notification._id);
      }
      // يمكن إضافة التنقل إلى الصفحة المناسبة هنا
    },
    [handleMarkAsRead]
  );

  const handleDeletePress = useCallback(
    (notificationId: string) => {
      Alert.alert("حذف الإشعار", "هل أنت متأكد من حذف هذا الإشعار؟", [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => handleDeleteNotification(notificationId),
        },
      ]);
    },
    [handleDeleteNotification]
  );

  const handleMarkAllReadPress = useCallback(() => {
    if (unreadCount === 0) return;

    Alert.alert("تعليم الكل كمقروء", "هل تريد تعليم جميع الإشعارات كمقروءة؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "نعم", onPress: handleMarkAllAsRead },
    ]);
  }, [unreadCount, handleMarkAllAsRead]);

  // ================== Permission Banner ==================
  const renderPermissionBanner = () => {
    if (isPermissionGranted) return null;

    return (
      <TouchableOpacity
        style={styles.permissionBanner}
        onPress={requestPushPermission}
        activeOpacity={0.8}>
        <BellOff size={24} color="#f59e0b" />
        <View style={styles.permissionTextContainer}>
          <Text style={styles.permissionTitle}>إشعارات Push غير مفعّلة</Text>
          <Text style={styles.permissionDescription}>
            اضغط هنا لتفعيل الإشعارات واستلام التحديثات فوراً
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ================== Header Actions ==================
  const renderHeaderActions = () => (
    <View style={styles.headerActions}>
      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleMarkAllReadPress}>
          <CheckCheck size={20} color="#1C7850" />
          <Text style={styles.headerButtonText}>تعليم الكل كمقروء</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ================== Empty State ==================
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Bell size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
      <Text style={styles.emptyDescription}>
        ستظهر هنا جميع إشعاراتك الجديدة
      </Text>
    </View>
  );

  // ================== Render Item ==================
  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationCard
        notification={item}
        onPress={() => handleNotificationPress(item)}
        onDelete={() => handleDeletePress(item._id)}
      />
    ),
    [handleNotificationPress, handleDeletePress]
  );

  // ================== Main Render ==================
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Bell size={28} color="#1C7850" />
          <Text style={styles.headerTitle}>الإشعارات</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
        {renderHeaderActions()}
      </View>

      {/* Permission Banner */}
      {renderPermissionBanner()}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        inverted={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1C7850"]}
            tintColor="#1C7850"
          />
        }
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ================== Styles ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  unreadBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
  },
  headerButtonText: {
    color: "#1C7850",
    fontSize: 12,
    fontWeight: "600",
  },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    padding: 16,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fcd34d",
    gap: 12,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 12,
    color: "#a16207",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});
