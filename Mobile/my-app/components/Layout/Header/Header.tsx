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
import { Menu, Bell, ChevronDown } from "lucide-react-native";
import { ProfileMenu } from "../ProfileMenu";
import { DrawerMenu } from "./DrawerMenu";
import { useLogo } from "@/components/Hooks/useLogo";

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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Right Section - Actions */}
        <View style={styles.actionsSection}>
          {/* Menu Button */}
          {showMenu && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setDrawerOpen(true)}
              activeOpacity={0.7}>
              <Menu size={24} color="#ffffff" />
            </TouchableOpacity>
          )}

          {/* Notifications */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              // Navigate to notifications
            }}
            activeOpacity={0.7}>
            <Bell size={22} color="#ffffff" />
            {/* Badge for unread notifications */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Center Title */}
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            مدرسة القرآن الكريم
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            أكاديمية مدرسة المهاجرين
          </Text>
        </View>

        {/* Left Section - Profile */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => setProfileMenuOpen(!profileMenuOpen)}
          activeOpacity={0.7}>
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
                  : "طالب"}
            </Text>
          </View>
          <Avatar
            user={currentUser}
            size="sm"
            border="ring"
            showStatus={true}
            statusSize="sm"
            userId={currentUser._id}
            userRole={currentUser.role}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Menu Modal */}
      <Modal
        visible={profileMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileMenuOpen(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setProfileMenuOpen(false)}>
          <View style={styles.profileMenuContainer}>
            <ProfileMenu
              userName={
                currentUser?.firstName && currentUser?.lastName
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : currentUser?.firstName || "المستخدم"
              }
              userRole={
                currentUser?.role === "teacher"
                  ? "معلم"
                  : currentUser?.role === "admin"
                    ? "مدير"
                    : "طالب"
              }
              onProfilePress={() => {
                setProfileMenuOpen(false);
                // Navigate to profile when available
              }}
              onSettingsPress={() => {
                setProfileMenuOpen(false);
              }}
              onLogoutPress={async () => {
                setProfileMenuOpen(false);
                // Add logout logic here
              }}
            />
          </View>
        </Pressable>
      </Modal>

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
    paddingTop: Platform.OS === "ios" ? 50 : 14,
    minHeight: Platform.OS === "ios" ? 100 : 76,
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
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
    justifyContent: "flex-end",
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
    alignItems: "flex-end",
  },
  profileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  profileRole: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginTop: 2,
  },
});
