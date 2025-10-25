import React from "react";
import { SkeletonBox } from "./SkeletonBox";
import type { SkeletonBoxProps } from "./SkeletonBox";

interface SkeletonTextProps extends Omit<SkeletonBoxProps, 'variant'> {
  /**
   * عدد الأسطر المراد عرضها
   */
  lines?: number;
}

/**
 * مكون لعرض نصوص Skeleton متعددة الأسطر
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  width,
  height = 16,
  className = "",
  animation = "pulse",
}) => {
  if (lines === 1) {
    return (
      <SkeletonBox
        variant="text"
        width={width}
        height={height}
        className={className}
        animation={animation}
      />
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBox
          key={index}
          variant="text"
          height={height}
          width={index === lines - 1 ? "80%" : width || "100%"}
          animation={animation}
        />
      ))}
    </div>
  );
};
