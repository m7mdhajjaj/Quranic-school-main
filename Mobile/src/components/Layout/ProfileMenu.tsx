import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { Key, LogOut, User, ChevronLeft } from "lucide-react-native";
import type { AuthUser } from "../../pages/Auth/types";
import Avatar from "../Avatar/Avatar";

interface ProfileMenuProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onChangePasswordClick: () => void;
  onLogout: () => void;
  containerStyle?: ViewStyle;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  user,
  isOpen,
  onClose,
  onProfileClick,
  onChangePasswordClick,
  onLogout,
  containerStyle,
}) => {
  const roleLabel = useMemo(() => {
    if (user?.role === "teacher") return "معلم";
    if (user?.role === "admin") return "مدير";
    if (user?.role === "student") return "طالب";
    return "مستخدم";
  }, [user?.role]);

  const displayName = useMemo(() => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName} ${user.lastName}`;
    return user?.firstName || user?.name || "المستخدم";
  }, [user?.firstName, user?.lastName, user?.name]);

  if (!isOpen) return null;

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, containerStyle]} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <Avatar user={user} size={44} />
            <View style={styles.headerText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                </Text>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>{roleLabel}</Text>
                </View>
              </View>
              {!!user?.email && (
                <Text style={styles.email} numberOfLines={2}>
                  {user.email}
                </Text>
              )}
            </View>
          </View>

          {/* Items */}
          <View style={styles.items}>
            <Pressable
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              onPress={() => {
                onClose();
                onProfileClick();
              }}>
              <User size={18} color="#10b981" />
              <Text style={[styles.itemText, { color: "#047857" }]}>
                الملف الشخصي
              </Text>
              <ChevronLeft size={18} color="#34d399" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              onPress={() => {
                onClose();
                onChangePasswordClick();
              }}>
              <Key size={18} color="#2563eb" />
              <Text style={[styles.itemText, { color: "#1d4ed8" }]}>
                تغيير كلمة المرور
              </Text>
              <ChevronLeft size={18} color="#60a5fa" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              onPress={onLogout}>
              <LogOut size={18} color="#dc2626" />
              <Text style={[styles.itemText, { color: "#dc2626" }]}>
                تسجيل الخروج
              </Text>
              <ChevronLeft size={18} color="#f87171" />
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingTop: 64,
    paddingHorizontal: 16,
  },
  card: {
    width: 260,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  header: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    flex: 1,
    color: "#111827",
    fontWeight: "700",
    fontSize: 13,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  rolePillText: {
    color: "#047857",
    fontSize: 11,
    fontWeight: "700",
  },
  email: {
    marginTop: 2,
    color: "#4b5563",
    fontSize: 11,
  },
  items: {
    padding: 8,
    gap: 6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  itemPressed: {
    backgroundColor: "#f9fafb",
  },
  itemText: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default ProfileMenu;
