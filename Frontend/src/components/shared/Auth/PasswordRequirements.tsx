import React from 'react';

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

/**
 * مكون قابل لإعادة الاستخدام لعرض متطلبات كلمة المرور مع التحقق التفاعلي
 */
export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  className = '',
}) => {
  // حساب عدد الأرقام والحروف
  const numberCount = (password.match(/[\d٠-٩]/g) || []).length;
  const letterCount = (password.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
  
  // الشروط
  const has4Chars = password.length >= 4 && numberCount < 4;
  const has4Numbers = numberCount >= 4;
  // 3 حروف مع أرقام أو 3 أرقام مع حروف
  const has3LettersWithNumbers = 
    (letterCount >= 3 && numberCount >= 1) || 
    (numberCount >= 3 && letterCount >= 1);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    <div
      className={`p-4 bg-emerald-50/80 backdrop-blur-sm rounded-lg border border-emerald-200/50 ${className}`}
    >
      <p className="text-sm font-semibold text-emerald-900 mb-3">
        متطلبات كلمة المرور الجديدة:
      </p>
      <ul className="space-y-2 text-sm text-emerald-800">
        {/* 4 أحرف على الأقل */}
        <li
          className={`flex items-center gap-2 transition-colors ${
            has4Chars ? 'text-green-600' : ''
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              has4Chars ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          4 أحرف على الأقل
        </li>

        {/* أو 4 أرقام على الأقل */}
        <li
          className={`flex items-center gap-2 transition-colors ${
            has4Numbers ? 'text-green-600' : ''
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              has4Numbers ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          أو 4 أرقام على الأقل
        </li>

        {/* 3 حروف مع أرقام */}
        <li
          className={`flex items-center gap-2 transition-colors ${
            has3LettersWithNumbers ? 'text-green-600' : ''
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              has3LettersWithNumbers ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          3 حروف مع أرقام
        </li>

        {/* رموز خاصة (اختياري) */}
        <li
          className={`flex items-center gap-2 transition-colors ${
            hasSpecialChars ? 'text-green-600' : ''
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              hasSpecialChars ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          رموز خاصة (اختياري للقوة)
        </li>
      </ul>
    </div>
  );
};
