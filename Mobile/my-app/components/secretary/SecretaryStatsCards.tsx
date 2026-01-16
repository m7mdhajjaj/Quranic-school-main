// ============================================================================
// SecretaryStatsCards - بطاقات إحصائيات السكرتيرين
// ============================================================================

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Users, UserCheck, User } from "lucide-react-native";
import type { SecretaryStats } from "@/types/secretary.types";

interface SecretaryStatsCardsProps {
  stats: SecretaryStats | null;
  loading?: boolean;
}

export const SecretaryStatsCards: React.FC<SecretaryStatsCardsProps> = ({
  stats,
  loading = false,
}) => {
  if (loading) {
    return (
      <View className="flex-row flex-wrap gap-3">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="flex-1 min-w-[100px] bg-white rounded-xl p-4 items-center justify-center border border-gray-200">
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
        ))}
      </View>
    );
  }

  const statsData = [
    {
      label: "الإجمالي",
      value: stats?.total || 0,
      icon: Users,
      color: "#3b82f6",
      bgColor: "bg-blue-50",
    },
    {
      label: "ذكور",
      value: stats?.male || 0,
      icon: User,
      color: "#10b981",
      bgColor: "bg-emerald-50",
    },
    {
      label: "إناث",
      value: stats?.female || 0,
      icon: UserCheck,
      color: "#f59e0b",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <View className="flex-row flex-wrap gap-3">
      {statsData.map((stat, index) => (
        <View
          key={index}
          className={`flex-1 min-w-[100px] ${stat.bgColor} rounded-xl p-4 border border-gray-100`}>
          <View className="flex-row items-center justify-between mb-2">
            <stat.icon size={20} color={stat.color} />
            <Text className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </Text>
          </View>
          <Text className="text-gray-600 text-xs text-center">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default SecretaryStatsCards;
