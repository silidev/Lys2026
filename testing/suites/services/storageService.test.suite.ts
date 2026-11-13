const FILE_PATH =
    'testing/suites/services/storageService.test.suite.ts';
import sinon from 'sinon';
import {
    createStorageService,
} from '../../../common/services/storageService.ts';
import { runLogicTest } from '../../helpers.ts';
import type {
    MockStorageService,
} from '../../mocks/storageService.mock.ts';
import {
    assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';

const createFakeStorage = (throwOnSet = false): Storage => {
    const map = new Map<string, string>();
    return {
        get length() {
            return map.size;
        },
        clear() {
            map.clear();
        },
        getItem(key: string) {
            return map.get(key) ?? null;
        },
        key(index: number) {
            return Array.from(map.keys())[index] ?? null;
        },
        removeItem(key: string) {
            map.delete(key);
        },
        setItem(key: string, value: string) {
            if (throwOnSet) {
                throw new DOMException(
                    'Quota exceeded',
                    'QuotaExceededError'
                );
            }
            map.set(key, value);
        },
    };
};

const testSetAndGetItem = async (
    mockStorage: MockStorageService
) => {
    const key = 'my-key';
    const value = { a: 1, b: 'hello' };
    mockStorage.setItem(key, value);
    const retrieved = mockStorage.getItem(key);
    assertEquals(retrieved, value);
};

const testGetNonExistentItem = async (
    mockStorage: MockStorageService
) => {
    const retrieved = mockStorage.getItem('non-existent-key');
    assertEquals(retrieved, null);
};

const testRemoveItem = async (
    mockStorage: MockStorageService
) => {
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

const testGetAllKeys = async (
    mockStorage: MockStorageService
) => {
    mockStorage.setItem('key1', 'value1');
    mockStorage.setItem('key2', 'value2');
    assertEquals(mockStorage.getAllKeys().sort(), [
        'key1',
        'key2',
    ]);
};

const testRealStorageServiceHandlesQuotaAndInvalidJson = () => {
    const fn =
        testRealStorageServiceHandlesQuotaAndInvalidJson.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    const sandbox = sinon.createSandbox();
    const errorStub = sandbox.stub(console, 'error');
    try {
        const okFake = createFakeStorage(false);
        const svc = createStorageService(() => okFake);

        assertEquals(
            svc.setItem('k', { n: 1 }),
            true,
            `${ctx}: setItem returns true`
        );
        assertEquals(
            svc.getItem<{ n: number }>('k'),
            { n: 1 },
            `${ctx}: getItem parses`
        );

        okFake.setItem('corrupt', '{bad json');
        assertEquals(
            svc.getItem('corrupt'),
            null,
            `${ctx}: corrupt returns null`
        );
        assertEquals(
            svc.getRawItem('corrupt'),
            '{bad json',
            `${ctx}: raw preserved`
        );

        const quotaFake = createFakeStorage(true);
        const quotaSvc = createStorageService(() => quotaFake);
        assertEquals(
            quotaSvc.setItem('k', { n: 2 }),
            false,
            `${ctx}: quota error returns false`
        );
        assertEquals(
            errorStub.callCount,
            2,
            `${ctx}: logged read and write errors`
        );
    } finally {
        sandbox.restore();
    }
};

export function storageServiceTestSuite() {
    const SUITE_NAME = storageServiceTestSuite.name;
    return [
        runLogicTest(
            'MockStorageService: should set and get an item',
            testSetAndGetItem,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'MockStorageService: returns null for missing item',
            testGetNonExistentItem,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'MockStorageService: should remove an item',
            testRemoveItem,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'MockStorageService: should clear the storage',
            testClear,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'MockStorageService: should get all keys',
            testGetAllKeys,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'StorageService: handles quota errors and corrupt JSON',
            testRealStorageServiceHandlesQuotaAndInvalidJson,
            SUITE_NAME,
            FILE_PATH
        ),
    ];
}
