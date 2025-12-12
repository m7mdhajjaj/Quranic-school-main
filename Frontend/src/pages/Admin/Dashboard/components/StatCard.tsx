import React from "react";
import type { StatCardProps } from "../types";
import { Card } from "@/components/UI";

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  color,
  bgColor,
  borderColor,
  trend,
  onClick,
  percentage = 0,
}) => (
  <Card
    className={`${bgColor} p-6 border-2 ${borderColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
      onClick ? "cursor-pointer hover:scale-105 group" : ""
    } relative overflow-hidden`}
    onClick={onClick}>
    {/* خلفية متحركة */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-4 ${color} rounded-2xl shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
          {icon}
        </div>

        {/* مؤشر النسبة المئوية */}
        {percentage > 0 && (
          <div className="text-right">
            <div className="w-16 h-16 relative">
              <svg
                className="w-16 h-16 transform -rotate-90"
                viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${percentage * 1.76} 176`}
                  className="text-green-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">
                  {percentage}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-4xl font-bold text-gray-900 mb-2">
          {value.toLocaleString()}
        </p>
        {trend && (
          <div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full w-fit">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span className="text-xs font-semibold">{trend}</span>
          </div>
        )}
      </div>
    </div>
  </Card>
);
