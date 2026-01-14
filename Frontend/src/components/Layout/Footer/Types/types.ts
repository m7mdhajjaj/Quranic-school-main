/**
 * Footer Types - أنواع مكونات الـ Footer
 * @module Footer/Types
 */

import type { IconType } from 'react-icons';

/**
 * Partner/Developer Information
 */
export interface Partner {
  name: string;
  role: string;
  phone: string;
  email: string;
  whatsapp: string;
  avatar?: string;
}

/**
 * Quick Link Item
 */
export interface QuickLink {
  name: string;
  path: string;
  icon?: IconType;
}

/**
 * Social Media Link
 */
export interface SocialLink {
  name: string;
  href: string;
  icon: IconType;
  ariaLabel: string;
}

/**
 * Footer Section Props
 */
export interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
  animated?: boolean;
  className?: string;
}

/**
 * Footer About Section Props
 */
export interface FooterAboutProps {
  isAdmin: boolean;
  socialLinks: SocialLink[];
  className?: string;
}

/**
 * Footer Quick Links Section Props
 */
export interface FooterQuickLinksProps {
  isAdmin: boolean;
  links: QuickLink[];
  className?: string;
}

/**
 * Footer Partners Section Props
 */
export interface FooterPartnersProps {
  partners: Partner[];
  className?: string;
}

/**
 * Partner Card Props
 */
export interface PartnerCardProps {
  partner: Partner;
  index: number;
}

/**
 * Footer Bottom Section Props
 */
export interface FooterBottomProps {
  currentYear: number;
  foundingDate?: string;
  showFoundingDate?: boolean;
  className?: string;
}

/**
 * Social Icon Button Props
 */
export interface SocialIconProps {
  href: string;
  icon: IconType;
  ariaLabel: string;
  className?: string;
}

/**
 * Main Footer Component Props
 */
export interface FooterProps {
  className?: string;
  showPartners?: boolean;
  customPartners?: Partner[];
  customLinks?: QuickLink[];
  foundingDate?: string;
  showFoundingDate?: boolean;
  /** إذا كان المستخدم ضيف (غير مسجل) */
  isGuest?: boolean;
}
