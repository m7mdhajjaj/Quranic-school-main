import React from "react";
import Skeleton from "./Skeleton";

interface SkeletonListProps {
  /**
   * عدد العناصر في القائمة
   */
  items?: number;
  /**
   * عرض الصورة الرمزية
   */
  showAvatar?: boolean;
  /**
   * عرض الأيقونة
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
 * مكون SkeletonList لعرض قوائم تحميل
 */
const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  showAvatar = true,
  showIcon = false,
  className = "",
  animation = "pulse",
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg divide-y divide-gray-100 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="p-4 flex items-center gap-4">
          {/* الصورة الرمزية */}
          {showAvatar && (
            <Skeleton variant="circular" width={48} height={48} animation={animation} />
          )}

          {/* المحتوى */}
          <div className="flex-1 space-y-2">
            <Skeleton height={20} width="60%" animation={animation} />
            <Skeleton height={16} width="40%" animation={animation} />
          </div>

          {/* الأيقونة */}
          {showIcon && (
            <Skeleton variant="circular" width={32} height={32} animation={animation} />
          )}
        </div>
      ))}
    </div>
  );
};

export default SkeletonList;
