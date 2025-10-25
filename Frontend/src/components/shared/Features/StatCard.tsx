import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'emerald',
  description,
  className,
}) => {
  const colors = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-indigo-500',
    amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-rose-500',
    purple: 'from-purple-500 to-pink-500',
  };

  const borderColors = {
    emerald: 'border-emerald-500',
    blue: 'border-blue-500',
    amber: 'border-amber-500',
    red: 'border-red-500',
    purple: 'border-purple-500',
  };

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-lg border-r-4 ${borderColors[color]} hover:shadow-xl transition-all duration-300 ${className || ''}`}
      dir="rtl"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            {trend && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={`p-3 rounded-lg bg-gradient-to-br ${colors[color]} text-white`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
