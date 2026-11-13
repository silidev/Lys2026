const FILE_PATH = 'testing/mocks/storageService.mock.ts';
import type {
  IStorageService,
} from '../../common/services/storageService.ts';

export class MockStorageService implements IStorageService {
  private store: Record<string, string> = {};
  public simulateQuotaError = false;

  getItem<T>(key: string): T | null {
    const item = this.store[key];
    if (item === undefined) return null;
    try {
      return JSON.parse(item) as T;
    } catch (_e) {
      console.error(
        'MockStorageService: Failed to parse item',
        key,
        item
      );
      return null;
    }
  }

  getRawItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setRawItem(key: string, rawValue: string): void {
    this.store[key] = rawValue;
  }

  setItem<T>(key: string, value: T): boolean {
    if (this.simulateQuotaError) {
      return false;
    }
    this.store[key] = JSON.stringify(value);
    return true;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  getAllKeys(): string[] {
    return Object.keys(this.store);
  }
}