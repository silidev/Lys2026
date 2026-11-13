const FILE_PATH =
    'testing/suites/hooks/useUndoableStatePersistence.test.suite.ts';
import { renderHook, act } from '@testing-library/react';
import {
    useUndoableState,
} from '../../../hooks/useUndoableState.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import type {
    MockStorageService,
} from '../../mocks/storageService.mock.ts';
import {
    assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';

const testInitializesFromKeyAndPersists = (
    _user: User,
    mockStorage: MockStorageService
) => {
    const fn = testInitializesFromKeyAndPersists.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    mockStorage.clear();
    mockStorage.setItem('test-key', { value: 42 });

    const { result, unmount } = renderHook(() =>
        useUndoableState('test-key', { value: 0 })
    );
    assertEquals(result.current.state, { value: 42 }, ctx);

    act(() => result.current.setState({ value: 99 }));
    assertEquals(
        mockStorage.getItem('test-key'),
        { value: 99 },
        `${ctx}: persisted after setState`
    );

    act(() => result.current.undo());
    assertEquals(
        mockStorage.getItem('test-key'),
        { value: 42 },
        `${ctx}: persisted after undo`
    );
    unmount();

    const remounted = renderHook(() =>
        useUndoableState('test-key', { value: 0 })
    );
    assertEquals(
        remounted.result.current.state,
        { value: 42 },
        `${ctx}: preserved after remount`
    );
};

const testSetStateWithoutHistory = (
    _user: User,
    mockStorage: MockStorageService
) => {
    const fn = testSetStateWithoutHistory.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    mockStorage.clear();
    const { result } = renderHook(() =>
        useUndoableState('test-key', { value: 0 })
    );

    act(() => result.current.setState({ value: 1 }));
    act(() =>
        result.current.setStateWithoutHistory({ value: 2 })
    );
    assertEquals(result.current.state, { value: 2 }, ctx);
    assertEquals(result.current.canUndo, true, ctx);
    assertEquals(
        mockStorage.getItem('test-key'),
        { value: 2 },
        ctx
    );

    act(() => result.current.undo());
    assertEquals(result.current.state, { value: 0 }, ctx);
};

export function useUndoableStatePersistenceTestSuite() {
    const SUITE_NAME = useUndoableStatePersistenceTestSuite.name;
    return [
        runComponentTest(
            'useUndoableState: initializes from key and persists',
            testInitializesFromKeyAndPersists,
            SUITE_NAME,
            FILE_PATH
        ),
        runComponentTest(
            'useUndoableState: setStateWithoutHistory replaces',
            testSetStateWithoutHistory,
            SUITE_NAME,
            FILE_PATH
        ),
    ];
}
