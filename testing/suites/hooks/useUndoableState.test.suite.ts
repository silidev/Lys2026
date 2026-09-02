const FILE_PATH = 'testing/suites/hooks/useUndoableState.test.suite.ts';
import { renderHook, act } from '@testing-library/react';
import { useUndoableState } from '../../../hooks/useUndoableState.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';

const testInitialization = (_user: User, mockStorage: MockStorageService) => {
    mockStorage.clear();
    const { result } = renderHook(() => useUndoableState('test-key', { value: 0 }));
    assertEquals(result.current.state, { value: 0 });
    assertEquals(result.current.canUndo, false);
    assertEquals(result.current.canRedo, false);
};

const testSetState = (_user: User, mockStorage: MockStorageService) => {
    mockStorage.clear();
    const { result } = renderHook(() => useUndoableState('test-key', { value: 0 }));

    act(() => {
        result.current.setState({ value: 1 });
    });

    assertEquals(result.current.state, { value: 1 });
    assertEquals(result.current.canUndo, true);
    assertEquals(result.current.canRedo, false);
};

const testUndoRedo = (_user: User, mockStorage: MockStorageService) => {
    mockStorage.clear();
    const { result } = renderHook(() => useUndoableState('test-key', { value: 0 }));
    
    act(() => result.current.setState({ value: 1 }));
    act(() => result.current.setState({ value: 2 }));

    assertEquals(result.current.state, { value: 2 });
    assertEquals(result.current.canUndo, true);
    assertEquals(result.current.canRedo, false);

    act(() => result.current.undo());
    assertEquals(result.current.state, { value: 1 });
    assertEquals(result.current.canUndo, true);
    assertEquals(result.current.canRedo, true);

    act(() => result.current.undo());
    assertEquals(result.current.state, { value: 0 });
    assertEquals(result.current.canUndo, false);
    assertEquals(result.current.canRedo, true);
    
    act(() => result.current.undo()); // no effect
    assertEquals(result.current.state, { value: 0 });

    act(() => result.current.redo());
    assertEquals(result.current.state, { value: 1 });
    assertEquals(result.current.canUndo, true);
    assertEquals(result.current.canRedo, true);
    
    act(() => result.current.redo());
    assertEquals(result.current.state, { value: 2 });
    assertEquals(result.current.canUndo, true);
    assertEquals(result.current.canRedo, false);

    act(() => result.current.redo()); // no effect
    assertEquals(result.current.state, { value: 2 });
};

const testStateUpdateAfterUndo = (_user: User, mockStorage: MockStorageService) => {
    mockStorage.clear();
    const { result } = renderHook(() => useUndoableState('test-key', { value: 0 }));
    
    act(() => result.current.setState({ value: 1 }));
    act(() => result.current.setState({ value: 2 }));
    act(() => result.current.undo());

    assertEquals(result.current.state, { value: 1 });
    assertEquals(result.current.canRedo, true);

    act(() => result.current.setState({ value: 3 }));
    assertEquals(result.current.state, { value: 3 });
    assertEquals(result.current.canRedo, false, 'Redo history should be cleared after a new state update');

    act(() => result.current.undo());
    assertEquals(result.current.state, { value: 1 });
};

const testNoNewStateForIdenticalValue = (_user: User, mockStorage: MockStorageService) => {
    mockStorage.clear();
    const { result } = renderHook(() => useUndoableState('test-key', { value: 0 }));

    act(() => result.current.setState({ value: 1 }));
    assertEquals(result.current.canUndo, true);

    act(() => result.current.undo());
    assertEquals(result.current.canUndo, false);
    
    act(() => result.current.setState({ value: 0 }));
    assertEquals(result.current.canUndo, false, "Setting an identical state should not create a history entry");
};

export function useUndoableStateTestSuite() {
    const SUITE_NAME = useUndoableStateTestSuite.name;
    return [
        runComponentTest('useUndoableState: should initialize correctly', testInitialization, SUITE_NAME, FILE_PATH),
        runComponentTest('useUndoableState: should set new state', testSetState, SUITE_NAME, FILE_PATH),
        runComponentTest('useUndoableState: should handle undo and redo operations', testUndoRedo, SUITE_NAME, FILE_PATH),
        runComponentTest('useUndoableState: should clear redo history on new state update', testStateUpdateAfterUndo, SUITE_NAME, FILE_PATH),
        runComponentTest('useUndoableState: should not create history for identical state', testNoNewStateForIdenticalValue, SUITE_NAME, FILE_PATH),
    ];
}