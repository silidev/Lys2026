// testing/mocks/storageService.mock.ts
import type { IStorageService } from '../../common/services/storageService.ts';

export class MockStorageService implements IStorageService {
  private store: Record<string, string> = {};

  getItem<T>(key: string): T | null {
    const item = this.store[key];
    if (item === undefined) return null;
    try {
      return JSON.parse(item);
    } catch (_e) {
      console.error("MockStorageService: Failed to parse item", key, item);
      return null;
    }
  }

  getRawItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem<T>(key: string, value: T): void {
    this.store[key] = JSON.stringify(value);
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