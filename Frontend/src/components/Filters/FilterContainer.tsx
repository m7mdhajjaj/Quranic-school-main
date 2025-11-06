import React from "react";
import { Filter, X } from "lucide-react";

interface FilterContainerProps {
  children: React.ReactNode;
  title?: string;
  onClear?: () => void;
  showClearButton?: boolean;
  className?: string;
  variant?: "default" | "gradient" | "bordered";
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
  variant = "gradient",
  resultsCount,
  resultsLabel = "نتيجة",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 border border-emerald-100/50";
      case "bordered":
        return "bg-white border-2 border-emerald-200";
      default:
        return "bg-white";
    }
  };

  return (
    <div
      className={`${getVariantClasses()} rounded-2xl shadow-lg backdrop-blur-sm p-6 mb-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
            <Filter className="text-white" size={20} />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            {title}
          </h3>
        </div>

        {showClearButton && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 bg-white border-2 border-red-200 hover:border-red-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
            type="button">
            <X size={18} />
            <span>مسح الفلاتر</span>
          </button>
        )}
      </div>

      {/* Filters Content */}
      <div className="space-y-4">{children}</div>

      {/* Results Count */}
      {resultsCount !== undefined && (
        <div className="text-center mt-6 pt-5 border-t border-emerald-200/60">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-3 rounded-full shadow-md border border-emerald-100">
            <span className="text-emerald-700 font-bold text-xl">
              {resultsCount}
            </span>
            <span className="text-emerald-600 font-semibold">
              {resultsLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterContainer;
