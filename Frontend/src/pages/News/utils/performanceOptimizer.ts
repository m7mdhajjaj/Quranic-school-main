/**
 * Advanced performance optimization utilities
 * Tackles message handler violations and improves initial load
 */

/**
 * Defer heavy initialization tasks to prevent blocking
 * Uses a priority queue system for better control
 */
export class TaskScheduler {
  private static highPriorityQueue: Array<() => void> = [];
  private static lowPriorityQueue: Array<() => void> = [];
  private static isProcessing = false;

  /**
   * Add a high priority task (runs first)
   */
  static addHighPriority(task: () => void) {
    this.highPriorityQueue.push(task);
    this.processQueue();
  }

  /**
   * Add a low priority task (runs after high priority)
   */
  static addLowPriority(task: () => void) {
    this.lowPriorityQueue.push(task);
    this.processQueue();
  }

  /**
   * Process the queue in idle time
   */
  private static processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    const processNext = () => {
      // Process high priority first
      if (this.highPriorityQueue.length > 0) {
        const task = this.highPriorityQueue.shift();
        if (task) {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              task();
              processNext();
            }, { timeout: 1000 });
          } else {
            setTimeout(() => {
              task();
              processNext();
            }, 0);
          }
        }
      }
      // Then low priority
      else if (this.lowPriorityQueue.length > 0) {
        const task = this.lowPriorityQueue.shift();
        if (task) {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              task();
              processNext();
            }, { timeout: 2000 });
          } else {
            setTimeout(() => {
              task();
              processNext();
            }, 50);
          }
        }
      } else {
        this.isProcessing = false;
      }
    };

    processNext();
  }

  /**
   * Clear all queued tasks
   */
  static clear() {
    this.highPriorityQueue = [];
    this.lowPriorityQueue = [];
    this.isProcessing = false;
  }
}

/**
 * Batch state updates to reduce re-renders
 */
export const batchUpdates = (updates: Array<() => void>) => {
  if ('startTransition' in React) {
    // Use React 18's startTransition for non-urgent updates
    (React as any).startTransition(() => {
      updates.forEach(update => update());
    });
  } else {
    // Fallback: use microtask batching
    queueMicrotask(() => {
      updates.forEach(update => update());
    });
  }
};

/**
 * Lazy initialize heavy components/features
 */
export const lazyInit = (
  initFn: () => void,
  delay = 0,
  priority: 'high' | 'low' = 'low'
) => {
  if (delay > 0) {
    setTimeout(() => {
      if (priority === 'high') {
        TaskScheduler.addHighPriority(initFn);
      } else {
        TaskScheduler.addLowPriority(initFn);
      }
    }, delay);
  } else {
    if (priority === 'high') {
      TaskScheduler.addHighPriority(initFn);
    } else {
      TaskScheduler.addLowPriority(initFn);
    }
  }
};

/**
 * Optimize array operations for large datasets
 */
export const optimizeArrayOps = <T>(
  array: T[],
  operation: (item: T) => void,
  chunkSize = 10
) => {
  let index = 0;

  const processChunk = () => {
    const end = Math.min(index + chunkSize, array.length);
    
    for (let i = index; i < end; i++) {
      operation(array[i]);
    }

    index = end;

    if (index < array.length) {
      requestAnimationFrame(processChunk);
    }
  };

  requestAnimationFrame(processChunk);
};

/**
 * Preload critical resources without blocking
 */
export const preloadCritical = (urls: string[], type: 'image' | 'script' | 'style') => {
  lazyInit(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch'; // Use prefetch instead of preload to avoid "not used" warnings
      link.as = type;
      link.href = url;
      document.head.appendChild(link);
    });
  }, 1000, 'low');
};

/**
 * Monitor performance and log slow operations
 */
export const monitorPerformance = (
  name: string,
  threshold = 50 // ms
): [() => void, () => void] => {
  let startTime: number;

  const start = () => {
    startTime = performance.now();
  };

  const end = () => {
    const duration = performance.now() - startTime;
    if (duration > threshold && process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
  };

  return [start, end];
};

// React import for batchUpdates
import * as React from 'react';
