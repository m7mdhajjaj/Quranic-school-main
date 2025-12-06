import React from 'react';
import { FeatureList, type FeatureItem } from '../UI/FeatureList';

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
 * يستخدم FeatureList المشترك لتجنب تكرار UI
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

  // قائمة المتطلبات - استخدام FeatureList المشترك
  const requirements: FeatureItem[] = [
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
      text: 'رموز خاصة (اختياري للقوة)', 
      completed: hasSpecialChars,
      className: 'opacity-75'
    },
  ];

  return (
    <div
      className={`p-3 sm:p-4 bg-emerald-50/80 backdrop-blur-sm rounded-lg border border-emerald-200/50 ${className}`}
    >
      <p className="text-xs sm:text-sm font-semibold text-emerald-900 mb-1">
        متطلبات كلمة المرور الجديدة:
      </p>
      
      {/* استخدام FeatureList المشترك بدلاً من تكرار UI */}
      <FeatureList 
        items={requirements}
        variant="checklist"
        spacing="tight"
        className="pt-2 text-xs sm:text-sm"
      />
    </div>
  );
};
