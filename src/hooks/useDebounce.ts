import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for debounced autosave
 * Calls the save function after a delay when value changes
 */
export function useDebounce<T>(
  value: T,
  delay: number,
  onSave: (value: T) => void | Promise<void>
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<T>(value);

  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Only save if value actually changed
    if (value !== previousValueRef.current) {
      timerRef.current = setTimeout(() => {
        onSave(value);
        previousValueRef.current = value;
      }, delay);
    }

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay, onSave]);
}

/**
 * Hook for autosave on blur (immediate save, no debounce)
 */
export function useAutosave<T extends Record<string, any>>(
  data: T,
  onSave: (data: T) => void | Promise<void>
) {
  const previousDataRef = useRef<T>(data);

  const handleBlur = useCallback(() => {
    // Only save if data changed
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      onSave(data);
      previousDataRef.current = data;
    }
  }, [data, onSave]);

  return { handleBlur };
}
