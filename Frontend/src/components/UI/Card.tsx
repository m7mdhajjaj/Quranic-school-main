import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
  [key: string]: any; // للسماح بتمرير أي attributes إضافية مثل data-aos
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  onClick,
  ...rest
}) => {
  const variants = {
    default: 'bg-white shadow-xl border border-gray-100',
    outlined: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-2xl',
    gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-xl',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  return (
    <div
      className={`rounded-2xl ${variants[variant]} ${paddings[padding]} ${
        hover ? 'hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
      onClick={onClick}
      dir="rtl"
      {...rest}
    >
      {children}
    </div>
  );
};
