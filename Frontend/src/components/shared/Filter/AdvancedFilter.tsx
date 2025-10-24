import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AdvancedFilterProps {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * مكون فلتر متقدم قابل للطي
 * مناسب للفلاتر الإضافية التي لا تستخدم دائماً
 */
const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  children,
  title = "فلاتر متقدمة",
  defaultOpen = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        type="button">
        <span className="font-medium text-gray-700">{title}</span>
        {isOpen ? (
          <ChevronUp className="text-gray-600" size={20} />
        ) : (
          <ChevronDown className="text-gray-600" size={20} />
        )}
      </button>

      {isOpen && (
        <div className="p-4 bg-white space-y-4 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
