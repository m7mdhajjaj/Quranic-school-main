import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { User, Settings, LogOut } from "lucide-react-native";

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
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onProfilePress}
        activeOpacity={0.7}>
        <User size={20} color="#10b981" />
        <Text style={styles.menuText}>الملف الشخصي</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={onSettingsPress}
        activeOpacity={0.7}>
        <Settings size={20} color="#10b981" />
        <Text style={styles.menuText}>الإعدادات</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={[styles.menuItem, styles.logoutItem]}
        onPress={onLogoutPress}
        activeOpacity={0.7}>
        <LogOut size={20} color="#ef4444" />
        <Text style={[styles.menuText, styles.logoutText]}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  logoutItem: {
    backgroundColor: "#fef2f2",
  },
  logoutText: {
    color: "#ef4444",
  },
});
