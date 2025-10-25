import React from "react";
import { SkeletonBox } from "./SkeletonBox";
import type { SkeletonBoxProps } from "./SkeletonBox";

interface SkeletonAvatarProps extends Omit<SkeletonBoxProps, 'variant'> {
  /**
   * الحجم - small, medium, large
   */
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * مكون لعرض صور Avatar Skeleton
 */
export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = "md",
  className = "",
  animation = "pulse",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }[size];

  return (
    <SkeletonBox
      variant="circular"
      className={`${sizeClasses} ${className}`}
      animation={animation}
    />
  );
};
