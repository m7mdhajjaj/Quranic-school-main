import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'emerald' | 'blue' | 'red' | 'amber' | 'purple';
  fullScreen?: boolean;
  text?: string;
  showIcon?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'emerald',
  fullScreen = false,
  text,
  showIcon = true,
}) => {
  const sizes = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4',
    xl: 'h-20 w-20 border-4',
  };

  const colors = {
    emerald: 'border-emerald-600',
    blue: 'border-blue-600',
    red: 'border-red-600',
    amber: 'border-amber-600',
    purple: 'border-purple-600',
  };

  const iconSizes = {
    xs: 'text-sm',
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const spinner = (
    <>
      <div className="relative">
        {showIcon && (
          <div className={`absolute inset-0 flex items-center justify-center ${iconSizes[size]} opacity-60`}>
            📚
          </div>
        )}
        <div
          className={`animate-spin rounded-full border-t-transparent ${sizes[size]} ${colors[color]} shadow-sm`}
        />
      </div>
      {text && (
        <p className="mt-6 text-gray-700 font-semibold animate-pulse text-lg">
          {text}
        </p>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {spinner}
    </div>
  );
};
