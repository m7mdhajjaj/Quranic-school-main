import React from "react";

export interface SkeletonBoxProps {
  /**
   * الشكل - دائري أو مربع
   */
  variant?: "text" | "circular" | "rectangular" | "rounded";
  /**
   * العرض - يمكن أن يكون رقم (بكسل) أو نص (مثل '100%')
   */
  width?: number | string;
  /**
   * الارتفاع - يمكن أن يكون رقم (بكسل) أو نص (مثل '100px')
   */
  height?: number | string;
  /**
   * فئات CSS إضافية
   */
  className?: string;
  /**
   * سرعة الحركة - سريع أو بطيء
   */
  animation?: "pulse" | "wave" | "none";
}

/**
 * المكون الأساسي لجميع Skeletons - مكون واحد قابل لإعادة الاستخدام
 */
export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  variant = "text",
  width,
  height,
  className = "",
  animation = "pulse",
}) => {
  // تحديد الفئات الأساسية بناءً على النوع
  const variantClasses = {
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
    text: "rounded-lg",
  }[variant];

  // تحديد الحركة
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
    none: "",
  }[animation];

  // تحديد الارتفاع الافتراضي بناءً على النوع
  const defaultHeight = !height
    ? {
        circular: "h-12 w-12",
        rectangular: "h-32",
        rounded: "h-32",
        text: "h-4",
      }[variant]
    : "";

  // تحويل القيم إلى CSS
  const style: React.CSSProperties = {};
  if (width !== undefined) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      className={`bg-gray-200 ${variantClasses} ${animationClasses} ${defaultHeight} ${className}`}
      style={style}
    />
  );
};
