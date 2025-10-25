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
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  score,
  label,
  color,
  className = '',
}) => {
  const progressWidth = password ? score : 0;
  const progressColor = password ? color : 'bg-gray-300';
  const textColor = password ? color.replace('bg-', 'text-') : 'text-gray-400';
  const displayLabel = password ? label : 'لم يتم الإدخال';

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-700">قوة كلمة المرور:</span>
        <span className={`text-xs font-semibold ${textColor}`}>
          {displayLabel}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-500 ease-out rounded-full`}
        >
          <style>{`
            .progress-bar-${score}-${password.length} {
              width: ${progressWidth}%;
            }
          `}</style>
          <div className={`h-full progress-bar-${score}-${password.length}`}></div>
        </div>
      </div>
    </div>
  );
};
