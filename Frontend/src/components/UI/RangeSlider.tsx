import React, { useState, useRef, useCallback } from 'react';

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
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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

  const percentage = ((localValue - min) / (max - min)) * 100;

  // Debounced onChange - only update parent after user stops dragging
  const handleChange = useCallback((newValue: number) => {
    // Update local state immediately for smooth UI
    setLocalValue(newValue);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce parent update
    debounceTimer.current = setTimeout(() => {
      onChange(newValue);
      debounceTimer.current = null;
    }, 100); // 100ms debounce for sliders (faster than text input)
  }, [onChange]);

  // Sync local value when prop changes externally
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className={`w-full ${className || ''}`}>
      {label && (
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {showValue && (
            <span className="text-lg font-bold text-gray-800 min-w-[60px] text-center">
              {localValue}
              {max === 10 && '/10'}
              {max === 100 && '%'}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        {/* Single progress bar with gradient fill */}
        <div className="relative w-full h-3 rounded-lg bg-gray-200 overflow-hidden">
          <div
            className={`absolute inset-y-0 right-0 ${bgColors[color]}`}
            style={{ width: `${percentage}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={(e) => handleChange(Number(e.target.value))}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            disabled={disabled}
            aria-label={label || 'Range slider'}
            className={`absolute inset-0 w-full h-full appearance-none cursor-pointer bg-transparent ${colors[color]} ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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
