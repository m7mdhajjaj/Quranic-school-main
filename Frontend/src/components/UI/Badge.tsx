import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'full';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'full',
  icon,
  className,
}) => {
  const variants = {
    primary: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border ${variants[variant]} ${sizes[size]} ${roundedClasses[rounded]} ${className || ''}`}
    >
      {icon && icon}
      {children}
    </span>
  );
};
