// ============================================================================
// TeachersStatsCards - بطاقات إحصائيات المعلمين
// ============================================================================

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import type { TeachersStats } from "@/types/teacher.types";

interface TeachersStatsCardsProps {
  stats: TeachersStats;
  loading?: boolean;
}

export const TeachersStatsCards: React.FC<TeachersStatsCardsProps> = ({
  stats,
  loading = false,
}) => {
  const statsData = [
    {
      label: "إجمالي المعلمين",
      value: stats.totalTeachers,
      icon: "👥",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      iconBg: "bg-blue-500",
    },
    {
      label: "معلمين نشطين",
      value: stats.activeTeachers,
      icon: "✅",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      iconBg: "bg-green-500",
    },
    {
      label: "معلمين غير نشطين",
      value: stats.inactiveTeachers,
      icon: "⏸️",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      iconBg: "bg-orange-500",
    },
    {
      label: "ذكور",
      value: stats.maleTeachers,
      icon: "👨",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700",
      iconBg: "bg-cyan-600",
    },
    {
      label: "إناث",
      value: stats.femaleTeachers,
      icon: "👩",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
      iconBg: "bg-pink-500",
    },
    {
      label: "لديهم حلقات",
      value: stats.teachersWithGroups,
      icon: "📚",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      iconBg: "bg-emerald-500",
    },
    {
      label: "بدون حلقات",
      value: stats.teachersWithoutGroups,
      icon: "⚠️",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      iconBg: "bg-yellow-500",
    },
    {
      label: "متوسط العمر",
      value: stats.averageAge ? Math.round(stats.averageAge) : 0,
      icon: "🎂",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      iconBg: "bg-purple-500",
      suffix: " سنة",
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
