// common/services/storageService.ts

export interface IStorageService {
  getItem<T>(key: string): T | null;
  getRawItem(key: string): string | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
  getAllKeys(): string[];
}

const storageService: IStorageService = {
  getItem: <T,>(key:string): T | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error: unknown) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return null;
    }
  },
  
  getRawItem: (key: string): string | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.localStorage.getItem(key);
  },
  
  setItem: <T,>(key: string, value: T): void => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stringValue = JSON.stringify(value);
      window.localStorage.setItem(key, stringValue);
    } catch (error: unknown) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  },
  
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.removeItem(key);
  },
  
  clear: (): void => {
      if (typeof window === 'undefined') {
        return;
      }
      window.localStorage.clear();
  },
  
  getAllKeys: (): string[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    return Object.keys(window.localStorage);
  },
};

export default storageService;
