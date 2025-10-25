import React from "react";
import { SkeletonBox } from "../Base";

interface SkeletonImageProps {
  /**
   * نسبة العرض إلى الارتفاع
   */
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
  /**
   * العرض المخصص
   */
  width?: number | string;
  /**
   * الارتفاع المخصص
   */
  height?: number | string;
  /**
   * عرض أيقونة الصورة
   */
  showIcon?: boolean;
  /**
   * فئات CSS إضافية
   */
  className?: string;
  /**
   * نوع الحركة
   */
  animation?: "pulse" | "wave" | "none";
}

/**
 * مكون لعرض صور Skeleton
 */
export const SkeletonImage: React.FC<SkeletonImageProps> = ({
  aspectRatio = "video",
  width = "100%",
  height,
  showIcon = true,
  className = "",
  animation = "pulse",
}) => {
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
  }[aspectRatio];

  const finalHeight = height || (aspectRatio ? "" : 200);

  return (
    <div className={`relative ${aspectRatioClasses} ${className}`}>
      <SkeletonBox
        variant="rounded"
        width={width}
        height={finalHeight}
        animation={animation}
        className="w-full h-full"
      />
      {showIcon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
