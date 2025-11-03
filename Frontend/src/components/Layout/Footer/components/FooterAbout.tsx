/**
 * FooterAbout Component - قسم معلومات المدرسة
 */

import React from 'react';
import type { FooterAboutProps } from '../Types/types';
import { SocialIcon } from '../UI/SocialIcon';

export const FooterAbout: React.FC<FooterAboutProps> = ({
  isAdmin,
  socialLinks,
  className = '',
}) => {
  return (
    <div className={`space-y-2 sm:space-y-3 lg:space-y-4 ${className}`}>
      {/* Header with Icon */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center animate-bounce-slow">
          <span className="text-xl sm:text-2xl lg:text-3xl">
            {isAdmin ? '👑' : '🎓'}
          </span>
        </div>
        <div>
          <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">
            {isAdmin ? 'لوحة إدارة المدرسة' : 'مدرسة القرآن الكريم'}
          </h3>
          <p className="text-emerald-200 text-xs sm:text-sm lg:text-base">
            {isAdmin ? 'نظام إدارة شامل' : 'أكاديمية المهاجرين'}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-emerald-100 text-xs sm:text-sm lg:text-base xl:text-lg leading-relaxed">
        {isAdmin
          ? 'إدارة شاملة ومتطورة لجميع جوانب المدرسة من طلاب ومعلمين ومجموعات وتقارير تفصيلية'
          : 'نسعى لتقديم تعليم قرآني متميز ورعاية طلابنا بأفضل الوسائل التعليمية الحديثة'}
      </p>

      {/* Social Links */}
      <div className="flex gap-2 sm:gap-3 lg:gap-4">
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
