import { useState } from 'react';

/**
 * Hook لإدارة حالة الصفوف القابلة للتوسيع
 * @returns كائن يحتوي على الصفوف الموسعة والدوال للتحكم بها
 */
export const useExpandableRows = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  /**
   * تبديل حالة صف معين (توسيع/إخفاء)
   * @param rowId - معرف الصف
   */
  const toggleRow = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  /**
   * التحقق من حالة صف معين
   * @param rowId - معرف الصف
   * @returns true إذا كان الصف موسعاً
   */
  const isRowExpanded = (rowId: string) => {
    return expandedRows.has(rowId);
  };

  return {
    toggleRow,
    isRowExpanded,
  };
};
