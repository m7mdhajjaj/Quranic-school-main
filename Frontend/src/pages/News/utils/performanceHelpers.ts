/**
 * Performance helper utilities
 * Centralized performance optimization utilities following DRY principles
 */

/**
 * Schedule a task in idle time without blocking the main thread
 * Falls back to Promise if requestIdleCallback is not available
 */
export const scheduleIdleTask = (callback: () => void | Promise<void>, timeout = 500): void => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(async () => {
      await callback();
    }, { timeout });
  } else {
    // Fallback for browsers without requestIdleCallback
    Promise.resolve().then(callback);
  }
};

/**
 * Schedule a task using requestAnimationFrame (double RAF for smoother animations)
 * Useful for scroll operations and smooth visual updates
 */
export const scheduleAnimationTask = (callback: () => void): (() => void) => {
  let rafId: number;
  
  const execute = () => {
    rafId = requestAnimationFrame(() => {
      requestAnimationFrame(callback);
    });
  };
  
  execute();
  
  // Return cancel function
  return () => {
    if (rafId) cancelAnimationFrame(rafId);
  };
};

/**
 * Schedule a microtask (runs before next render but after current execution)
 * Perfect for state updates that don't need immediate visual feedback
 */
export const scheduleMicrotask = (callback: () => void): void => {
  queueMicrotask(callback);
};

/**
 * Debounce a function call
 * Returns a debounced version of the function and a cancel method
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): [(...args: Parameters<T>) => void, () => void] => {
  let timeoutId: number | undefined;

  const debouncedFunc = (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      func(...args);
    }, delay);
  };

  const cancel = () => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  };

  return [debouncedFunc, cancel];
};

/**
 * Throttle a function call
 * Ensures function is called at most once per specified time period
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Scroll to element smoothly with error handling
 */
export const scrollToElement = (selector: string, block: ScrollLogicalPosition = 'center'): void => {
  scheduleAnimationTask(() => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block,
      });
    }
  });
};

/**
 * Get local date in YYYY-MM-DD format
 */
export const getLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return getLocalDate();
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return getLocalDate();
    }
    return dateObj.toISOString().split('T')[0];
  } catch {
    return getLocalDate();
  }
};

/**
 * Check if browser supports a feature
 */
export const supportsFeature = (feature: 'IntersectionObserver' | 'requestIdleCallback' | 'queueMicrotask'): boolean => {
  return feature in window;
};

/**
 * Measure performance of a function (development only)
 */
export const measurePerformance = async <T>(
  label: string,
  fn: () => T | Promise<T>
): Promise<T> => {
  if (process.env.NODE_ENV !== 'development') {
    return await Promise.resolve(fn());
  }

  const start = performance.now();
  const result = await Promise.resolve(fn());
  const end = performance.now();
  
  console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  
  return result;
};
