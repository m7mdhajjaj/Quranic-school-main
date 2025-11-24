import React, { useState, memo, useCallback, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  showPasswordToggle?: boolean; // خاصية جديدة لإظهار/إخفاء كلمة المرور
}

const InputComponent: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  required,
  className = '',
  showPasswordToggle = false,
  type,
  value,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Memoize toggle function
  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // تحديد نوع الـ input بناءً على حالة إظهار كلمة المرور
  const inputType = showPasswordToggle && showPassword ? 'text' : (showPasswordToggle ? 'password' : type);

  // التحقق من وجود قيمة لإظهار أيقونة العين
  const hasValue = Boolean(value);

  // Memoize className لتجنب إعادة حسابها في كل render
  const inputClassName = useMemo(() => {
    const baseClasses = 'w-full px-5 py-4 bg-white border-2 rounded-2xl text-right placeholder-gray-400 text-base shadow-sm';
    const leftPadding = leftIcon ? 'pl-10' : '';
    const rightPadding = (rightIcon || (showPasswordToggle && hasValue)) ? 'pl-14' : '';
    const borderClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100';
    const focusClasses = 'focus:ring-2 focus:outline-none';
    
    return `${baseClasses} ${leftPadding} ${rightPadding} ${borderClasses} ${focusClasses} ${className}`.trim();
  }, [leftIcon, rightIcon, showPasswordToggle, hasValue, error, className]);

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-base font-semibold text-gray-700 mb-3">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          type={inputType}
          value={value}
          className={inputClassName}
          required={required}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
        {/* زر إظهار/إخفاء كلمة المرور على اليسار */}
        {showPasswordToggle && hasValue && (
          <button
            type="button"
            tabIndex={-1}
            onClick={togglePassword}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 focus:outline-none transition-colors duration-200"
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'عرض كلمة المرور'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {!error && helperText && (
        <p className="text-gray-500 text-xs mt-1">{helperText}</p>
      )}
    </div>
  );
};

export const Input = memo(InputComponent);
