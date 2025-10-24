import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'emerald' | 'blue' | 'red' | 'amber' | 'purple';
  fullScreen?: boolean;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'emerald',
  fullScreen = false,
  text,
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

  const spinner = (
    <>
      <div
        className={`animate-spin rounded-full border-t-transparent ${sizes[size]} ${colors[color]}`}
      />
      {text && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {spinner}
    </div>
  );
};
