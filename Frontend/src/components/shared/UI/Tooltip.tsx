import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  className = '',
}) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-px',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-px',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-px',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-px',
  };

  const arrowBorders = {
    top: 'border-8 border-transparent border-t-white',
    bottom: 'border-8 border-transparent border-b-white',
    left: 'border-8 border-transparent border-l-white',
    right: 'border-8 border-transparent border-r-white',
  };

  return (
    <div className={`relative group/tooltip ${className}`}>
      {children}
      
      {/* Tooltip Content */}
      <div className={`absolute ${positions[position]} w-56 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50`}>
        <div className="bg-white border-2 border-emerald-300 rounded-xl shadow-2xl p-4 backdrop-blur-xl">
          {/* Arrow */}
          <div className={`absolute ${arrows[position]}`}>
            <div className={arrowBorders[position]}></div>
          </div>

          {/* Content */}
          {content}
        </div>
      </div>
    </div>
  );
};
