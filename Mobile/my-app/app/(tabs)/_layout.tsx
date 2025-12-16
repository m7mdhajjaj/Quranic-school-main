import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Header } from "@/components/Layout";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Header />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
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
          name="explore"
          options={{
            title: "استكشف",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="paperplane.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            href: null, // Hide from tabs
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            href: null, // Hide from tabs - accessible from drawer
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            href: null, // Hide from tabs - accessible from drawer
          }}
        />
        <Tabs.Screen
          name="prayer-times"
          options={{
            href: null, // Hide from tabs - accessible from drawer
          }}
        />
        <Tabs.Screen
          name="quran"
          options={{
            href: null, // Hide from tabs - accessible from drawer
          }}
        />
        <Tabs.Screen
          name="quran-audio"
          options={{
            href: null, // Hide from tabs - accessible from drawer
          }}
        />
        <Tabs.Screen
          name="azkar"
          options={{
            href: null, // Hide from tabs - accessible from drawer
          }}
        />
        <Tabs.Screen
          name="dailyMarks"
          options={{
            href: null, // Hide from tabs - accessible from drawer
          }}
        />
      </Tabs>
    </>
  );
}
