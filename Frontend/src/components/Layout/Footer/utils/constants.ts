/**
 * Footer Constants - القيم الثابتة للـ Footer
 */

import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaChartBar,
  FaCog,
  FaUser,
} from 'react-icons/fa';
import type { Partner, QuickLink, SocialLink } from '../Types/types';

/**
 * معلومات فريق العمل
 */
export const DEFAULT_PARTNERS: Partner[] = [
  {
    name: 'محمد حجاج',
    role: 'مطور ومصمم',
    phone: '+972599309747',
    email: 'mohd.hajjaj80@gmail.com',
    whatsapp: '972599309747',
  },
  {
    name: 'قصي دويكات',
    role: 'مطور ومصمم',
    phone: '+970599185961',
    email: 'qsay.3w@gmail.com',
    whatsapp: '970599185961',
  },
];

/**
 * روابط التواصل الاجتماعي
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61564605862440',
    icon: FaFacebook,
    ariaLabel: 'Facebook',
  },
  {
    name: 'Twitter',
    href: '#',
    icon: FaTwitter,
    ariaLabel: 'Twitter',
  },
  {
    name: 'Instagram',
    href: '#',
    icon: FaInstagram,
    ariaLabel: 'Instagram',
  },
];

/**
 * الروابط السريعة للمدير
 */
export const ADMIN_QUICK_LINKS: QuickLink[] = [
  { name: 'لوحة التحكم', path: '/admin/dashboard', icon: FaChartBar },
  { name: 'الملف الشخصي', path: '/profile', icon: FaUser },
  { name: 'الإعدادات', path: '/admin/settings', icon: FaCog },
  { name: 'تواصل معنا', path: '/contact' },
];

/**
 * الروابط السريعة للسكرتير
 */
export const SECRETARY_QUICK_LINKS: QuickLink[] = [
  { name: 'الرئيسية', path: '/' },
  { name: 'الطلاب', path: '/students' },
  { name: 'المعلمين', path: '/teachers' },
  { name: 'الأهداف', path: '/goals' },
  { name: 'المحادثة', path: '/chat' },
  { name: 'الملف الشخصي', path: '/profile', icon: FaUser },
  { name: 'تواصل معنا', path: '/contact' },
];

/**
 * الروابط السريعة للمستخدمين العاديين
 */
export const DEFAULT_QUICK_LINKS: QuickLink[] = [
  { name: 'الرئيسية', path: '/' },
  { name: 'الأخبار', path: '/news' },
  { name: 'الأهداف', path: '/goals' },
  { name: 'التقارير', path: '/reports' },
  { name: 'تواصل معنا', path: '/contact' },
];

/**
 * الروابط السريعة للضيوف (غير مسجلين)
 */
export const GUEST_QUICK_LINKS: QuickLink[] = [
  { name: 'الرئيسية', path: '/home' },
  { name: 'نبذة عنا', path: '/about' },
  { name: 'الأهداف', path: '/goals' },
  { name: 'تواصل معنا', path: '/contact' },
  { name: 'سياسة الخصوصية', path: '/privacy' },
  { name: 'تسجيل الدخول', path: '/login' },
];

/**
 * تاريخ تأسيس المدرسة
 */
export const FOUNDING_DATE = '25/2/2024';
