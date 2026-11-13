const FILE_PATH =
    'testing/suites/hooks/useUndoableStateSafety.test.suite.ts';
import sinon from 'sinon';
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

const testInMemoryHistoryOnlyAndLegacyCleanup = (
    _user: User,
    mockStorage: MockStorageService
) => {
    const fn = testInMemoryHistoryOnlyAndLegacyCleanup.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    mockStorage.clear();
    mockStorage.setItem('test-key-history-state', {
        history: [{ value: 10 }, { value: 25 }],
        currentIndex: 1,
    });

    const { result } = renderHook(() =>
        useUndoableState('test-key', { value: 0 })
    );
    assertEquals(
        result.current.state,
        { value: 25 },
        `${ctx}: recovered from legacy history`
    );
    assertEquals(
        mockStorage.getItem('test-key'),
        { value: 25 },
        `${ctx}: saved to main key`
    );
    assertEquals(
        mockStorage.getRawItem('test-key-history-state'),
        null,
        `${ctx}: legacy history key removed`
    );

    act(() => result.current.setState({ value: 50 }));
    assertEquals(
        mockStorage.getRawItem('test-key-history-state'),
        null,
        `${ctx}: history not written to storage`
    );
};

const testCorruptStorageNotOverwrittenAndReportsError = (
    _user: User,
    mockStorage: MockStorageService
) => {
    const fn =
        testCorruptStorageNotOverwrittenAndReportsError.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    const sandbox = sinon.createSandbox();
    const errorStub = sandbox.stub(console, 'error');
    try {
        mockStorage.clear();
        mockStorage.setRawItem('test-key', '{corrupt json');
        const errors: string[] = [];

        const { result } = renderHook(() =>
            useUndoableState(
                'test-key',
                { value: 0 },
                (msg) => errors.push(msg)
            )
        );
        assertEquals(
            mockStorage.getRawItem('test-key'),
            '{corrupt json',
            `${ctx}: raw data untouched`
        );
        assertEquals(
            errors.length,
            1,
            `${ctx}: error reported on startup`
        );
        assertEquals(
            errorStub.calledOnce,
            true,
            `${ctx}: logged parse failure`
        );

        act(() => result.current.setState({ value: 9 }));
        assertEquals(
            mockStorage.getRawItem('test-key'),
            '{corrupt json',
            `${ctx}: raw data still untouched after edit`
        );
    } finally {
        sandbox.restore();
    }
};

const testQuotaErrorAndRapidUpdates = (
    _user: User,
    mockStorage: MockStorageService
) => {
    const fn = testQuotaErrorAndRapidUpdates.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    mockStorage.clear();
    const errors: string[] = [];

    const { result } = renderHook(() =>
        useUndoableState(
            'test-key',
            { a: 0, b: 0 },
            (msg) => errors.push(msg)
        )
    );

    act(() => {
        result.current.setState((prev) => ({
            ...prev,
            a: 1,
        }));
        result.current.setState((prev) => ({
            ...prev,
            b: 2,
        }));
    });
    assertEquals(
        result.current.state,
        { a: 1, b: 2 },
        `${ctx}: rapid updates preserved`
    );

    mockStorage.simulateQuotaError = true;
    act(() => {
        result.current.setState({ a: 3, b: 4 });
    });
    assertEquals(
        errors.length,
        1,
        `${ctx}: quota error surfaced`
    );
    assertEquals(
        mockStorage.getItem('test-key'),
        { a: 1, b: 2 },
        `${ctx}: previous persisted value intact`
    );
};

export function useUndoableStateSafetyTestSuite() {
    const SUITE = useUndoableStateSafetyTestSuite.name;
    return [
        runComponentTest(
            'useUndoableState: in-memory history & legacy migration',
            testInMemoryHistoryOnlyAndLegacyCleanup,
            SUITE,
            FILE_PATH
        ),
        runComponentTest(
            'useUndoableState: corrupt raw data never overwritten',
            testCorruptStorageNotOverwrittenAndReportsError,
            SUITE,
            FILE_PATH
        ),
        runComponentTest(
            'useUndoableState: quota error reported & rapid updates',
            testQuotaErrorAndRapidUpdates,
            SUITE,
            FILE_PATH
        ),
    ];
}
