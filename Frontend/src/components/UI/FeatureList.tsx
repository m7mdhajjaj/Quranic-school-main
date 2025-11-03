import React from 'react';
import { Check } from 'lucide-react';

export interface FeatureItem {
  icon?: React.ReactNode;
  text: string;
  active?: boolean;
  completed?: boolean;
  description?: string;
  className?: string;
}

interface FeatureListProps {
  items: FeatureItem[];
  align?: 'start' | 'center' | 'end';
  className?: string;
  showCheckIcon?: boolean;
  variant?: 'default' | 'checklist' | 'minimal';
  spacing?: 'tight' | 'normal' | 'relaxed';
}

/**
 * مكون قائمة الميزات القابل لإعادة الاستخدام
 * يدعم أنماط متعددة: ميزات عادية، قوائم تحقق، قوائم بسيطة
 */
export const FeatureList: React.FC<FeatureListProps> = ({
  items,
  align = 'start',
  className = '',
  showCheckIcon = false,
  variant = 'default',
  spacing = 'normal',
}) => {
  const alignments = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  const spacings = {
    tight: 'space-y-1.5',
    normal: 'space-y-3',
    relaxed: 'space-y-4',
  };

  const getIconSize = () => {
    switch (variant) {
      case 'minimal':
        return 'w-4 h-4';
      case 'checklist':
        return 'w-5 h-5';
      default:
        return 'w-5 h-5';
    }
  };

  const getTextSize = () => {
    switch (variant) {
      case 'minimal':
        return 'text-xs sm:text-sm';
      default:
        return 'text-sm sm:text-base';
    }
  };

  return (
    <div className={`pt-4 ${spacings[spacing]} ${className}`}>
      {items.map((item, index) => {
        const isCompleted = item.completed ?? item.active ?? false;
        const itemColor = isCompleted 
          ? 'text-green-600' 
          : item.active === false 
          ? 'text-gray-400' 
          : 'text-emerald-700/80';

        return (
          <div key={index} className="space-y-1">
            <div
              className={`flex items-center lg:${alignments[align]} ${alignments.center} gap-3 transition-all duration-200 ${itemColor} ${item.className || ''}`}
            >
              {/* الأيقونة */}
              <div className={`${getIconSize()} flex-shrink-0 flex items-center justify-center`}>
                {item.icon ? (
                  item.icon
                ) : showCheckIcon || variant === 'checklist' ? (
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'border-2 border-current'
                    }`}
                  >
                    {isCompleted && <Check size={12} strokeWidth={3} />}
                  </div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </div>

              {/* النص */}
              <span
                className={`${getTextSize()} ${
                  isCompleted && variant === 'checklist' 
                    ? 'line-through opacity-75' 
                    : ''
                }`}
              >
                {item.text}
              </span>
            </div>

            {/* الوصف الاختياري */}
            {item.description && (
              <p className="text-xs text-gray-500 mr-8">{item.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
