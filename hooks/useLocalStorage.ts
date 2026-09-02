const FILE_PATH = 'hooks/useLocalStorage.ts';
import { useState } from 'react';
import storageService from '../common/services/storageService.ts';

export function useLocalStorage<T,>(key: string, initialValue: T | (() => T)): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = storageService.getItem<T>(key);
    if (item !== null) {
        return item;
    }
    const valueToStore = initialValue instanceof Function ? initialValue() : initialValue;
    try {
        storageService.setItem(key, valueToStore);
    } catch (error: unknown) {
        console.error(`Error setting initial localStorage for key "${key}".`, error);
    }
    return valueToStore;
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storageService.setItem(key, valueToStore);
    } catch (error: unknown) {
      console.error(`Error setting localStorage for key "${key}".`, error);
    }
  };

  return [storedValue, setValue];
}