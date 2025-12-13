import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';

interface SecurityTipsProps {
  /**
   * فئات CSS إضافية
   */
  className?: string;
  /**
   * نصائح مخصصة (اختياري)
   */
  customTips?: string[];
  /**
   * هل القسم قابل للطي (افتراضي: true)
   */
  collapsible?: boolean;
  /**
   * الحالة الافتراضية (افتراضي: false - مطوي)
   */
  defaultOpen?: boolean;
}

/**
 * مكون قابل لإعادة الاستخدام لعرض نصائح الأمان لكلمة المرور
 * مع إمكانية الطي والفتح
 */
export const SecurityTips: React.FC<SecurityTipsProps> = ({
  className = '',
  customTips,
  collapsible = true,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Prepare button props with proper ARIA attributes
  const buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = collapsible
    ? {
        'aria-expanded': isOpen,
        'aria-label': 'إظهار/إخفاء نصائح الأمان',
      }
    : {};

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
      className={`
        bg-gradient-to-br from-blue-50/90 to-indigo-50/90 
        backdrop-blur-sm border border-blue-200/60 rounded-xl 
        shadow-sm transition-all duration-300 overflow-hidden
        ${className}
      `}
      dir="rtl"
    >
      {/* Header - قابل للنقر إذا كان collapsible */}
      <button
        type="button"
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-3 p-4
          transition-colors duration-200
          ${collapsible 
            ? 'hover:bg-blue-100/50 cursor-pointer' 
            : 'cursor-default'
          }
        `}
        {...buttonProps}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-blue-900 text-right">
            نصائح الأمان
          </h3>
        </div>
        
        {collapsible && (
          <div className="flex-shrink-0 transition-transform duration-300">
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-blue-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-600" />
            )}
          </div>
        )}
      </button>

      {/* Content - قابل للطي */}
      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen || !collapsible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 pb-4">
          <ul className="space-y-2.5 text-right">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-blue-800 animate-in fade-in slide-in-from-right-2 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
