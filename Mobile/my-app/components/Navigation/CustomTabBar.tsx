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

  // Completely disable CustomTabBar for chat-related pages
  if (pathname.includes("chat")) {
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
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    paddingTop: 8,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
    pointerEvents: "box-none",
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    minHeight: 75,
    // iOS specific styling to match the design
    ...Platform.select({
      ios: {
        shadowColor: "#64748b",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    flex: 1,
  },
  activeTab: {
    // Additional styling for active tab can be added here
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    transition: "all 0.3s ease",
  },
  activeIconContainer: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.1 }],
  },
});
