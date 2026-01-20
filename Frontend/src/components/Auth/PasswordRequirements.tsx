import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
  /**
   * كلمة المرور المراد التحقق منها
   */
  password: string;
  /**
   * فئات CSS إضافية
   */
  className?: string;
}

interface Requirement {
  text: string;
  completed: boolean;
  optional?: boolean;
}

/**
 * مكون قابل لإعادة الاستخدام لعرض متطلبات كلمة المرور مع التحقق التفاعلي
 * مع أيقونات متحركة وتحديث لحظي
 */
export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  className = '',
}) => {
  // حساب عدد الأرقام والحروف
  const numberCount = (password.match(/[\d٠-٩]/g) || []).length;
  const letterCount = (password.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
  
  // الشروط مع التحقق اللحظي
  const has4Chars = password.length >= 4;
  const has4Numbers = numberCount >= 4;
  const has3LettersWithNumbers = letterCount >= 3 && numberCount >= 1;
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // قائمة المتطلبات مع حالة التحقق
  const requirements: Requirement[] = [
    { 
      text: '4 أحرف على الأقل', 
      completed: has4Chars 
    },
    { 
      text: 'أو 4 أرقام على الأقل', 
      completed: has4Numbers 
    },
    { 
      text: '3 حروف مع أرقام', 
      completed: has3LettersWithNumbers 
    },
    { 
      text: 'رموز خاصة (للقوة)', 
      completed: hasSpecialChars,
      optional: true
    },
  ];

  return (
    <div
      className={`p-3 sm:p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 backdrop-blur-sm rounded-lg sm:rounded-xl border border-emerald-200/60 shadow-sm transition-all duration-300 ${className}`}
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-emerald-600 via-teal-700 to-slate-700 rounded-full" />
        <p className="text-xs sm:text-sm font-semibold text-emerald-900 text-right">
          متطلبات كلمة المرور الجديدة
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 sm:gap-2.5">
        {requirements.map((req, index) => {
          const isActive = password.length > 0;
          
          return (
            <div
              key={index}
              className={`
                flex items-center gap-2 sm:gap-3 transition-all duration-300 ease-out
                ${req.completed 
                  ? 'translate-x-0 opacity-100' 
                  : isActive 
                  ? 'translate-x-0 opacity-100' 
                  : 'opacity-60'
                }
              `}
            >
              {/* Icon Container with Animation */}
              <div
                className={`
                  flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center
                  transition-all duration-300 ease-out
                  ${req.completed
                    ? 'bg-emerald-500 scale-100 shadow-sm shadow-emerald-500/50'
                    : isActive
                    ? 'bg-gray-200 border-2 border-gray-300 scale-100'
                    : 'bg-gray-100 border-2 border-gray-200 scale-90'
                  }
                `}
              >
                {req.completed ? (
                  <Check 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white animate-in fade-in zoom-in duration-200" 
                    strokeWidth={3}
                  />
                ) : isActive ? (
                  <X 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" 
                    strokeWidth={2.5}
                  />
                ) : null}
              </div>

              {/* Text with conditional styling */}
              <span
                className={`
                  text-[11px] sm:text-sm transition-all duration-300
                  ${req.completed
                    ? 'text-emerald-700 font-medium'
                    : isActive
                    ? 'text-gray-600'
                    : 'text-gray-500'
                  }
                  ${req.optional ? 'opacity-75' : ''}
                `}
              >
                {req.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
