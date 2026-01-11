// ============================================================================
// GroupsStatsCards - بطاقات إحصائيات الحلقات
// ============================================================================

import React from "react";
import { View, Text } from "react-native";
import type { GroupsStats } from "@/types/group.types";

interface GroupsStatsCardsProps {
  stats: GroupsStats;
}

export const GroupsStatsCards: React.FC<GroupsStatsCardsProps> = ({
  stats,
}) => {
  const statCards = [
    {
      label: "إجمالي الحلقات",
      value: stats.totalGroups,
      emoji: "📚",
      color: "bg-blue-100 border-blue-300",
      textColor: "text-blue-700",
    },
    {
      label: "إجمالي الطلاب",
      value: stats.totalStudents,
      emoji: "👥",
      color: "bg-emerald-100 border-emerald-300",
      textColor: "text-emerald-700",
    },
    {
      label: "حلقات ممتلئة",
      value: stats.fullGroups,
      emoji: "✅",
      color: "bg-green-100 border-green-300",
      textColor: "text-green-700",
    },
    {
      label: "حلقات فارغة",
      value: stats.emptyGroups,
      emoji: "⚠️",
      color: "bg-orange-100 border-orange-300",
      textColor: "text-orange-700",
    },
    {
      label: "السعة الإجمالية",
      value: stats.totalCapacity,
      emoji: "📊",
      color: "bg-purple-100 border-purple-300",
      textColor: "text-purple-700",
    },
    {
      label: "مقاعد متاحة",
      value: stats.availableSeats,
      emoji: "🪑",
      color: "bg-pink-100 border-pink-300",
      textColor: "text-pink-700",
    },
  ];

  return (
    <View className="mb-6 gap-3">
      {statCards.map((stat, index) => (
        <View
          key={index}
          className={`${stat.color} rounded-2xl p-5 border-2 shadow-sm`}>
          <View className="flex-row items-center gap-4">
            {/* Emoji and Number Section */}
            <View className="items-center justify-center min-w-[80px]">
              <Text className="text-4xl mb-1">{stat.emoji}</Text>
              <Text className={`text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </Text>
            </View>

            {/* Label Section */}
            <View className="flex-1 justify-center border-r-2 border-gray-300 pr-4">
              <Text
                className={`text-lg font-bold ${stat.textColor} text-right`}>
                {stat.label}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};
