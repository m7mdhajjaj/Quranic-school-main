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
