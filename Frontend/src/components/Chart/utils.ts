/**
 * Chart Utility Functions
 * دوال مساعدة للـ Charts (responsive values, calculations, etc.)
 */

/**
 * التحقق من حجم الشاشة الصغير
 */
export const isSmallScreen = (): boolean => {
  return typeof window !== 'undefined' && window.innerWidth < 640;
};

/**
 * الحصول على قيمة responsive بناءً على حجم الشاشة
 */
export const getResponsiveValue = <T>(
  mobileValue: T,
  desktopValue: T
): T => {
  return isSmallScreen() ? mobileValue : desktopValue;
};

/**
 * الحصول على جميع الأحجام الـ responsive للـ Chart
 */
export const getChartSizes = () => ({
  // Bar sizes
  barThickness: getResponsiveValue(40, 50),
  maxBarThickness: getResponsiveValue(50, 60),
  
  // Font sizes
  titleFontSize: getResponsiveValue(14, 16),
  yTicksFontSize: getResponsiveValue(9, 11),
  xTicksFontSize: getResponsiveValue(10, 12),
  
  // Visibility
  showYAxisTitle: !isSmallScreen(),
  
  // Container heights (as CSS classes)
  containerHeight: 'h-[250px] sm:h-[300px] md:h-[350px]',
});

/**
 * تنسيق قيمة المعدل للعرض
 */
export const formatMarkValue = (value: number | null | undefined): string => {
  return value ? value.toFixed(1) : '0';
};

/**
 * الحصول على لون البار حسب المعدل
 */
export const getBarColor = (value: number): { bg: string; border: string } => {
  if (value >= 90) {
    return { bg: '#10b981', border: '#059669' }; // Emerald - ممتاز
  } else if (value >= 75) {
    return { bg: '#3b82f6', border: '#2563eb' }; // Blue - جيد جداً
  } else if (value >= 60) {
    return { bg: '#f59e0b', border: '#d97706' }; // Amber - جيد
  } else if (value >= 50) {
    return { bg: '#f97316', border: '#ea580c' }; // Orange - مقبول
  } else {
    return { bg: '#ef4444', border: '#dc2626' }; // Red - ضعيف
  }
};
