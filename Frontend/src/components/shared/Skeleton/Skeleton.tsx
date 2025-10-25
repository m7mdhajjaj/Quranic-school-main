import React from "react";

interface SkeletonProps {
  /**
   * عدد الأسطر المراد عرضها
   */
  lines?: number;
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
 * مكون Skeleton قابل لإعادة الاستخدام لعرض حالات التحميل
 */
const Skeleton: React.FC<SkeletonProps> = ({
  lines = 1,
  variant = "text",
  width,
  height,
  className = "",
  animation = "pulse",
}) => {
  // تحديد الفئات الأساسية بناءً على النوع
  const getVariantClasses = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "rectangular":
        return "rounded-none";
      case "rounded":
        return "rounded-xl";
      case "text":
      default:
        return "rounded-lg";
    }
  };

  // تحديد الحركة
  const getAnimationClasses = () => {
    switch (animation) {
      case "pulse":
        return "animate-pulse";
      case "wave":
        return "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";
      case "none":
      default:
        return "";
    }
  };

  // تحويل القيم إلى CSS
  const getStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    
    if (width !== undefined) {
      style.width = typeof width === "number" ? `${width}px` : width;
    }
    
    if (height !== undefined) {
      style.height = typeof height === "number" ? `${height}px` : height;
    }
    
    return style;
  };

  // تحديد الارتفاع الافتراضي بناءً على النوع
  const getDefaultHeight = () => {
    if (height) return "";
    
    switch (variant) {
      case "circular":
        return "h-12 w-12";
      case "rectangular":
      case "rounded":
        return "h-32";
      case "text":
      default:
        return "h-4";
    }
  };

  // عرض عدة أسطر
  if (lines > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`bg-gray-200 ${getVariantClasses()} ${getAnimationClasses()} ${getDefaultHeight()}`}
            style={{
              ...getStyle(),
              width: index === lines - 1 ? "80%" : getStyle().width || "100%",
            }}
          />
        ))}
      </div>
    );
  }

  // عرض سطر واحد
  return (
    <div
      className={`bg-gray-200 ${getVariantClasses()} ${getAnimationClasses()} ${getDefaultHeight()} ${className}`}
      style={getStyle()}
    />
  );
};

export default Skeleton;
