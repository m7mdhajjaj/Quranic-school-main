import React from "react";
import { SkeletonBox } from "./SkeletonBox";
import type { SkeletonBoxProps } from "./SkeletonBox";

interface SkeletonButtonProps extends Omit<SkeletonBoxProps, 'variant' | 'height'> {
  /**
   * الحجم - small, medium, large
   */
  size?: "sm" | "md" | "lg";
  /**
   * ملء العرض بالكامل
   */
  fullWidth?: boolean;
}

/**
 * مكون لعرض أزرار Skeleton
 */
export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  size = "md",
  fullWidth = false,
  width,
  className = "",
  animation = "pulse",
}) => {
  const sizeConfig = {
    sm: { height: 36, defaultWidth: 80 },
    md: { height: 44, defaultWidth: 120 },
    lg: { height: 52, defaultWidth: 160 },
  }[size];

  return (
    <SkeletonBox
      variant="rounded"
      height={sizeConfig.height}
      width={fullWidth ? "100%" : width || sizeConfig.defaultWidth}
      className={className}
      animation={animation}
    />
  );
};
