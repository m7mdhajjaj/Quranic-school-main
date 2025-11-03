/**
 * FooterBottom Component - القسم السفلي من الـ Footer
 */

import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import type { FooterBottomProps } from '../Types/types';

export const FooterBottom: React.FC<FooterBottomProps> = ({
  currentYear,
  foundingDate = '25/2/2024',
  showFoundingDate = true,
  className = '',
}) => {
  return (
    <div className={`pt-3 sm:pt-4 md:pt-6 border-t border-emerald-600/30 ${className}`}>
      <div className="flex flex-col lg:flex-row justify-between items-center gap-2 sm:gap-3 md:gap-4">
        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 lg:gap-3 text-emerald-100 text-xs sm:text-sm lg:text-base">
          <div className="flex items-center gap-1 sm:gap-2 text-center lg:text-right">
            <span>جميع الحقوق محفوظة © {currentYear}</span>
          </div>
          
          {/* Founding Date */}
          {showFoundingDate && (
            <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-0 lg:mr-4">
              <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-amber-400" />
              <span className="text-amber-200 font-medium text-xs sm:text-sm lg:text-base">
                تأسس في: {foundingDate}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Links */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm lg:text-base text-emerald-200">
          <a href="/privacy" className="hover:text-white transition-colors">
            سياسة الخصوصية
          </a>
          <span className="hidden sm:inline">•</span>
          <a href="/terms" className="hover:text-white transition-colors">
            الشروط والأحكام
          </a>
          <span className="hidden sm:inline">•</span>
          <a href="/contact" className="hover:text-white transition-colors">
            اتصل بنا
          </a>
        </div>
      </div>
    </div>
  );
};
