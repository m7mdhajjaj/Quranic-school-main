import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { User, Settings, LogOut, ChevronDown } from "lucide-react-native";

interface ProfileMenuProps {
  userName: string;
  userRole: string;
  onProfilePress: () => void;
  onSettingsPress: () => void;
  onLogoutPress: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  userName,
  userRole,
  onProfilePress,
  onSettingsPress,
  onLogoutPress,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}>
        <View style={styles.avatar}>
          <User size={20} color="#ffffff" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.userRole}>{userRole}</Text>
        </View>
        <ChevronDown
          size={16}
          color="#6b7280"
          style={[
            styles.chevron,
            isOpen && { transform: [{ rotate: "180deg" }] },
          ]}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setIsOpen(false);
              onProfilePress();
            }}>
            <User size={18} color="#374151" />
            <Text style={styles.menuText}>الملف الشخصي</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setIsOpen(false);
              onSettingsPress();
            }}>
            <Settings size={18} color="#374151" />
            <Text style={styles.menuText}>الإعدادات</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => {
              setIsOpen(false);
              onLogoutPress();
            }}>
            <LogOut size={18} color="#ef4444" />
            <Text style={[styles.menuText, styles.logoutText]}>
              تسجيل الخروج
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  userRole: {
    fontSize: 12,
    color: "#6b7280",
  },
  chevron: {
    marginLeft: 4,
  },
  dropdown: {
    position: "absolute",
    top: 60,
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 4,
  },
  logoutItem: {
    backgroundColor: "#fef2f2",
  },
  logoutText: {
    color: "#ef4444",
  },
});
