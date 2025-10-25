/**
 * FooterSection Component - قسم عام في الـ Footer
 */

import React from 'react';
import type { FooterSectionProps } from './types';

export const FooterSection: React.FC<FooterSectionProps> = ({
  title,
  children,
  animated = false,
  className = '',
}) => {
  return (
    <div className={`space-y-2 sm:space-y-3 lg:space-y-4 ${className}`}>
      <h4 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
        <div
          className={`w-1 h-5 sm:h-6 lg:h-7 bg-emerald-300 rounded-full ${
            animated ? 'animate-pulse' : ''
          }`}
        ></div>
        {title}
      </h4>
      {children}
    </div>
  );
};
