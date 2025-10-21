// ============================================================================
// Date formatting utilities
// ============================================================================

/**
 * Formats date to Arabic format (e.g., "15 يناير 2024")
 */
export const formatDateArabic = (dateStr: string): string => {
  if (!dateStr) return dateStr;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    return `${day} ${arabicMonths[month - 1]} ${year}`;
  } catch {
    return dateStr;
  }
};
