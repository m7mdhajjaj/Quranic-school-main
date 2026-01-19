// ============================================================================
// SecretaryStatsCards - بطاقات إحصائيات السكرتيرين
// ============================================================================

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import type { SecretaryStats } from "@/types/secretary.types";

interface SecretaryStatsCardsProps {
  stats: SecretaryStats | null;
  loading?: boolean;
}

export const SecretaryStatsCards: React.FC<SecretaryStatsCardsProps> = ({
  stats,
  loading = false,
}) => {
  const statsData = [
    {
      label: "إجمالي السكرتيرين",
      value: stats?.total || 0,
      icon: "👥",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      iconBg: "bg-blue-500",
    },
    {
      label: "ذكور",
      value: stats?.male || 0,
      icon: "👨",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700",
      iconBg: "bg-cyan-600",
    },
    {
      label: "إناث",
      value: stats?.female || 0,
      icon: "👩",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
      iconBg: "bg-pink-500",
    },
  ];

  if (loading) {
    return (
      <View className="flex-row justify-center py-8">
        <ActivityIndicator size="large" color="#3b82f6" />
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

export default SecretaryStatsCards;
