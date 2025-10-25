import React from "react";
import Skeleton from "./Skeleton";

interface SkeletonFormProps {
  /**
   * عدد حقول الإدخال
   */
  fields?: number;
  /**
   * عرض الأزرار
   */
  showButtons?: boolean;
  /**
   * عرض عنوان النموذج
   */
  showTitle?: boolean;
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
 * مكون SkeletonForm لعرض نماذج تحميل
 */
const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 4,
  showButtons = true,
  showTitle = true,
  className = "",
  animation = "pulse",
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* العنوان */}
      {showTitle && (
        <div className="mb-6">
          <Skeleton height={32} width="40%" animation={animation} />
        </div>
      )}

      {/* الحقول */}
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index}>
            {/* التسمية */}
            <div className="mb-2">
              <Skeleton height={16} width="30%" animation={animation} />
            </div>
            {/* حقل الإدخال */}
            <Skeleton variant="rounded" height={44} animation={animation} />
          </div>
        ))}
      </div>

      {/* الأزرار */}
      {showButtons && (
        <div className="flex gap-3 mt-6">
          <Skeleton variant="rounded" height={44} width={120} animation={animation} />
          <Skeleton variant="rounded" height={44} width={120} animation={animation} />
        </div>
      )}
    </div>
  );
};

export default SkeletonForm;
