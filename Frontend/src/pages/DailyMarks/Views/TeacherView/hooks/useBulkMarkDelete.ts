import { useState } from "react";

/**
 * Custom hook لإدارة اختيار العلامات للحذف الجماعي
 * يتعامل مع: اختيار/إلغاء اختيار علامة واحدة، اختيار الكل، الحذف الجماعي
 */
export const useBulkMarkDelete = () => {
  const [selectedMarkIds, setSelectedMarkIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * تبديل اختيار علامة معينة
   */
  const toggleMarkSelection = (markId: string) => {
    setSelectedMarkIds(prev => 
      prev.includes(markId) 
        ? prev.filter(id => id !== markId)
        : [...prev, markId]
    );
  };

  /**
   * اختيار/إلغاء اختيار جميع العلامات
   */
  const toggleSelectAll = (allMarkIds: string[]) => {
    if (selectedMarkIds.length === allMarkIds.length) {
      setSelectedMarkIds([]);
    } else {
      setSelectedMarkIds(allMarkIds);
    }
  };

  /**
   * مسح جميع الاختيارات
   */
  const clearSelection = () => {
    setSelectedMarkIds([]);
  };

  /**
   * التحقق إذا كانت علامة محددة
   */
  const isMarkSelected = (markId: string) => {
    return selectedMarkIds.includes(markId);
  };

  /**
   * التحقق إذا كانت جميع العلامات محددة
   */
  const areAllSelected = (allMarkIds: string[]) => {
    return selectedMarkIds.length > 0 && selectedMarkIds.length === allMarkIds.length;
  };

  /**
   * حذف جميع العلامات المحددة
   */
  const handleBulkDelete = async (
    onDeleteMark: (markId: string) => Promise<void>,
    onMarkChange?: () => Promise<void>
  ) => {
    if (selectedMarkIds.length === 0) return;
    
    const confirmed = confirm(`هل تريد حذف ${selectedMarkIds.length} علامة؟`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      for (const markId of selectedMarkIds) {
        await onDeleteMark(markId);
      }
      setSelectedMarkIds([]);
      
      if (onMarkChange) {
        await onMarkChange();
      }
    } catch (error) {
      console.error('Error deleting marks:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    selectedMarkIds,
    isDeleting,
    toggleMarkSelection,
    toggleSelectAll,
    clearSelection,
    isMarkSelected,
    areAllSelected,
    handleBulkDelete,
  };
};
