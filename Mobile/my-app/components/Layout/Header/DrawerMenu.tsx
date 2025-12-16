import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/Avatar/Avatar";
import {
  Home,
  Newspaper,
  Target,
  Award,
  UserCheck,
  BookOpen,
  Clock,
  X,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Users,
  BarChart,
  UserPlus,
  AlertTriangle,
  Trophy,
  FileText,
  Calendar,
  Activity,
  BookMarked,
} from "lucide-react-native";

interface MenuItem {
  to: string;
  label: string;
  icon: any;
  subItems?: MenuItem[];
}

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const slideAnim = new Animated.Value(isOpen ? 0 : 300);

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const getMenuItems = (): MenuItem[] => {
    if (user?.role === "admin") {
      return [
        { to: "/(tabs)", label: "الرئيسية", icon: Home },
        { to: "/admin/dashboard", label: "لوحة الإدارة", icon: BarChart },
        { to: "/admin/students", label: "إدارة الطلاب", icon: Users },
        { to: "/admin/teachers", label: "إدارة المعلمين", icon: UserPlus },
        { to: "/admin/groups", label: "إدارة الحلقات", icon: BookOpen },
        { to: "/timetable", label: "مواعيد الحلقات", icon: Clock },
        { to: "/chat", label: "المحادثة", icon: MessageSquare },
      ];
    }

    const studentTeacherItems: MenuItem[] = [
      { to: "/(tabs)", label: "الرئيسية", icon: Home },
      { to: "/news", label: "الأخبار", icon: Newspaper },
      { to: "/goals", label: "الأهداف", icon: Target },
      { to: "/daily-marks", label: "العلامات اليومية", icon: Award },
      { to: "/ranking", label: "التصنيف", icon: BarChart },
      { to: "/exam-schedule", label: "جدول الامتحانات", icon: Calendar },
      { to: "/reports", label: "التقارير", icon: FileText },
      { to: "/timetable", label: "المواعيد", icon: Clock },
      { to: "/chat", label: "المحادثة", icon: MessageSquare },
      { to: "/activities", label: "الأنشطة", icon: Activity },
      { to: "/attendance", label: "الحضور والغياب", icon: UserCheck },
      { to: "/warnings", label: "الإنذارات", icon: AlertTriangle },
      { to: "/points-game", label: "لعبة النقاط", icon: Trophy },
      { to: "/prayer-times", label: "مواقيت الصلاة", icon: Clock },
      {
        to: "/quran",
        label: "القرآن الكريم",
        icon: BookOpen,
        subItems: [
          { to: "/quran", label: "قرآن شفهي", icon: BookOpen },
          { to: "/quran-audio", label: "قرآن صوتي", icon: BookOpen },
        ],
      },
      { to: "/azkar", label: "الأذكار", icon: BookMarked },
    ];

    return studentTeacherItems;
  };

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path as any);
  };

  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemLabel)
        ? prev.filter((item) => item !== itemLabel)
        : [...prev, itemLabel]
    );
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  if (!user) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>القائمة الرئيسية</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* User Card */}
            <View style={styles.userCard}>
              <Avatar user={user} size="lg" border="thick" showStatus={true} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName || "المستخدم"}
                </Text>
                <View style={styles.userRoleContainer}>
                  <Text style={styles.userRole}>
                    {user.role === "teacher"
                      ? "معلم"
                      : user.role === "admin"
                        ? "مدير"
                        : "طالب"}
                  </Text>
                  <Text style={styles.statusText}>متصل الآن</Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {getMenuItems().map((item) => (
                <MenuItemComponent
                  key={item.to}
                  item={item}
                  onNavigate={handleNavigate}
                  onToggle={toggleExpanded}
                  isExpanded={expandedItems.includes(item.label)}
                />
              ))}
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleNavigate("/profile")}>
                <User size={20} color="rgba(167, 243, 208, 1)" />
                <Text style={styles.actionText}>الملف الشخصي</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.logoutButton]}
                onPress={handleLogout}>
                <LogOut size={20} color="rgba(252, 165, 165, 1)" />
                <Text style={[styles.actionText, styles.logoutText]}>
                  تسجيل الخروج
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

interface MenuItemComponentProps {
  item: MenuItem;
  onNavigate: (path: string) => void;
  onToggle: (label: string) => void;
  isExpanded: boolean;
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  onNavigate,
  onToggle,
  isExpanded,
}) => {
  const Icon = item.icon;

  if (item.subItems && item.subItems.length > 0) {
    return (
      <View>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onToggle(item.label)}>
          <View style={styles.menuItemContent}>
            <Icon size={22} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.menuItemText}>{item.label}</Text>
          </View>
          {isExpanded ? (
            <ChevronUp size={20} color="rgba(255, 255, 255, 0.7)" />
          ) : (
            <ChevronDown size={20} color="rgba(255, 255, 255, 0.7)" />
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.subItems}>
            {item.subItems.map((subItem) => {
              const SubIcon = subItem.icon;
              return (
                <TouchableOpacity
                  key={subItem.to}
                  style={styles.subMenuItem}
                  onPress={() => onNavigate(subItem.to)}>
                  <SubIcon size={18} color="rgba(255, 255, 255, 0.6)" />
                  <Text style={styles.subMenuItemText}>{subItem.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => onNavigate(item.to)}>
      <View style={styles.menuItemContent}>
        <Icon size={22} color="rgba(255, 255, 255, 0.7)" />
        <Text style={styles.menuItemText}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 320,
    maxWidth: "90%",
    backgroundColor: "#059669",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(16, 185, 129, 0.3)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    marginBottom: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  userRoleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  userRole: {
    fontSize: 13,
    color: "rgba(167, 243, 208, 1)",
  },
  statusText: {
    fontSize: 11,
    color: "rgba(134, 239, 172, 1)",
    fontWeight: "500",
  },
  menuItems: {
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(209, 250, 229, 1)",
  },
  subItems: {
    marginLeft: 16,
    marginTop: 4,
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 8,
  },
  subMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 8,
  },
  subMenuItemText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(209, 250, 229, 1)",
  },
  bottomActions: {
    gap: 8,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 185, 129, 0.3)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(209, 250, 229, 1)",
  },
  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  logoutText: {
    color: "rgba(252, 165, 165, 1)",
  },
});
