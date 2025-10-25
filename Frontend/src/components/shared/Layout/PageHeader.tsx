import React, { memo } from "react";
import { Book } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showDivider?: boolean;
  className?: string;
}

/**
 * PageHeader - مكون رأس الصفحة القابل لإعادة الاستخدام
 * 
 * @param title - العنوان الرئيسي
 * @param subtitle - النص التوضيحي (اختياري)
 * @param icon - أيقونة مخصصة (افتراضي: Book)
 * @param showDivider - إظهار الخط الفاصل (افتراضي: true)
 * @param className - classes إضافية
 */
const PageHeader: React.FC<PageHeaderProps> = memo(({
  title,
  subtitle,
  icon,
  showDivider = true,
  className = ""
}) => {
  const defaultIcon = <Book className="w-12 h-12 sm:w-16 sm:h-16 text-white" />;

  return (
    <div className={`text-center mb-8 sm:mb-10 lg:mb-12 animate-fadeIn ${className}`}>
      {/* أيقونة */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="relative">
          {/* خلفية متوهجة */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          
          {/* الأيقونة */}
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full p-4 sm:p-6 shadow-2xl">
            {icon || defaultIcon}
          </div>
        </div>
      </div>

      {/* العنوان */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-700 mb-3 sm:mb-4">
        {title}
      </h1>
      
      {/* الوصف */}
      {subtitle && (
        <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4">
          {subtitle}
        </p>
      )}
      
      {/* خط فاصل */}
      {showDivider && (
        <div className="flex justify-center mt-4 sm:mt-6">
          <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;
