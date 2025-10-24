/**
 * Tailwind CSS Classes المشتركة والمستخدمة بكثرة
 * لتجنب التكرار وتوحيد الأنماط
 */

/**
 * أنماط الـ Input Fields
 */
export const INPUT_STYLES = {
  base: 'w-full px-4 py-2.5 border-2 rounded-lg transition-all focus:ring-2 focus:outline-none',
  normal: 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-200',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-200',
  disabled: 'opacity-50 cursor-not-allowed bg-gray-50',
} as const;

/**
 * أنماط الأزرار
 */
export const BUTTON_STYLES = {
  base: 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
  primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl focus:ring-emerald-400',
  secondary: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg focus:ring-red-400',
} as const;

/**
 * أنماط الكروت
 */
export const CARD_STYLES = {
  base: 'rounded-2xl',
  default: 'bg-white shadow-xl border border-gray-100',
  hover: 'hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]',
  gradient: 'bg-gradient-to-br from-white to-gray-50',
} as const;

/**
 * أنماط الـ Modal/Dialog
 */
export const MODAL_STYLES = {
  overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4',
  container: 'bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn',
  header: 'flex items-center justify-between p-6 border-b border-gray-200',
  body: 'p-6',
  footer: 'p-6 border-t border-gray-200',
} as const;

/**
 * أنماط الـ Badge/Tag
 */
export const BADGE_STYLES = {
  base: 'inline-flex items-center gap-1 font-medium border rounded-full px-3 py-1 text-sm',
  primary: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
} as const;

/**
 * دمج classes مع إزالة المكررات
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
