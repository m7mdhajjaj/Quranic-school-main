/**
 * Chart Utility Functions - React Native
 * دوال مساعدة للـ Charts في React Native
 */

import { Dimensions } from "react-native";

/**
 * التحقق من حجم الشاشة الصغير
 */
export const isSmallScreen = (): boolean => {
  const { width } = Dimensions.get("window");
  return width < 640;
};

/**
 * الحصول على قيمة responsive بناءً على حجم الشاشة
 */
export const getResponsiveValue = <T>(mobileValue: T, desktopValue: T): T => {
  return isSmallScreen() ? mobileValue : desktopValue;
};

/**
 * الحصول على جميع الأحجام الـ responsive للـ Chart
 */
export const getChartSizes = () => {
  const { width } = Dimensions.get("window");

  return {
    // Bar sizes
    barThickness: width < 640 ? 40 : 50,
    maxBarThickness: width < 640 ? 50 : 60,

    // Font sizes
    titleFontSize: width < 640 ? 14 : 16,
    yTicksFontSize: width < 640 ? 9 : 11,
    xTicksFontSize: width < 640 ? 10 : 12,

    // Visibility
    showYAxisTitle: width >= 640,

    // Container heights
    containerHeight: width < 640 ? 250 : width < 768 ? 300 : 350,
  };
};

/**
 * تنسيق قيمة المعدل للعرض
 */
export const formatMarkValue = (value: number | null | undefined): string => {
  return value ? value.toFixed(1) : "0";
};

/**
 * الحصول على لون البار حسب المعدل
 */
export const getBarColor = (value: number): { bg: string; border: string } => {
  if (value >= 90) {
    return { bg: "#10b981", border: "#059669" }; // Emerald - ممتاز
  } else if (value >= 75) {
    return { bg: "#3b82f6", border: "#2563eb" }; // Blue - جيد جداً
  } else if (value >= 60) {
    return { bg: "#f59e0b", border: "#d97706" }; // Amber - جيد
  } else if (value >= 50) {
    return { bg: "#f97316", border: "#ea580c" }; // Orange - مقبول
  } else {
    return { bg: "#ef4444", border: "#dc2626" }; // Red - ضعيف
  }
};

/**
 * حساب أقصى قيمة للمحور Y
 */
export const calculateYAxisMax = (data: number[]): number => {
  const maxValue = Math.max(...data);
  return Math.ceil(maxValue / 10) * 10 + 10;
};
