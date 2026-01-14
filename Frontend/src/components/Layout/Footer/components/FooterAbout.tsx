/**
 * FooterAbout Component - قسم معلومات المدرسة
 */

import React from 'react';
import type { FooterAboutProps } from '../Types/types';
import { SocialIcon } from './SocialIcon';

export const FooterAbout: React.FC<FooterAboutProps> = ({
  isAdmin,
  socialLinks,
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 sm:space-y-3 ${className}`}>
      {/* Header with Icon */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center animate-bounce-slow border border-white/30 shadow-sm">
          <span className="text-xl sm:text-2xl">
            {isAdmin ? '👑' : '🎓'}
          </span>
        </div>
        <div>
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white drop-shadow-lg">
            {isAdmin ? 'لوحة إدارة المدرسة' : 'مدرسة القرآن الكريم'}
          </h3>
          <p className="text-emerald-100 text-xs sm:text-sm font-medium">
            {isAdmin ? 'نظام إدارة شامل' : 'أكاديمية المهاجرين'}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
        {isAdmin
          ? 'إدارة شاملة ومتطورة لجميع جوانب المدرسة من طلاب ومعلمين ومجموعات وتقارير تفصيلية'
          : 'نسعى لتقديم تعليم قرآني متميز ورعاية طلابنا بأفضل الوسائل التعليمية الحديثة'}
      </p>

      {/* Social Links */}
      <div className="flex gap-2 sm:gap-2.5 pt-1">
        {socialLinks.map((social, index) => (
          <SocialIcon
            key={index}
            href={social.href}
            icon={social.icon}
            ariaLabel={social.ariaLabel}
          />
        ))}
      </div>
    </div>
  );
};
