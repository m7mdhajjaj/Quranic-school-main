/**
 * FooterQuickLinks Component - قسم الروابط السريعة
 */

import React from 'react';
import type { FooterQuickLinksProps } from '../Types/types';
import { FooterSection } from './FooterSection';

export const FooterQuickLinks: React.FC<FooterQuickLinksProps> = ({
  isAdmin,
  links,
  className = '',
}) => {
  return (
    <FooterSection
      title={isAdmin ? 'أدوات الإدارة' : 'روابط سريعة'}
      animated
      className={className}
    >
      <ul className="space-y-1.5 sm:space-y-2">
        {links.map((link, index) => (
          <li
            key={index}
            className={`animate-slide-in animation-delay-${index}`}
          >
            <a
              href={link.path}
              className="text-white/90 hover:text-white hover:pr-2 transition-all duration-300 flex items-center gap-2 group text-xs sm:text-sm font-medium"
            >
              {link.icon && isAdmin ? (
                <link.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-all text-emerald-100" />
              ) : (
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/80 rounded-full group-hover:w-2 sm:group-hover:w-2.5 transition-all"></span>
              )}
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </FooterSection>
  );
};
