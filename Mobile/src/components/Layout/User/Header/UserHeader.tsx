import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronDown, Menu } from "lucide-react-native";
import { useAuth, useRoleLayout } from "../../../../hooks";
import { NotificationHeader } from "../../../Notifications";
import Avatar from "../../../Avatar/Avatar";
import ProfileMenu from "../../ProfileMenu";

interface UserHeaderProps {
  onMenuToggle?: () => void;
  onChangePasswordClick?: () => void;
  title?: string;
  breadcrumb?: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  onMenuToggle,
  onChangePasswordClick,
  title,
  breadcrumb,
}) => {
  const { user: currentUser, logout: authLogout } = useAuth();
  const { getRoleLabel } = useRoleLayout();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const displayName = useMemo(() => {
    if (!currentUser) return "";
    return (
      currentUser.firstName ||
      currentUser.name ||
      getRoleLabel(currentUser.role)
    );
  }, [currentUser, getRoleLabel]);

  const roleLabel = useMemo(() => {
    if (!currentUser) return "";
    return getRoleLabel(currentUser.role);
  }, [currentUser, getRoleLabel]);

  if (!currentUser) return null;

  const handleLogout = () => {
    Alert.alert("تأكيد", "هل تريد تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تسجيل الخروج",
        style: "destructive",
        onPress: async () => {
          setProfileMenuOpen(false);
          await authLogout();
        },
      },
    ]);
  };

  const handleProfileClick = () => {
    Alert.alert("قريباً", "صفحة الملف الشخصي غير مفعّلة حالياً");
  };

  const handleChangePasswordClick = () => {
    setProfileMenuOpen(false);
    if (onChangePasswordClick) {
      onChangePasswordClick();
      return;
    }
    Alert.alert("قريباً", "ميزة تغيير كلمة المرور غير مفعّلة حالياً");
  };

  const resolvedTitle = title || "الرئيسية";
  const resolvedBreadcrumb = breadcrumb || "";

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#ecfeff", "#f0fdf4", "#ecfeff"]}
        style={styles.container}>
        {/* Right side: menu + title */}
        <View style={styles.right}>
          {!!onMenuToggle && (
            <Pressable
              onPress={onMenuToggle}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="فتح القائمة">
              <Menu size={20} color="#047857" />
            </Pressable>
          )}
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {resolvedTitle}
            </Text>
            {!!resolvedBreadcrumb && (
              <Text style={styles.breadcrumb} numberOfLines={1}>
                {resolvedBreadcrumb}
              </Text>
            )}
          </View>
        </View>

        {/* Left side: notifications + user menu */}
        <View style={styles.left}>
          <NotificationHeader
            userId={currentUser._id}
            onPress={() =>
              Alert.alert("قريباً", "صفحة الإشعارات غير مفعّلة حالياً")
            }
          />

          <View>
            <Pressable
              onPress={() => setProfileMenuOpen((v) => !v)}
              style={({ pressed }) => [
                styles.userBtn,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="قائمة المستخدم">
              <Avatar user={currentUser} size={32} />
              <View style={styles.userText}>
                <Text style={styles.userName} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.userRole} numberOfLines={1}>
                  {roleLabel}
                </Text>
              </View>
              <ChevronDown size={16} color="#4b5563" />
            </Pressable>

            <ProfileMenu
              user={currentUser}
              isOpen={profileMenuOpen}
              onClose={() => setProfileMenuOpen(false)}
              onProfileClick={handleProfileClick}
              onChangePasswordClick={handleChangePasswordClick}
              onLogout={handleLogout}
              containerStyle={styles.menuPosition}
            />
          </View>
        </View>

        {/* Center brand */}
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.brandTitle}>مدرسة المهاجرين</Text>
          <Text style={styles.brandSub}>لتعليم القرآن الكريم</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  container: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  titleWrap: {
    minWidth: 0,
  },
  title: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  breadcrumb: {
    color: "#059669",
    fontSize: 10,
    marginTop: 1,
  },
  userBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  userText: {
    maxWidth: 90,
  },
  userName: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
  },
  userRole: {
    color: "#6b7280",
    fontSize: 10,
    marginTop: 1,
  },
  center: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -60 }, { translateY: -16 }],
    width: 120,
    alignItems: "center",
  },
  brandTitle: {
    color: "#059669",
    fontWeight: "900",
    fontSize: 12,
  },
  brandSub: {
    color: "rgba(5,150,105,0.75)",
    fontWeight: "700",
    fontSize: 10,
    marginTop: 1,
  },
  menuPosition: {
    alignSelf: "flex-start",
  },
});

export default UserHeader;
