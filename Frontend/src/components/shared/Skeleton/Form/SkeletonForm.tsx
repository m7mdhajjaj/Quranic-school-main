import React from "react";
import { SkeletonBox, SkeletonButton } from "../Base";

interface SkeletonInputFieldProps {
  /**
   * عرض التسمية
   */
  showLabel?: boolean;
  /**
   * عرض رسالة الخطأ
   */
  showError?: boolean;
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
 * مكون لعرض حقل إدخال Skeleton
 */
export const SkeletonInputField: React.FC<SkeletonInputFieldProps> = ({
  showLabel = true,
  showError = false,
  className = "",
  animation = "pulse",
}) => {
  return (
    <div className={className}>
      {/* التسمية */}
      {showLabel && (
        <div className="mb-2">
          <SkeletonBox height={16} width="30%" animation={animation} />
        </div>
      )}
      {/* حقل الإدخال */}
      <SkeletonBox variant="rounded" height={44} animation={animation} />
      {/* رسالة الخطأ */}
      {showError && (
        <div className="mt-1">
          <SkeletonBox height={12} width="50%" animation={animation} />
        </div>
      )}
    </div>
  );
};

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
   * عدد الأزرار
   */
  buttonsCount?: number;
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
export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 4,
  showButtons = true,
  buttonsCount = 2,
  showTitle = true,
  className = "",
  animation = "pulse",
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* العنوان */}
      {showTitle && (
        <div className="mb-6">
          <SkeletonBox height={32} width="40%" animation={animation} />
        </div>
      )}

      {/* الحقول */}
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, index) => (
          <SkeletonInputField key={index} animation={animation} />
        ))}
      </div>

      {/* الأزرار */}
      {showButtons && (
        <div className="flex gap-3 mt-6">
          {Array.from({ length: buttonsCount }).map((_, index) => (
            <SkeletonButton key={index} animation={animation} />
          ))}
        </div>
      )}
    </div>
  );
};
