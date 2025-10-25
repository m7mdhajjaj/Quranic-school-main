import React, { useState, useEffect, useCallback } from 'react';

/**
 * ThemeToggle Component Props
 * @interface ThemeToggleProps
 */
export interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Button size variants */
  size?: 'sm' | 'md' | 'lg';
  /** Visual style variants */
  variant?: 'default' | 'minimal' | 'pill';
  /** Show theme label text */
  showLabel?: boolean;
  /** Adaptive styling when scrolled */
  scrolled?: boolean;
  /** Custom callback when theme changes */
  onChange?: (isDark: boolean) => void;
  /** Disable the toggle */
  disabled?: boolean;
  /** Show tooltip on hover */
  showTooltip?: boolean;
}

/**
 * ThemeToggle - مكون تبديل الوضع الليلي/النهاري
 * 
 * @component
 * @example
 * // Basic usage
 * <ThemeToggle />
 * 
 * @example
 * // With label and custom size
 * <ThemeToggle size="lg" showLabel />
 * 
 * @example
 * // Minimal variant with callback
 * <ThemeToggle 
 *   variant="minimal" 
 *   onChange={(isDark) => console.log('Theme changed:', isDark)} 
 * />
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  variant = 'default',
  showLabel = false,
  scrolled = false,
  onChange,
  disabled = false,
  showTooltip = true,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  // Handle dark mode toggle
  const toggleDarkMode = useCallback(() => {
    if (disabled) return;
    
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode.toString());

      // Apply dark mode to document
      if (newMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }

      // Call onChange callback if provided
      onChange?.(newMode);

      return newMode;
    });
  }, [disabled, onChange]);

  // Initialize dark mode on component mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'p-1.5 sm:p-2',
      icon: 'w-3 h-3 sm:w-4 sm:h-4',
      text: 'text-xs',
    },
    md: {
      button: 'p-2 sm:p-2.5 md:p-3',
      icon: 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6',
      text: 'text-sm',
    },
    lg: {
      button: 'p-3 sm:p-4',
      icon: 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7',
      text: 'text-base',
    },
  };

  // Variant styles
  const getVariantClasses = () => {
    const baseClasses = `relative transition-all duration-500 transform ${
      disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer'
    } overflow-hidden group`;
    
    switch (variant) {
      case 'minimal':
        return `${baseClasses} rounded-lg ${
          isDarkMode
            ? 'text-yellow-500 hover:text-yellow-400'
            : 'text-gray-600 hover:text-gray-800'
        }`;
        
      case 'pill':
        return `${baseClasses} rounded-full border-2 ${
          isDarkMode
            ? 'border-yellow-400 bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
            : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
        }`;
        
      default:
        return `${baseClasses} rounded-lg sm:rounded-xl ${
          scrolled
            ? isDarkMode
              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg hover:from-yellow-600 hover:to-amber-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : isDarkMode
              ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900 shadow-lg hover:from-yellow-500 hover:to-amber-500'
              : 'bg-white/20 text-white hover:bg-white/30'
        }`;
    }
  };

  const currentSize = sizeClasses[size];
  const tooltipText = isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع المظلم';
  const ariaLabel = isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع المظلم';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleDarkMode}
        disabled={disabled}
        className={`${getVariantClasses()} ${currentSize.button}`}
        title={showTooltip ? tooltipText : undefined}
        aria-label={ariaLabel}
        type="button"
      >
        <div className="relative z-10">
          {isDarkMode ? (
            // Sun icon for light mode
            <svg
              className={`${currentSize.icon} transform transition-all duration-500 group-hover:rotate-180 group-hover:scale-110`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            // Moon icon for dark mode
            <svg
              className={`${currentSize.icon} transform transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </div>

        {/* Background animation effect */}
        {variant === 'default' && (
          <div
            className={`absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
              isDarkMode
                ? 'bg-gradient-to-r from-yellow-300/30 to-amber-300/30'
                : 'bg-gradient-to-r from-blue-400/20 to-indigo-400/20'
            }`}
          />
        )}
      </button>

      {showLabel && (
        <span className={`font-medium transition-colors ${currentSize.text} ${
          isDarkMode ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-700'
        }`}>
          {isDarkMode ? 'الوضع المظلم' : 'الوضع الفاتح'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;