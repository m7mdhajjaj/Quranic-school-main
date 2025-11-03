import React from 'react';

interface AuthBackgroundProps {
  /**
   * نوع الخلفية - يمكن تخصيص الألوان حسب الصفحة
   */
  variant?: 'default' | 'emerald' | 'blue' | 'purple';
  /**
   * فئات CSS إضافية
   */
  className?: string;
  /**
   * إظهار النمط الإسلامي الزخرفي
   */
  showPattern?: boolean;
}

/**
 * مكون قابل لإعادة الاستخدام لخلفية صفحات المصادقة (Login, Signup, etc)
 * يوفر خلفية متحركة مع عناصر دائرية ونمط إسلامي اختياري
 */
export const AuthBackground: React.FC<AuthBackgroundProps> = ({
  variant = 'default',
  className = '',
  showPattern = true,
}) => {
  // تحديد الألوان حسب النوع
  const getColors = () => {
    switch (variant) {
      case 'emerald':
        return {
          color1: 'bg-emerald-200/30',
          color2: 'bg-teal-200/30',
          color3: 'bg-cyan-200/30',
        };
      case 'blue':
        return {
          color1: 'bg-blue-200/30',
          color2: 'bg-indigo-200/30',
          color3: 'bg-sky-200/30',
        };
      case 'purple':
        return {
          color1: 'bg-purple-200/30',
          color2: 'bg-violet-200/30',
          color3: 'bg-fuchsia-200/30',
        };
      default:
        return {
          color1: 'bg-emerald-200/30',
          color2: 'bg-teal-200/30',
          color3: 'bg-cyan-200/30',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 ${colors.color1} rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute top-1/2 -left-20 sm:-left-40 w-48 h-48 sm:w-96 sm:h-96 ${colors.color2} rounded-full blur-3xl animate-pulse delay-1000`}
        ></div>
        <div
          className={`absolute -bottom-20 sm:-bottom-40 right-1/4 sm:right-1/3 w-40 h-40 sm:w-80 sm:h-80 ${colors.color3} rounded-full blur-3xl animate-pulse delay-2000`}
        ></div>
      </div>

      {/* Decorative Islamic Pattern Overlay */}
      {showPattern && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%271%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
      )}
    </div>
  );
};
