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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm animate-pulse"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 mb-2" />
                <div className="h-5 sm:h-6 bg-gray-300 rounded w-10 sm:w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-white/90 mb-0.5 sm:mb-1 truncate">{card.title}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {card.value}
                  {card.suffix && (
                    <span className="text-[10px] sm:text-sm font-normal mr-1">{card.suffix}</span>
                  )}
                </p>
                <p className="text-[9px] sm:text-xs text-white/80 mt-0.5 sm:mt-1 truncate hidden xs:block">{card.subtitle}</p>
                {/* شريط النسبة */}
                {card.percentage !== null && card.percentage > 0 && (
                  <div className="mt-1.5 sm:mt-2">
                    <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5">
                      <div
                        className="bg-white rounded-full h-1 sm:h-1.5 transition-all duration-500"
                        style={{ width: `${card.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

SecretariesStatsCards.displayName = "SecretariesStatsCards";
