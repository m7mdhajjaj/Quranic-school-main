// ============================================================================
// GroupsStatsCards - بطاقات إحصائيات الحلقات
// ============================================================================

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import type { GroupsStats } from "@/types/group.types";

interface GroupsStatsCardsProps {
  stats: GroupsStats;
  loading?: boolean;
}

export const GroupsStatsCards: React.FC<GroupsStatsCardsProps> = ({
  stats,
  loading = false,
}) => {
  const statsData = [
    {
      label: "إجمالي الحلقات",
      value: stats.totalGroups,
      icon: "📚",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      iconBg: "bg-blue-500",
    },
    {
      label: "إجمالي الطلاب",
      value: stats.totalStudents,
      icon: "👥",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      iconBg: "bg-emerald-500",
    },
    {
      label: "حلقات ممتلئة",
      value: stats.fullGroups,
      icon: "✅",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      iconBg: "bg-green-500",
    },
    {
      label: "حلقات فارغة",
      value: stats.emptyGroups,
      icon: "⚠️",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      iconBg: "bg-orange-500",
    },
    {
      label: "السعة الإجمالية",
      value: stats.totalCapacity,
      icon: "📊",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      iconBg: "bg-purple-500",
    },
    {
      label: "مقاعد متاحة",
      value: stats.availableSeats,
      icon: "🪑",
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
