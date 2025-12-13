import React from 'react';

interface PasswordStrengthIndicatorProps {
  /**
   * كلمة المرور لحساب قوتها
   */
  password: string;
  /**
   * درجة قوة كلمة المرور (0-100)
   */
  score: number;
  /**
   * تصنيف القوة
   */
  label: string;
  /**
   * لون المؤشر
   */
  color: string;
  /**
   * فئات CSS إضافية
   */
  className?: string;
}

/**
 * مكون قابل لإعادة الاستخدام لعرض قوة كلمة المرور
 * مع ألوان واضحة وتصميم احترافي
 */
export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({
  password,
  score,
  label,

  className = '',
}) => {
  const progressValue = password ? Math.min(score, 100) : 0;
  const displayLabel = password ? label : 'لم يتم الإدخال';

  // تحديد الألوان بناءً على القوة
  const getStrengthColors = (strength: string) => {
    switch (strength) {
      case 'weak':
      case 'ضعيفة':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600',
          border: 'border-red-300',
          bgLight: 'bg-red-50',
        };
      case 'medium':
      case 'جيدة':
        return {
          bg: 'bg-amber-500',
          text: 'text-amber-600',
          border: 'border-amber-300',
          bgLight: 'bg-amber-50',
        };
      case 'strong':
      case 'ممتازة':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-600',
          border: 'border-emerald-300',
          bgLight: 'bg-emerald-50',
        };
      default:
        return {
          bg: 'bg-gray-300',
          text: 'text-gray-500',
          border: 'border-gray-200',
          bgLight: 'bg-gray-50',
        };
    }
  };

  const colors = getStrengthColors(label);

  return (
    <div className={`mt-3 ${className}`} dir="rtl">
      {/* Label and Score */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700 text-right">
          قوة كلمة المرور:
        </span>
        <span
          className={`
            text-xs font-bold transition-colors duration-300
            ${password ? colors.text : 'text-gray-400'}
          `}
        >
          {displayLabel}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div
        className={`
          relative h-2.5 rounded-full overflow-hidden
          ${password ? colors.bgLight : 'bg-gray-100'}
          border ${password ? colors.border : 'border-gray-200'}
          transition-all duration-300
        `}
      >
        {/* Progress Fill */}
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${password ? colors.bg : 'bg-gray-300'}
            shadow-sm
          `}
          style={{
            width: `${progressValue}%`,
            transition: 'width 0.5s ease-out, background-color 0.3s ease-out',
          }}
        >
          {/* Shine Effect */}
          {password && progressValue > 0 && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
              style={{
                animation: 'shimmer 2s infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* Strength Segments (Visual Indicator) */}
      {password && (
        <div className="flex gap-1 mt-2">
          {[0, 1, 2, 3].map((segment) => {
            const segmentValue = (segment + 1) * 25;
            const isActive = progressValue >= segmentValue;
            const segmentColor = isActive
              ? progressValue < 50
                ? 'bg-red-500'
                : progressValue < 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              : 'bg-gray-200';

            return (
              <div
                key={segment}
                className={`
                  flex-1 h-1 rounded-full transition-all duration-300
                  ${segmentColor}
                  ${isActive ? 'opacity-100' : 'opacity-30'}
                `}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
