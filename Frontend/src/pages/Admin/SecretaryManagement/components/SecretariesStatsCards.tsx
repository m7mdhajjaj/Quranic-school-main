import React, { memo } from "react";
import { Users, UserCheck, User, Activity } from "lucide-react";
import type { SecretaryStats } from "../types";

interface SecretariesStatsCardsProps {
  stats: SecretaryStats & { isLoading?: boolean };
  isLoading?: boolean;
}

export const SecretariesStatsCards: React.FC<SecretariesStatsCardsProps> = memo(({
  stats,
  isLoading = false,
}) => {
  const cards = [
    {
      title: "إجمالي السكرتيرين",
      value: stats.total,
      icon: Users,
      subtitle: "جميع السكرتيرين",
      percentage: null,
    },
    {
      title: "ذكور",
      value: stats.male,
      icon: User,
      subtitle: `${stats.malePercentage || 0}% من الإجمالي`,
      percentage: stats.malePercentage || 0,
    },
    {
      title: "إناث",
      value: stats.female,
      icon: UserCheck,
      subtitle: `${stats.femalePercentage || 0}% من الإجمالي`,
      percentage: stats.femalePercentage || 0,
    },
    {
      title: "متوسط العمر",
      value: stats.avgAge,
      icon: Activity,
      subtitle: "متوسط الأعمار",
      suffix: "سنة",
      percentage: null,
    },
  ];

  if (isLoading || stats.isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-6 bg-gray-300 rounded w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-white/90 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-white">
                  {card.value}
                  {card.suffix && (
                    <span className="text-sm font-normal mr-1">{card.suffix}</span>
                  )}
                </p>
                <p className="text-xs text-white/80 mt-1">{card.subtitle}</p>
                {/* شريط النسبة */}
                {card.percentage !== null && card.percentage > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div
                        className="bg-white rounded-full h-1.5 transition-all duration-500"
                        style={{ width: `${card.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

SecretariesStatsCards.displayName = "SecretariesStatsCards";
