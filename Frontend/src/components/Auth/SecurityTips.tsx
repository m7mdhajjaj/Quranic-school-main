import React from 'react';

interface SecurityTipsProps {
  /**
   * فئات CSS إضافية
   */
  className?: string;
  /**
   * نصائح مخصصة (اختياري)
   */
  customTips?: string[];
}

/**
 * مكون قابل لإعادة الاستخدام لعرض نصائح الأمان لكلمة المرور
 */
export const SecurityTips: React.FC<SecurityTipsProps> = ({
  className = '',
  customTips,
}) => {
  const defaultTips = [
    'لا تشارك كلمة المرور مع أي شخص',
    'استخدم كلمة مرور فريدة لكل حساب',
    'غيّر كلمة المرور بانتظام',
    'استخدم أحرف وأرقام ورموز متنوعة',
    'تجنب المعلومات الشخصية الواضحة',
  ];

  const tips = customTips || defaultTips;

  return (
    <div
      className={`p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-lg ${className}`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            نصائح الأمان
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {tips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
