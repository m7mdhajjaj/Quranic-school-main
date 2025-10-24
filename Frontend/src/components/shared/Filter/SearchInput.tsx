import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '..';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * مكون بحث قابل لإعادة الاستخدام
 * يمكن استخدامه في أي مكان يحتاج بحث
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "ابحث...",
  className = "",
  showClearButton = true,
  disabled = false,
  size = 'md',
}) => {
  const handleClear = () => {
    onChange('');
  };

  const sizeClasses = {
    sm: 'text-sm py-1.5',
    md: 'text-base py-2',
    lg: 'text-lg py-3',
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        disabled={disabled}
        rightIcon={<Search size={20} className="text-emerald-600" />}
        className={`text-right ${sizeClasses[size]} ${className}`}
      />
      
      {showClearButton && value && !disabled && (
        <button
          onClick={handleClear}
          className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          type="button"
          title="مسح البحث">
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
