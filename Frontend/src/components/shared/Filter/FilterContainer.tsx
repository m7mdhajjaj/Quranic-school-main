import React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterContainerProps {
  children: React.ReactNode;
  title?: string;
  onClear?: () => void;
  showClearButton?: boolean;
  className?: string;
  variant?: 'default' | 'gradient' | 'bordered';
  resultsCount?: number;
  resultsLabel?: string;
}

/**
 * حاوية للفلاتر - تجمع جميع عناصر الفلترة
 * يمكن استخدامها لتنظيم الفلاتر المتعددة
 */
const FilterContainer: React.FC<FilterContainerProps> = ({
  children,
  title = "تصفية وبحث",
  onClear,
  showClearButton = true,
  className = "",
  variant = 'gradient',
  resultsCount,
  resultsLabel = "نتيجة",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-emerald-100 to-teal-100';
      case 'bordered':
        return 'bg-white border-2 border-emerald-200';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className={`${getVariantClasses()} rounded-2xl shadow-md p-6 mb-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="text-emerald-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        
        {showClearButton && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all duration-200"
            type="button">
            <X size={18} />
            <span>مسح الفلاتر</span>
          </button>
        )}
      </div>

      {/* Filters Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Results Count */}
      {resultsCount !== undefined && (
        <div className="text-center mt-6 pt-4 border-t border-emerald-200">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm">
            <span className="text-emerald-700 font-bold text-lg">
              {resultsCount}
            </span>
            <span className="text-emerald-600">{resultsLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterContainer;
