import React from "react";
import Skeleton from "./Skeleton";

interface SkeletonCardProps {
  /**
   * عدد البطاقات المراد عرضها
   */
  count?: number;
  /**
   * عرض الصورة في البطاقة
   */
  showImage?: boolean;
  /**
   * عدد الأسطر في المحتوى
   */
  contentLines?: number;
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
const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 1,
  showImage = true,
  contentLines = 3,
  className = "",
  animation = "pulse",
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}
        >
          {/* الصورة أو الأيقونة */}
          {showImage && (
            <div className="mb-4">
              <Skeleton variant="rounded" height={200} animation={animation} />
            </div>
          )}

          {/* العنوان */}
          <div className="mb-3">
            <Skeleton variant="text" height={24} width="70%" animation={animation} />
          </div>

          {/* المحتوى */}
          <div className="space-y-2">
            <Skeleton lines={contentLines} animation={animation} />
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 mt-4">
            <Skeleton variant="rounded" height={40} width={100} animation={animation} />
            <Skeleton variant="rounded" height={40} width={100} animation={animation} />
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonCard;
