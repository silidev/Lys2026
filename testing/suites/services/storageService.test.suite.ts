// testing/suites/services/storageService.test.suite.ts
import { runLogicTest } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';

const FILE_PATH = 'testing/suites/services/storageService.test.suite.ts';

const testSetAndGetItem = async (mockStorage: MockStorageService) => {
    const key = 'my-key';
    const value = { a: 1, b: 'hello' };
    mockStorage.setItem(key, value);
    const retrieved = mockStorage.getItem(key);
    assertEquals(retrieved, value);
};

const testGetNonExistentItem = async (mockStorage: MockStorageService) => {
    const retrieved = mockStorage.getItem('non-existent-key');
    assertEquals(retrieved, null);
};

const testRemoveItem = async (mockStorage: MockStorageService) => {
    const key = 'my-key';
    const value = 'my-value';
    mockStorage.setItem(key, value);
    mockStorage.removeItem(key);
    const retrieved = mockStorage.getItem(key);
    assertEquals(retrieved, null);
};

const testClear = async (mockStorage: MockStorageService) => {
    mockStorage.setItem('key1', 'value1');
    mockStorage.setItem('key2', { a: 1 });
    mockStorage.clear();
    assertEquals(mockStorage.getItem('key1'), null);
    assertEquals(mockStorage.getItem('key2'), null);
    assertEquals(mockStorage.getAllKeys(), []);
};

const testGetAllKeys = async (mockStorage: MockStorageService) => {
    mockStorage.setItem('key1', 'value1');
    mockStorage.setItem('key2', 'value2');
    assertEquals(mockStorage.getAllKeys().sort(), ['key1', 'key2']);
};


export function storageServiceTestSuite() {
    const SUITE_NAME = storageServiceTestSuite.name;
    return [
        runLogicTest('MockStorageService: should set and get an item', testSetAndGetItem, SUITE_NAME, FILE_PATH),
        runLogicTest('MockStorageService: should return null for non-existent item', testGetNonExistentItem, SUITE_NAME, FILE_PATH),
        runLogicTest('MockStorageService: should remove an item', testRemoveItem, SUITE_NAME, FILE_PATH),
        runLogicTest('MockStorageService: should clear the storage', testClear, SUITE_NAME, FILE_PATH),
        runLogicTest('MockStorageService: should get all keys', testGetAllKeys, SUITE_NAME, FILE_PATH),
    ];
}
