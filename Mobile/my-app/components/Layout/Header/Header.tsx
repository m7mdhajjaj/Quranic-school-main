import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/ui";
import { Avatar } from "@/components/Avatar/Avatar";
import { Menu, Bell } from "lucide-react-native";
import { DrawerMenu } from "./DrawerMenu";
import { useLogo } from "@/components/Hooks/useLogo";
import { useNotifications } from "@/Context/NotificationContext";

interface HeaderProps {
  showMenu?: boolean;
  onMenuPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showMenu = true,
  onMenuPress,
}) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { logoUrl, logoLoading } = useLogo();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { unreadCount } = useNotifications();

  if (!currentUser) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Right Section - Profile (RTL) */}
        <View style={styles.profileSection}>
          <Avatar
            user={currentUser}
            size="sm"
            border="ring"
            showStatus={true}
            statusSize="sm"
            userId={currentUser._id}
            userRole={currentUser.role}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {currentUser?.firstName && currentUser?.lastName
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : currentUser?.firstName || "المستخدم"}
            </Text>
            <Text style={styles.profileRole} numberOfLines={1}>
              {currentUser?.role === "teacher"
                ? "معلم"
                : currentUser?.role === "admin"
                  ? "مدير"
                  : currentUser?.role === "secretary"
                    ? "سكرتير"
                    : currentUser?.role === "teacherAssistant"
                      ? "مساعد مدرس"
                      : "طالب"}
            </Text>
          </View>
        </View>

        {/* Left Section - Actions (RTL) */}
        <View style={styles.actionsSection}>
          {/* Notifications */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              router.push("/(tabs)/notifications" as any);
            }}
            activeOpacity={0.7}>
            <Bell size={22} color="#ffffff" />
            {/* Badge for unread notifications */}
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Menu Button */}
          {showMenu && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setDrawerOpen(true)}
              activeOpacity={0.7}>
              <Menu size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Drawer Menu */}
      <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#10b981",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  profileMenuContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 85 : 60,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    minHeight: Platform.OS === "ios" ? 100 : 90,
  },
  actionsSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    flex: 1,
    justifyContent: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 3,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ef4444",
    borderRadius: 11,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#10b981",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  profileInfo: {
    alignItems: "flex-start",
  },
  profileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "right",
  },
  profileRole: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginTop: 2,
    textAlign: "right",
  },
});
