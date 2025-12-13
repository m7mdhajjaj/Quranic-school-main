import React, { memo } from "react";
// import type { StatCardProps } from "../types";
import { Card } from "@/components/UI";

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  bgColor: string;
  onClick?: () => void;
};

export const StatCard: React.FC<StatCardProps> = memo(({
  icon,
  title,
  value,
  color,
  bgColor,
  onClick,
}) => (
  <Card
    className={`${bgColor} p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 ${
      onClick ? "cursor-pointer hover:scale-[1.02] sm:hover:scale-105 group" : ""
    } relative overflow-hidden`}
    onClick={onClick}>
    {/* خلفية متحركة */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div
          className={`p-2 sm:p-3 lg:p-4 ${color} rounded-xl sm:rounded-2xl shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
          <div className="text-2xl sm:text-3xl lg:text-3xl">{icon}</div>
        </div>
      </div>

      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">{title}</p>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  </Card>
));

StatCard.displayName = "StatCard";
