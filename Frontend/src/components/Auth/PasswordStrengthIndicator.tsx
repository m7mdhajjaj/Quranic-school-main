import React from 'react';
import { ProgressBar } from '../UI/ProgressBar';

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
 * يستخدم ProgressBar المشترك لتجنب تكرار UI
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  score,
  label,
  color,
  className = '',
}) => {
  const progressValue = password ? score : 0;
  const displayLabel = password ? label : 'لم يتم الإدخال';
  
  // تحويل اللون من صيغة bg-color إلى اسم اللون
  const getColorName = (bgColor: string): 'emerald' | 'blue' | 'amber' | 'red' | 'purple' => {
    if (bgColor.includes('green') || bgColor.includes('emerald')) return 'emerald';
    if (bgColor.includes('yellow') || bgColor.includes('amber')) return 'amber';
    if (bgColor.includes('orange')) return 'amber';
    if (bgColor.includes('red')) return 'red';
    return 'emerald';
  };

  const colorName = password ? getColorName(color) : 'emerald';
  const textColor = password ? color.replace('bg-', 'text-') : 'text-gray-400';

  return (
    <div className={`mt-2 ${className}`} dir="rtl">
      {/* استخدام ProgressBar المشترك مع تخصيص للـ labels */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-700 text-right">قوة كلمة المرور:</span>
        <span className={`text-xs font-semibold ${textColor} text-right`}>
          {displayLabel}
        </span>
      </div>
      
      {/* ProgressBar المشترك بدلاً من تكرار الكود */}
      <ProgressBar
        value={progressValue}
        max={100}
        color={colorName}
        size="sm"
        showPercentage={false}
        showLabel={false}
      />
    </div>
  );
};
