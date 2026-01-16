import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Home, Award, UserCheck, MessageSquare } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";

interface TabItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
}

const tabs: TabItem[] = [
  {
    name: "home",
    path: "/(tabs)",
    icon: Home,
    label: "الرئيسية",
  },
  {
    name: "dailyMarks",
    path: "/(tabs)/dailyMarks",
    icon: Award,
    label: "العلامات اليومية",
  },
  {
    name: "attendance",
    path: "/(tabs)/attendance",
    icon: UserCheck,
    label: "الحضور والغياب",
  },
  {
    name: "chat",
    path: "/(tabs)/chat",
    icon: MessageSquare,
    label: "المحادثة",
  },
];

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const { isAdmin, isSecretary } = useAuth();

  // Hide CustomTabBar completely for admin and secretary users
  if (isAdmin() || isSecretary()) {
    return null;
  }

  // Completely disable CustomTabBar for chat-related pages, notifications, and dailyMarks
  if (
    pathname.includes("chat") ||
    pathname.includes("notifications") ||
    pathname.includes("dailyMarks") ||
    pathname.includes("attendance") ||
    pathname.includes("warnings") ||
    pathname.includes("reports") ||
    pathname.includes("profile") ||
    pathname.includes("settings") ||
    pathname.includes("points-game") ||
    pathname.includes("admin ") ||
    pathname.includes("dashboard")
  ) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/(tabs)") {
      return pathname === "/(tabs)" || pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const handlePress = (path: string) => {
    // Add press animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.tabBar, { transform: [{ scale: scaleValue }] }]}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tab, active && styles.activeTab]}
              onPress={() => handlePress(tab.path)}
              activeOpacity={0.8}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  active && styles.activeIconContainer,
                ]}>
                <Icon size={26} color={active ? "#ffffff" : "#64748b"} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    backgroundColor: "transparent",
    pointerEvents: "box-none",
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 15,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    minHeight: Platform.OS === "ios" ? 85 : 70,
    ...Platform.select({
      ios: {
        shadowColor: "#64748b",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    flex: 1,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#e8f7f1",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  activeIconContainer: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
