// ============================================================================
// Image Optimization Utilities
// ============================================================================

/**
 * تحسين تحميل الصور باستخدام Intersection Observer
 */
export class ImageOptimizer {
  private static observer: IntersectionObserver | null = null;

  /**
   * تهيئة Intersection Observer للصور
   */
  static init() {
    if (typeof window === 'undefined' || ImageOptimizer.observer) return;

    ImageOptimizer.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              ImageOptimizer.observer?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px', // تحميل الصور قبل 50px من الظهور
        threshold: 0.01,
      }
    );
  }

  /**
   * مراقبة صورة للتحميل الكسول
   */
  static observe(element: HTMLElement) {
    if (!ImageOptimizer.observer) {
      ImageOptimizer.init();
    }
    ImageOptimizer.observer?.observe(element);
  }

  /**
   * إيقاف مراقبة صورة
   */
  static unobserve(element: HTMLElement) {
    ImageOptimizer.observer?.unobserve(element);
  }

  /**
   * تنظيف Observer
   */
  static destroy() {
    ImageOptimizer.observer?.disconnect();
    ImageOptimizer.observer = null;
  }
}

/**
 * Hook لتحميل الصور الكسول
 */
export const useLazyImage = () => {
  const imgRef = (node: HTMLImageElement | null) => {
    if (node) {
      ImageOptimizer.observe(node);
    }
  };

  return imgRef;
};

/**
 * تحويل مسار الصورة إلى WebP إذا كان مدعوماً
 */
export const getOptimizedImagePath = (src: string): string => {
  if (typeof window === 'undefined') return src;
  
  // التحقق من دعم WebP
  const supportsWebP = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;

  if (supportsWebP && !src.endsWith('.webp')) {
    // استبدال الامتداد بـ .webp
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  return src;
};

/**
 * إنشاء placeholder blur للصور
 */
export const generateBlurPlaceholder = (width: number, height: number): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='${width}' height='${height}' fill='%23f3f4f6' filter='url(%23b)'/%3E%3C/svg%3E`;
};

// تهيئة تلقائية عند التحميل
if (typeof window !== 'undefined') {
  ImageOptimizer.init();
}
