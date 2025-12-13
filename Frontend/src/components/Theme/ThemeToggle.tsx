import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/UI';

export interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Size of the toggle button */
  size?: 'sm' | 'md' | 'lg';
  /** Show label text */
  showLabel?: boolean;
}

/**
 * ThemeToggle Component
 * Reusable component for switching between light and dark mode
 * 
 * Features:
 * - Persists theme preference in localStorage
 * - Applies theme to document root
 * - Smooth transitions
 * - Accessible (keyboard navigation, ARIA labels)
 * 
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle size="lg" showLabel />
 * ```
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check localStorage first, then system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={`${sizeClasses[size]} ${className}`}
      aria-label={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
      title={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
    >
      <div className="relative flex items-center gap-2">
        {isDark ? (
          <>
            <Moon size={iconSizes[size]} className="text-yellow-400" />
            {showLabel && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                الوضع الليلي
              </span>
            )}
          </>
        ) : (
          <>
            <Sun size={iconSizes[size]} className="text-yellow-500" />
            {showLabel && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                الوضع النهاري
              </span>
            )}
          </>
        )}
      </div>
    </Button>
  );
};

export default ThemeToggle;
