// ============================================================================
// SecretariesStatsCards - بطاقات إحصائيات السكرتارية
// ============================================================================

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import type { SecretaryStats } from "@/Api/secretaryApi";

interface SecretariesStatsCardsProps {
  stats: SecretaryStats;
  loading: boolean;
}

export const SecretariesStatsCards: React.FC<SecretariesStatsCardsProps> = ({
  stats,
  loading,
}) => {
  const statsData = [
    {
      label: "إجمالي السكرتارية",
      value: stats.total,
      icon: "👥",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      iconBg: "bg-purple-500",
    },
    {
      label: "متوسط العمر",
      value: Math.round(stats.avgAge),
      icon: "🎂",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      iconBg: "bg-indigo-500",
      suffix: " سنة",
    },
    {
      label: "ذكور",
      value: stats.male,
      icon: "👨",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700",
      iconBg: "bg-cyan-600",
    },
    {
      label: "إناث",
      value: stats.female,
      icon: "👩",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
      iconBg: "bg-pink-500",
    },
  ];

  if (loading) {
    return (
      <View className="flex-row justify-center py-8">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-3">
      {statsData.map((stat, index) => (
        <View
          key={index}
          className={`${stat.bgColor} rounded-2xl p-4 shadow-md border border-gray-100 flex-1 min-w-[45%]`}>
          <View className="flex-row items-center justify-between mb-3">
            <View className={`${stat.iconBg} rounded-xl p-2`}>
              <Text className="text-2xl">{stat.icon}</Text>
            </View>
            <View className="flex-1 items-end mr-2">
              <Text className={`${stat.textColor} font-bold text-2xl`}>
                {stat.value}
                {stat.suffix || ""}
              </Text>
            </View>
          </View>
          <Text className={`${stat.textColor} font-semibold text-sm`}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
};
