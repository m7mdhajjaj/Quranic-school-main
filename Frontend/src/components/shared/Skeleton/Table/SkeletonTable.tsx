import React from "react";
import { SkeletonBox } from "../Base";

interface SkeletonTableProps {
  /**
   * عدد الصفوف
   */
  rows?: number;
  /**
   * عدد الأعمدة
   */
  columns?: number;
  /**
   * عرض الرأس
   */
  showHeader?: boolean;
  /**
   * عرض الإجراءات (Actions column)
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
 * مكون SkeletonTable لعرض جداول تحميل
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  showActions = false,
  className = "",
  animation = "pulse",
}) => {
  const totalColumns = showActions ? columns + 1 : columns;

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* رأس الجدول */}
          {showHeader && (
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: totalColumns }).map((_, index) => (
                  <th key={index} className="px-6 py-4 text-right">
                    <SkeletonBox 
                      height={20} 
                      width={index === totalColumns - 1 && showActions ? "60%" : "80%"} 
                      animation={animation} 
                    />
                  </th>
                ))}
              </tr>
            </thead>
          )}

          {/* محتوى الجدول */}
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {Array.from({ length: totalColumns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {colIndex === totalColumns - 1 && showActions ? (
                      <div className="flex gap-2">
                        <SkeletonBox variant="circular" width={32} height={32} animation={animation} />
                        <SkeletonBox variant="circular" width={32} height={32} animation={animation} />
                      </div>
                    ) : (
                      <SkeletonBox 
                        height={16} 
                        width={colIndex === 0 ? "90%" : "70%"} 
                        animation={animation}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
