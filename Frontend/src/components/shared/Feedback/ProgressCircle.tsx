import React from 'react';

interface ProgressCircleProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
  showLabel?: boolean;
  label?: string;
  thickness?: number;
  className?: string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'emerald',
  showLabel = true,
  label,
  thickness = 8,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: { width: 60, fontSize: 'text-xs' },
    md: { width: 100, fontSize: 'text-base' },
    lg: { width: 140, fontSize: 'text-xl' },
    xl: { width: 180, fontSize: 'text-2xl' },
  };

  const colors = {
    emerald: '#10b981',
    blue: '#3b82f6',
    amber: '#f59e0b',
    red: '#ef4444',
    purple: '#a855f7',
  };

  const config = sizes[size];
  const radius = (config.width - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className || ''}`}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={thickness}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke={colors[color]}
            strokeWidth={thickness}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Percentage text */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-gray-800 ${config.fontSize}`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-600 text-center">
          {label}
        </span>
      )}
    </div>
  );
};
