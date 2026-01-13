import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Header } from "@/components/Layout";
import CustomTabBar from "@/components/Navigation/CustomTabBar";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#10b981",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            display: "none", // إخفاء الـ default tab bar
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "الرئيسية",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="dailyMarks"
          options={{
            title: "العلامات اليومية",
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            title: "الحضور والغياب",
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "المحادثة",
          }}
        />
        {/* Hidden Screens - accessible from drawer only */}
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="prayer-times"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="quran"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="quran-audio"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="azkar"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="ranking"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="points-game"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="exam-schedule"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="warnings"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="ai-chat"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="timetable"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Custom Bottom Tab Bar */}
      {/* إخفاء الـ TabBar في صفحات ai-chat و chat system */}
      {!(
        typeof window !== "undefined" &&
        window.location &&
        window.location.pathname.match(/(ai-chat|chat)/) // Added 'chat' back to the condition
      ) && <CustomTabBar />}
    </View>
  );
}
