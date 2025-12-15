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
    <div className={`pt-3 sm:pt-3.5 border-t border-white/20 ${className}`}>
      <div className="flex flex-col lg:flex-row justify-between items-center gap-2 sm:gap-2.5">
        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-white/90 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-center lg:text-right">
            <span>جميع الحقوق محفوظة © {currentYear}</span>
          </div>
          
          {/* Founding Date */}
          {showFoundingDate && (
            <div className="flex items-center gap-1.5 sm:gap-2 sm:mr-3">
              <FaCalendarAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-100" />
              <span className="text-emerald-100 font-medium text-xs sm:text-sm">
                تأسس في: {foundingDate}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Links */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-white/90">
          <a href="/privacy" className="hover:text-white transition-colors font-medium">
            سياسة الخصوصية
          </a>
          <span className="hidden sm:inline text-white/50">•</span>
          <a href="/terms" className="hover:text-white transition-colors font-medium">
            الشروط والأحكام
          </a>
          <span className="hidden sm:inline text-white/50">•</span>
          <a href="/contact" className="hover:text-white transition-colors font-medium">
            اتصل بنا
          </a>
        </div>
      </div>
    </div>
  );
};
