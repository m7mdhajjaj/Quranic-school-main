import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'blue' | 'purple';
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  color = 'emerald',
  className,
}) => {
  const sizes = {
    sm: {
      switch: 'w-10 h-5',
      circle: 'w-4 h-4',
      translate: '-translate-x-5',
    },
    md: {
      switch: 'w-14 h-7',
      circle: 'w-6 h-6',
      translate: '-translate-x-7',
    },
    lg: {
      switch: 'w-16 h-8',
      circle: 'w-7 h-7',
      translate: '-translate-x-8',
    },
  };

  const colors = {
    emerald: checked ? 'bg-emerald-600' : 'bg-gray-300',
    blue: checked ? 'bg-blue-600' : 'bg-gray-300',
    purple: checked ? 'bg-purple-600' : 'bg-gray-300',
  };

  const sizeConfig = sizes[size];

  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`${sizeConfig.switch} ${colors[color]} rounded-full transition-colors duration-200 ease-in-out`}
        >
          <div
            className={`${sizeConfig.circle} bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out absolute right-0.5 top-1/2 -translate-y-1/2 ${
              checked ? sizeConfig.translate : ''
            }`}
          />
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
    </label>
  );
};
