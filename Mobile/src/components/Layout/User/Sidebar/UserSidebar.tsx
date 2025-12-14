import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChevronDown, ChevronUp, Key, LogOut, User } from "lucide-react-native";
import { useAuth, useRoleLayout } from "../../../../hooks";

interface UserSidebarProps {
  isMobileOpen: boolean;
  currentRouteName: string;
  onMobileClose: () => void;
  onNavigate: (routeName: string) => void;
  onChangePasswordClick?: () => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({
  isMobileOpen,
  currentRouteName,
  onMobileClose,
  onNavigate,
  onChangePasswordClick,
}) => {
  const { user: currentUser, logout: authLogout } = useAuth();
  const { navGroups } = useRoleLayout();

  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const isInitialized = useRef(false);

  const navGroupsKey = useMemo(
    () =>
      JSON.stringify(
        navGroups.map((group) => ({
          title: group.title,
          itemsCount: group.items.length,
        }))
      ),
    [navGroups]
  );

  useEffect(() => {
    if (navGroups.length > 0 && !isInitialized.current) {
      const allGroups = new Set(
        navGroups
          .filter((group) => group.title !== "الرئيسية")
          .map((group) => group.title)
      );
      allGroups.add("الحساب");
      setOpenGroups(allGroups);
      isInitialized.current = true;
    }
  }, [navGroups, navGroupsKey]);

  useEffect(() => {
    const activeGroup = navGroups.find((group) =>
      group.items.some((item) => item.route === currentRouteName)
    );
    if (activeGroup) {
      setOpenGroups((prev) => new Set(prev).add(activeGroup.title));
    }
  }, [currentRouteName, navGroups, navGroupsKey]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("هل تريد تسجيل الخروج؟");
      if (!confirmed) return;
      onMobileClose();
      void authLogout();
      return;
    }

    Alert.alert("تأكيد", "هل تريد تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تسجيل الخروج",
        style: "destructive",
        onPress: async () => {
          onMobileClose();
          await authLogout();
        },
      },
    ]);
  };

  const handleProfileClick = () => {
    onMobileClose();
    onNavigate("Profile");
  };

  const handleChangePasswordClick = () => {
    onMobileClose();
    if (onChangePasswordClick) {
      onChangePasswordClick();
      return;
    }
    onNavigate("ChangePassword");
  };

  if (!isMobileOpen) return null;

  return (
    <Modal
      visible={isMobileOpen}
      transparent
      animationType="fade"
      onRequestClose={onMobileClose}>
      <Pressable style={styles.overlay} onPress={onMobileClose}>
        <Pressable style={styles.panel} onPress={() => {}}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            {/* Nav */}
            {navGroups.map((group) => {
              const isOpen = openGroups.has(group.title);

              if (group.title === "الرئيسية" && group.items.length > 0) {
                const homeItem = group.items[0];
                const HomeIcon = homeItem.icon;
                const isHomeActive = currentRouteName === homeItem.route;

                return (
                  <Pressable
                    key={homeItem.route}
                    onPress={() => {
                      onMobileClose();
                      onNavigate(homeItem.route);
                    }}
                    style={[styles.item, isHomeActive && styles.itemActive]}>
                    <HomeIcon
                      size={22}
                      color={isHomeActive ? "#ffffff" : "#10b981"}
                    />
                    <Text
                      style={[
                        styles.itemText,
                        isHomeActive && styles.itemTextActive,
                      ]}>
                      {homeItem.label}
                    </Text>
                  </Pressable>
                );
              }

              if (group.title === "الرئيسية") return null;

              return (
                <View key={group.title} style={styles.group}>
                  <Pressable
                    onPress={() => toggleGroup(group.title)}
                    style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    {isOpen ? (
                      <ChevronUp size={18} color="#047857" />
                    ) : (
                      <ChevronDown size={18} color="#047857" />
                    )}
                  </Pressable>

                  {isOpen && (
                    <View style={styles.groupItems}>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = currentRouteName === item.route;

                        return (
                          <Pressable
                            key={item.route}
                            onPress={() => {
                              onMobileClose();
                              onNavigate(item.route);
                            }}
                            style={[styles.item, active && styles.itemActive]}>
                            <Icon
                              size={22}
                              color={active ? "#ffffff" : "#10b981"}
                            />
                            <Text
                              style={[
                                styles.itemText,
                                active && styles.itemTextActive,
                              ]}>
                              {item.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}

            {/* Account */}
            {currentUser && (
              <View style={styles.account}>
                <Pressable
                  onPress={() => toggleGroup("الحساب")}
                  style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>الحساب</Text>
                  {openGroups.has("الحساب") ? (
                    <ChevronUp size={18} color="#047857" />
                  ) : (
                    <ChevronDown size={18} color="#047857" />
                  )}
                </Pressable>

                {openGroups.has("الحساب") && (
                  <View style={styles.groupItems}>
                    <Pressable onPress={handleProfileClick} style={styles.item}>
                      <User size={22} color="#10b981" />
                      <Text style={styles.itemText}>الملف الشخصي</Text>
                    </Pressable>

                    <Pressable
                      onPress={handleChangePasswordClick}
                      style={styles.item}>
                      <Key size={22} color="#10b981" />
                      <Text style={styles.itemText}>تغيير كلمة المرور</Text>
                    </Pressable>

                    <Pressable
                      onPress={handleLogout}
                      style={[styles.item, styles.logoutItem]}>
                      <LogOut size={22} color="#ef4444" />
                      <Text style={[styles.itemText, styles.logoutText]}>
                        تسجيل الخروج
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  panel: {
    width: 280,
    height: "100%",
    backgroundColor: "#ecfeff",
    borderLeftWidth: 1,
    borderLeftColor: "#d1fae5",
    paddingTop: 12,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 10,
  },
  group: {
    gap: 8,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  groupTitle: {
    color: "#047857",
    fontWeight: "800",
    fontSize: 12,
  },
  groupItems: {
    paddingRight: 8,
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  itemActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  itemText: {
    flex: 1,
    textAlign: "right",
    color: "#047857",
    fontWeight: "700",
    fontSize: 13,
  },
  itemTextActive: {
    color: "#ffffff",
  },
  account: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#d1fae5",
    gap: 8,
  },
  logoutItem: {
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  logoutText: {
    color: "#dc2626",
  },
});

export default UserSidebar;
