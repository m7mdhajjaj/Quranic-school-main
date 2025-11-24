/**
 * Footer Page - صفحة Footer كاملة ومتكاملة
 * هذه صفحة كاملة وليست مكون قابل لإعادة الاستخدام
 * 
 * @page FooterPage
 * @description صفحة Footer شاملة تحتوي على جميع أقسام الموقع السفلية
 * 
 * @features
 * - معلومات المدرسة والتواصل الاجتماعي
 * - روابط سريعة للصفحات المهمة
 * - معلومات فريق العمل وطرق التواصل
 * - حقوق النشر وتاريخ التأسيس
 * 
 * @usage
 * // استخدام الصفحة كاملة
 * <Footer />
 * 
 * // مع تخصيص بسيط للبيانات
 * <Footer customPartners={myPartners} />
 */

import React from 'react';
import { useAuth } from "@/hooks/useAuth";
import type { FooterProps } from './Types/types';
import {
  FooterAbout,
  FooterQuickLinks,
  FooterPartners,
  FooterBottom,
} from './components';
import {
  DEFAULT_PARTNERS,
  SOCIAL_LINKS,
  ADMIN_QUICK_LINKS,
  DEFAULT_QUICK_LINKS,
  FOUNDING_DATE,
} from './utils';

export const Footer: React.FC<FooterProps> = ({
  className = '',
  showPartners = true,
  customPartners,
  customLinks,
  foundingDate = FOUNDING_DATE,
  showFoundingDate = true,
}) => {
  const { isAdmin } = useAuth();
  const currentYear = new Date().getFullYear();
  const isAdminUser = isAdmin();

  // Determine which links to use
  const quickLinks =
    customLinks || (isAdminUser ? ADMIN_QUICK_LINKS : DEFAULT_QUICK_LINKS);

  // Determine which partners to use
  const partners = customPartners || DEFAULT_PARTNERS;

  return (
    <footer
      className={`relative bg-gradient-to-br from-emerald-700 via-teal-700 to-green-800 text-white overflow-hidden mt-auto min-h-[700px] ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 footer-background-pattern"></div>
      </div>

      <div
        className="relative w-full max-w-none px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8"
        dir="rtl"
      >
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* About Section */}
          <FooterAbout isAdmin={isAdminUser} socialLinks={SOCIAL_LINKS} />

          {/* Quick Links */}
          <FooterQuickLinks isAdmin={isAdminUser} links={quickLinks} />

          {/* Partners Section */}
          {showPartners && (
            <FooterPartners
              partners={partners}
              className="sm:col-span-2 lg:col-span-2"
            />
          )}
        </div>

        {/* Bottom Section */}
        <FooterBottom
          currentYear={currentYear}
          foundingDate={foundingDate}
          showFoundingDate={showFoundingDate}
        />
      </div>
    </footer>
  );
};

export default Footer;
