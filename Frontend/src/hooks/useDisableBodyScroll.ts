import { useEffect } from 'react';

/**
 * Hook لتعطيل scroll الصفحة عند فتح Modal
 * @param isOpen - حالة فتح/إغلاق الـ Modal
 */
export const useDisableBodyScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // حفظ موضع الـ scroll الحالي
      const scrollY = window.scrollY;
      
      // إضافة class لتعطيل الـ scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // دالة للتنظيف عند الإغلاق
      return () => {
        // إزالة الـ styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // إعادة الـ scroll للموضع السابق
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};
