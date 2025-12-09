import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  helperText?: string;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  icon,
  helperText,
  fullWidth = true,
  required,
  className,
  ...props
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <select
          className={`w-full ${icon ? 'pr-10' : 'pr-4'} pl-10 py-2.5 bg-white border rounded-lg transition-all appearance-none text-right text-sm ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          } focus:ring-2 focus:outline-none ${className || ''}`}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown size={14} />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {!error && helperText && <p className="text-gray-500 text-xs mt-1">{helperText}</p>}
    </div>
  );
};

