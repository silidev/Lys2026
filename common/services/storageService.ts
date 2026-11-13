const FILE_PATH = 'common/services/storageService.ts';

export interface IStorageService {
  getItem<T>(key: string): T | null;
  getRawItem(key: string): string | null;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  clear(): void;
  getAllKeys(): string[];
}

export const createStorageService = (
  getStorage: () => Storage | undefined = () =>
    typeof window !== 'undefined'
      ? window.localStorage
      : undefined
): IStorageService => ({
  getItem: <T,>(key: string): T | null => {
    const storage = getStorage();
    if (!storage) {
      return null;
    }
    try {
      const item = storage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error: unknown) {
      console.error(
        `Error reading localStorage key “${key}”:`,
        error
      );
      return null;
    }
  },

  getRawItem: (key: string): string | null => {
    const storage = getStorage();
    if (!storage) {
      return null;
    }
    return storage.getItem(key);
  },

  setItem: <T,>(key: string, value: T): boolean => {
    const storage = getStorage();
    if (!storage) {
      return false;
    }
    try {
      const stringValue = JSON.stringify(value);
      storage.setItem(key, stringValue);
      return true;
    } catch (error: unknown) {
      console.error(
        `Error setting localStorage key “${key}”:`,
        error
      );
      return false;
    }
  },

  removeItem: (key: string): void => {
    const storage = getStorage();
    if (!storage) {
      return;
    }
    storage.removeItem(key);
  },

  clear: (): void => {
    const storage = getStorage();
    if (!storage) {
      return;
    }
    storage.clear();
  },

  getAllKeys: (): string[] => {
    const storage = getStorage();
    if (!storage) {
      return [];
    }
    return Object.keys(storage);
  },
});

const storageService: IStorageService =
  createStorageService();

export default storageService;
