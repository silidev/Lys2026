import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';

const FILE_PATH = 'testing/suites/hooks/useLocalStorage.test.suite.ts';

const testSetInitialValue = async (_user: User, mockStorage: MockStorageService) => {
    mockStorage.setItem('test-key', 'stored value');
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial value'));
    assertEquals(result.current[0], 'stored value');
};

const testUseInitialValue = async () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial value'));
    assertEquals(result.current[0], 'initial value');
};

const testUpdateStateAndLocalStorage = async (_user: User, mockStorage: MockStorageService) => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial value'));
    act(() => {
        result.current[1]('new value');
    });
    assertEquals(result.current[0], 'new value');
    assertEquals(mockStorage.getItem('test-key'), 'new value');
};

const testUpdateStateWithFunction = async (_user: User, mockStorage: MockStorageService) => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10));
    act(() => {
        result.current[1]((prev: number) => prev + 5);
    });
    assertEquals(result.current[0], 15);
    assertEquals(mockStorage.getItem('test-key'), 15);
};

export function useLocalStorageTestSuite() {
    const SUITE_NAME = useLocalStorageTestSuite.name;
    return [
        runComponentTest('useLocalStorage: should set initial value from localStorage', testSetInitialValue, SUITE_NAME, FILE_PATH),
        runComponentTest('useLocalStorage: should use initialValue if localStorage is empty', testUseInitialValue, SUITE_NAME, FILE_PATH),
        runComponentTest('useLocalStorage: should update state and localStorage', testUpdateStateAndLocalStorage, SUITE_NAME, FILE_PATH),
        runComponentTest('useLocalStorage: should update state with a function', testUpdateStateWithFunction, SUITE_NAME, FILE_PATH),
    ];
}