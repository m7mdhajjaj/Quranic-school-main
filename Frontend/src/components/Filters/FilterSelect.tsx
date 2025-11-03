import React from 'react';
import { Select } from '../UI/Select';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

/**
 * مكون اختيار فلتر قابل لإعادة الاستخدام
 * يدعم خيار "الكل" تلقائياً
 */
const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  options,
  onChange,
  className = "",
  disabled = false,
  showAllOption = true,
  allOptionLabel = "الكل",
}) => {
  const allOptions: FilterOption[] = showAllOption
    ? [{ value: '', label: allOptionLabel }, ...options]
    : options;

  return (
    <div className={`w-full ${className}`}>
      <Select
      label={label}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      options={allOptions}
      disabled={disabled}
      className="shadow-sm"
      />
    </div>
  );
};

export default FilterSelect;
