import React from 'react';
import { Search, X } from 'lucide-react';

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
 * مكون بحث محسّن وجميل
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
    sm: 'py-2 text-sm',
    md: 'py-3 text-base',
    lg: 'py-4 text-lg',
  };

  const iconSize = {
    sm: 18,
    md: 20,
    lg: 22,
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Icon */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <Search 
          size={iconSize[size]} 
          className="text-emerald-500"
        />
      </div>

      {/* Input Field */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full
          ${sizeClasses[size]}
          pr-12 pl-12
          text-right
          bg-white
          border-2 border-gray-200
          rounded-xl
          focus:outline-none 
          focus:border-emerald-500 
          focus:ring-4 
          focus:ring-emerald-100
          transition-all
          duration-300
          placeholder:text-gray-400
          disabled:bg-gray-100 
          disabled:cursor-not-allowed
          shadow-sm
          hover:shadow-md
          hover:border-emerald-300
        `}
      />

      {/* Clear Button */}
      {showClearButton && value && !disabled && (
        <button
          onClick={handleClear}
          className="
            absolute 
            left-4 
            top-1/2 
            transform 
            -translate-y-1/2
            p-1
            text-gray-400 
            hover:text-red-500
            hover:bg-red-50
            rounded-full
            transition-all
            duration-200
            hover:scale-110
          "
          type="button"
          title="مسح البحث"
        >
          <X size={iconSize[size] - 2} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
