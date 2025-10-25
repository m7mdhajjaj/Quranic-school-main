import React from "react";
import { SkeletonBox, SkeletonText } from "../Base";

interface SkeletonListItemProps {
  /**
   * عرض الأيقونة/الصورة
   */
  showIcon?: boolean;
  /**
   * عدد الأسطر في المحتوى
   */
  contentLines?: number;
  /**
   * عرض الأزرار الجانبية
   */
  showActions?: boolean;
  /**
   * نوع الحركة
   */
  animation?: "pulse" | "wave" | "none";
}

export const SkeletonListItem: React.FC<SkeletonListItemProps> = ({
  showIcon = true,
  contentLines = 2,
  showActions = false,
  animation = "pulse",
}) => {
  return (
    <div className="flex items-center gap-4 p-4">
      {showIcon && <SkeletonBox variant="circular" width={48} height={48} animation={animation} />}
      <div className="flex-1">
        <SkeletonText lines={contentLines} animation={animation} />
      </div>
      {showActions && (
        <div className="flex gap-2">
          <SkeletonBox variant="circular" width={32} height={32} animation={animation} />
          <SkeletonBox variant="circular" width={32} height={32} animation={animation} />
        </div>
      )}
    </div>
  );
};

interface SkeletonListProps {
  /**
   * عدد العناصر
   */
  items?: number;
  /**
   * عرض الأيقونة/الصورة
   */
  showIcon?: boolean;
  /**
   * عدد الأسطر في كل عنصر
   */
  contentLines?: number;
  /**
   * عرض الأزرار الجانبية
   */
  showActions?: boolean;
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
export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  showIcon = true,
  contentLines = 2,
  showActions = false,
  className = "",
  animation = "pulse",
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg divide-y divide-gray-100 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonListItem
          key={index}
          showIcon={showIcon}
          contentLines={contentLines}
          showActions={showActions}
          animation={animation}
        />
      ))}
    </div>
  );
};
