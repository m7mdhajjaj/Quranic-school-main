/**
 * ==========================================
 * Navigation Utility Functions
 * ==========================================
 * دوال مساعدة مشتركة للتنقل في الـ Header
 */

/**
 * التحقق من أن المسار نشط
 * @param itemPath - مسار العنصر
 * @param currentPath - المسار الحالي
 * @returns true إذا كان المسار نشط
 */
export const checkIsActive = (itemPath: string, currentPath: string): boolean => {
  // الصفحة الرئيسية تكون نشطة فقط عندما نكون في المسار الدقيق "/"
  if (itemPath === '/') {
    return currentPath === '/';
  }

  // باقي الصفحات تكون نشطة إذا كان المسار الحالي يبدأ بمسار العنصر
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
};

/**
 * التحقق من وجود عنصر فرعي نشط
 * @param subItems - العناصر الفرعية
 * @param currentPath - المسار الحالي
 * @returns true إذا كان أحد العناصر الفرعية نشط
 */
export const hasActiveSubItem = (
  subItems: Array<{ to: string }> | undefined,
  currentPath: string
): boolean => {
  if (!subItems || subItems.length === 0) return false;
  return subItems.some((subItem) => checkIsActive(subItem.to, currentPath));
};

/**
 * إغلاق القوائم المنسدلة عند النقر خارجها
 * @param ref - مرجع العنصر
 * @param callback - دالة الإغلاق
 */
export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) => {
  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      callback();
    }
  };

  return handleClickOutside;
};

/**
 * إغلاق القوائم عند الضغط على ESC
 * @param callback - دالة الإغلاق
 */
export const useEscapeKey = (callback: () => void) => {
  const handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      callback();
    }
  };

  return handleEscKey;
};

/**
 * دمج العناصر الرئيسية والثانوية
 * @param primaryItems - العناصر الرئيسية
 * @param secondaryItems - العناصر الثانوية
 * @returns جميع العناصر مدمجة
 */
export const mergeNavigationItems = <T,>(primaryItems: T[], secondaryItems: T[] = []): T[] => {
  return [...primaryItems, ...secondaryItems];
};
