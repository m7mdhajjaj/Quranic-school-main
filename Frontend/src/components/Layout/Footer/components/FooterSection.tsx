/**
 * FooterSection Component - قسم عام في الـ Footer
 */

import React from 'react';
import type { FooterSectionProps } from '../Types/types';

export const FooterSection: React.FC<FooterSectionProps> = ({
  title,
  children,
  animated = false,
  className = '',
}) => {
  return (
    <div className={`space-y-2 sm:space-y-2.5 ${className}`}>
      <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-2.5 flex items-center gap-2 text-white drop-shadow-md">
        <div
          className={`w-1 h-5 sm:h-6 bg-white/80 rounded-full ${
            animated ? 'animate-pulse' : ''
          }`}
        ></div>
        {title}
      </h4>
      {children}
    </div>
  );
};
