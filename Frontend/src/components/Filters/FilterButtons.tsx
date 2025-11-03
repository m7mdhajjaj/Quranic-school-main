import React from 'react';

export interface FilterButton {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface FilterButtonsProps {
  buttons: FilterButton[];
  activeValue: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: 'default' | 'rounded' | 'pills';
}

/**
 * مكون أزرار فلتر قابل لإعادة الاستخدام
 * مناسب للفلتر السريع بين خيارات محدودة
 */
const FilterButtons: React.FC<FilterButtonsProps> = ({
  buttons,
  activeValue,
  onChange,
  className = '',
  variant = 'default',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'rounded':
        return 'rounded-full';
      case 'pills':
        return 'rounded-2xl px-6';
      default:
        return 'rounded-lg';
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {buttons.map((button) => (
        <button
          key={button.value}
          onClick={() => onChange(button.value)}
          className={`
            ${getVariantClasses()}
            px-4 py-2 font-medium transition-all duration-200
            ${
              activeValue === button.value
                ? 'bg-emerald-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200'
            }
          `}
        >
          <div className="flex items-center gap-2">
            {button.icon && <span>{button.icon}</span>}
            <span>{button.label}</span>
            {button.count !== undefined && (
              <span
                className={`
                text-xs px-2 py-0.5 rounded-full
                ${
                  activeValue === button.value
                    ? 'bg-white text-emerald-600'
                    : 'bg-gray-100 text-gray-600'
                }
              `}
              >
                {button.count}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
