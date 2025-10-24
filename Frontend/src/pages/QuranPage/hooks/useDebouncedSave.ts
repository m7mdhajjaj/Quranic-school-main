import { useEffect, useRef } from 'react';

/**
 * Hook لحفظ القيم بشكل متأخر (debounced) لتحسين الأداء
 * يمنع الحفظ المتكرر عند كل تغيير ويحفظ فقط بعد توقف المستخدم عن التعديل
 */
export function useDebouncedSave<T>(
  value: T,
  saveFn: (value: T) => void | Promise<void>,
  delay: number = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<T>(value);

  useEffect(() => {
    // Don't save if value hasn't changed
    if (previousValueRef.current === value) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to save after delay
    timeoutRef.current = setTimeout(() => {
      saveFn(value);
      previousValueRef.current = value;
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, saveFn, delay]);
}

/**
 * Hook لتقييد معدل الحفظ (throttled) - يحفظ على فترات ثابتة
 * مفيد للإعدادات التي تتغير بسرعة لكن نريد حفظها بانتظام
 */
export function useThrottledSave<T>(
  value: T,
  saveFn: (value: T) => void | Promise<void>,
  interval: number = 1000
) {
  const lastSavedRef = useRef<T>(value);
  const lastSaveTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;

    // If enough time has passed and value has changed
    if (timeSinceLastSave >= interval && lastSavedRef.current !== value) {
      saveFn(value);
      lastSavedRef.current = value;
      lastSaveTimeRef.current = now;
    } else if (lastSavedRef.current !== value) {
      // Schedule save for remaining time
      const remainingTime = interval - timeSinceLastSave;
      const timeoutId = setTimeout(() => {
        saveFn(value);
        lastSavedRef.current = value;
        lastSaveTimeRef.current = Date.now();
      }, remainingTime);

      return () => clearTimeout(timeoutId);
    }
  }, [value, saveFn, interval]);
}
