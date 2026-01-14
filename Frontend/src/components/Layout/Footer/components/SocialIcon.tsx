/**
 * SocialIcon Component - زر وسائل التواصل الاجتماعي
 */

import React from 'react';
import type { SocialIconProps } from '../Types/types';

export const SocialIcon: React.FC<SocialIconProps> = ({
  href,
  icon: Icon,
  ariaLabel,
  className = '',
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12
        bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30
        rounded-lg flex items-center justify-center shadow-sm hover:shadow-md
        transition-all duration-300 hover:scale-110 hover:rotate-12
        ${className}
      `}
      aria-label={ariaLabel}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
    </a>
  );
};
