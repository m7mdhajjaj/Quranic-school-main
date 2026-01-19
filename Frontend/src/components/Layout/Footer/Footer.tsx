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
  SECRETARY_QUICK_LINKS,
  TEACHER_ASSISTANT_QUICK_LINKS,
  DEFAULT_QUICK_LINKS,
  GUEST_QUICK_LINKS,
  FOUNDING_DATE,
} from './utils';

export const Footer: React.FC<FooterProps> = ({
  className = '',
  showPartners = true,
  customPartners,
  customLinks,
  foundingDate = FOUNDING_DATE,
  showFoundingDate = true,
  isGuest = false,
}) => {
  const currentYear = new Date().getFullYear();
  
  // Get auth info only if not explicitly guest
  const auth = useAuth();
  const isAdminUser = !isGuest && auth?.isAdmin ? auth.isAdmin() : false;
  const isSecretaryUser = !isGuest && auth?.user?.role === 'secretary';
  const isTeacherAssistantUser = !isGuest && auth?.user?.role === 'teacherAssistant';
  const isLoggedIn = !isGuest && auth?.isAuthenticated ? auth.isAuthenticated : false;

  // Determine which links to use based on user role
  let quickLinks;
  if (customLinks) {
    quickLinks = customLinks;
  } else if (isGuest || !isLoggedIn) {
    // Guest user (not logged in)
    quickLinks = GUEST_QUICK_LINKS;
  } else if (isAdminUser) {
    // Admin user
    quickLinks = ADMIN_QUICK_LINKS;
  } else if (isSecretaryUser) {
    // Secretary user
    quickLinks = SECRETARY_QUICK_LINKS;
  } else if (isTeacherAssistantUser) {
    // Teacher Assistant user
    quickLinks = TEACHER_ASSISTANT_QUICK_LINKS;
  } else {
    // Regular user (teacher/student)
    quickLinks = DEFAULT_QUICK_LINKS;
  }

  // Determine which partners to use
  const partners = customPartners || DEFAULT_PARTNERS;

  return (
    <footer
      className={`relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 shadow-xl backdrop-blur-xl border-t border-white/20 overflow-hidden m-0 ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 footer-background-pattern"></div>
      </div>

      <div
        className="relative w-full max-w-none px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6"
        dir="rtl"
      >
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-3 sm:mb-4">
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
