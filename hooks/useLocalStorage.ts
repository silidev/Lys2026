const FILE_PATH = 'hooks/useLocalStorage.ts';
import { useCallback, useRef, useState } from 'react';
import storageService from '../common/services/storageService.ts';

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = storageService.getItem<T>(key);
    if (item !== null) {
      return item;
    }
    const valueToStore =
      initialValue instanceof Function
        ? initialValue()
        : initialValue;
    if (storageService.getRawItem(key) === null) {
      storageService.setItem(key, valueToStore);
    }
    return valueToStore;
  });

  const latestRef = useRef<T>(storedValue);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function
            ? value(latestRef.current)
            : value;
        latestRef.current = valueToStore;
        setStoredValue(valueToStore);
        storageService.setItem(key, valueToStore);
      } catch (error: unknown) {
        console.error(
          `Error setting localStorage for key "${key}".`,
          error
        );
      }
    },
    [key]
  );

  return [storedValue, setValue];
}