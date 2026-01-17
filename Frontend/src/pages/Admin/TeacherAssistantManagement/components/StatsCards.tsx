import React from "react";
import { Users, Calendar } from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import type { TeacherAssistantStats } from "../types";

interface StatsCardsProps {
  stats: TeacherAssistantStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: "إجمالي المساعدين",
      value: stats.total,
      icon: Users,
      gradient: "from-purple-500 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-50",
      borderColor: "border-purple-200",
    },
    {
      title: "الذكور",
      value: stats.male,
      subtitle: `${stats.malePercentage}%`,
      icon: FaMale,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
    },
    {
      title: "الإناث",
      value: stats.female,
      subtitle: `${stats.femalePercentage}%`,
      icon: FaFemale,
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-50 to-rose-50",
      borderColor: "border-pink-200",
    },
    {
      title: "متوسط العمر",
      value: stats.avgAge,
      subtitle: "سنة",
      icon: Calendar,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-2xl p-4 border ${card.borderColor} shadow-sm hover:shadow-md transition-all`}
        >
          {/* Background decoration */}
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-white/30 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{card.value}</span>
              {card.subtitle && (
                <span className="text-sm text-gray-500">{card.subtitle}</span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
