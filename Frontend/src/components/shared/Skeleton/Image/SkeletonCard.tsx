import React from "react";
import { SkeletonBox, SkeletonText } from "../Base";

interface SkeletonCardProps {
  /**
   * عرض الصورة في البطاقة
   */
  showImage?: boolean;
  /**
   * عدد الأسطر في المحتوى
   */
  contentLines?: number;
  /**
   * عرض الأزرار
   */
  showButtons?: boolean;
  /**
   * عدد الأزرار
   */
  buttonsCount?: number;
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
 * مكون SkeletonCard لعرض بطاقات تحميل
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showImage = true,
  contentLines = 3,
  showButtons = true,
  buttonsCount = 2,
  className = "",
  animation = "pulse",
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* الصورة */}
      {showImage && (
        <div className="mb-4">
          <SkeletonBox variant="rounded" height={200} animation={animation} />
        </div>
      )}

      {/* العنوان */}
      <div className="mb-3">
        <SkeletonBox variant="text" height={24} width="70%" animation={animation} />
      </div>

      {/* المحتوى */}
      <SkeletonText lines={contentLines} animation={animation} />

      {/* الأزرار */}
      {showButtons && (
        <div className="flex gap-3 mt-4">
          {Array.from({ length: buttonsCount }).map((_, index) => (
            <SkeletonBox 
              key={index}
              variant="rounded" 
              height={40} 
              width={100} 
              animation={animation} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
