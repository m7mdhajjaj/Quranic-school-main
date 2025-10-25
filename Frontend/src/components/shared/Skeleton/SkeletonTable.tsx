import React from "react";
import Skeleton from "./Skeleton";

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
const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = "",
  animation = "pulse",
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* رأس الجدول */}
          {showHeader && (
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="px-6 py-4 text-right">
                    <Skeleton height={20} width="80%" animation={animation} />
                  </th>
                ))}
              </tr>
            </thead>
          )}

          {/* محتوى الجدول */}
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <Skeleton 
                      height={16} 
                      width={colIndex === 0 ? "90%" : "70%"} 
                      animation={animation}
                    />
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

export default SkeletonTable;
