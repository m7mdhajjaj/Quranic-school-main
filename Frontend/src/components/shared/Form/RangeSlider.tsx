import React, { useState } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  showMinMax?: boolean;
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
  disabled?: boolean;
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  showValue = true,
  showMinMax = false,
  color = 'emerald',
  disabled = false,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const colors = {
    emerald: 'accent-emerald-600',
    blue: 'accent-blue-600',
    amber: 'accent-amber-600',
    red: 'accent-red-600',
    purple: 'accent-purple-600',
  };

  const bgColors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className || ''}`}>
      {label && (
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {showValue && (
            <span className="text-lg font-bold text-gray-800 min-w-[60px] text-center">
              {value}
              {max === 10 && '/10'}
              {max === 100 && '%'}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${colors[color]} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${isDragging ? 'scale-105' : ''} transition-transform`}
          style={{
            background: `linear-gradient(to right, 
              ${bgColors[color].replace('bg-', '')} 0%, 
              ${bgColors[color].replace('bg-', '')} ${percentage}%, 
              #e5e7eb ${percentage}%, 
              #e5e7eb 100%)`,
          }}
        />
        
        {/* Visual bar underneath */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full ${bgColors[color]} transition-all duration-200`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {showMinMax && (
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};
