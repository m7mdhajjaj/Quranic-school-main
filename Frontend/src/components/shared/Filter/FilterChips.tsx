import React from 'react';
import { X } from 'lucide-react';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
  emptyMessage?: string;
}

/**
 * مكون عرض الفلاتر النشطة كـ chips
 * يسهل على المستخدم رؤية وإزالة الفلاتر المطبقة
 */
const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  onRemove,
  onClearAll,
  className = "",
  emptyMessage = "لا توجد فلاتر مطبقة",
}) => {
  if (chips.length === 0) {
    return (
      <div className={`text-gray-500 text-sm italic ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 font-medium">الفلاتر النشطة:</span>
      
      {chips.map((chip) => (
        <div
          key={chip.id}
          className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <span>{chip.label}: {chip.value}</span>
          <button
            onClick={() => onRemove(chip.id)}
            className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
            type="button"
            title="إزالة الفلتر">
            <X size={14} />
          </button>
        </div>
      ))}

      {onClearAll && chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-700 underline font-medium"
          type="button">
          مسح الكل
        </button>
      )}
    </div>
  );
};

export default FilterChips;
