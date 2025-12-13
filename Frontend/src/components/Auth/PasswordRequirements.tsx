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
      className={`p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 backdrop-blur-sm rounded-xl border border-emerald-200/60 shadow-sm transition-all duration-300 ${className}`}
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
        <p className="text-sm font-semibold text-emerald-900 text-right">
          متطلبات كلمة المرور الجديدة
        </p>
      </div>
      
      <div className="space-y-2.5">
        {requirements.map((req, index) => {
          const isActive = password.length > 0;
          
          return (
            <div
              key={index}
              className={`
                flex items-center gap-3 transition-all duration-300 ease-out
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
                  flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
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
                    className="w-3 h-3 text-white animate-in fade-in zoom-in duration-200" 
                    strokeWidth={3}
                  />
                ) : isActive ? (
                  <X 
                    className="w-3 h-3 text-gray-400" 
                    strokeWidth={2.5}
                  />
                ) : null}
              </div>

              {/* Text with conditional styling */}
              <span
                className={`
                  text-sm transition-all duration-300
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
