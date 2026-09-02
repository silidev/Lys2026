const FILE_PATH = 'common/testing/services/testExecutionService.ts';
// No test coverage is needed. This is the core test runner service.
// Its behavior is implicitly tested by the overall execution of the test suites.
import type { Dispatch, SetStateAction } from 'react';
import type { TestResult, TestSuite } from '../types/testing.ts';
import { formatSingleFailedTest } from './testLogService.ts';
import { TestRunnerConfig } from '../../../00configs/common/testing.ts';
import storageService from '../../services/storageService.ts';
import { resetTimeoutFlag, getTimeoutFlag } from './tests/helpers.ts';

export interface TestRunState {
  status: 'idle' | 'running' | 'completed';
  results: TestResult[];
  totalTests?: number;
}

// --- Module-level singleton state ---
let sharedState: TestRunState = {
    status: 'idle',
    results: [],
    totalTests: 0,
};
const subscribers: Set<Dispatch<SetStateAction<TestRunState>>> = new Set();
let hasInitialRunBeenTriggered = false;
// --- End of module-level state ---

export const getSharedTestState = (): TestRunState => sharedState;

export const hasInitialRunFired = (): boolean => hasInitialRunBeenTriggered;

export const subscribeToTestState = (setter: Dispatch<SetStateAction<TestRunState>>) => {
    subscribers.add(setter);
};

export const unsubscribeFromTestState = (setter: Dispatch<SetStateAction<TestRunState>>) => {
    subscribers.delete(setter);
};

const notifySubscribers = () => {
    subscribers.forEach(setter => setter(sharedState));
};

const getLocalStorageSnapshot = (): string => {
    const snapshot: { [key: string]: string | null } = {};
    const keys = storageService.getAllKeys().sort();
    for (const key of keys) {
        snapshot[key] = storageService.getRawItem(key);
    }
    return JSON.stringify(snapshot, null, 2);
};

export const runTestsInternal = async (testSuiteFunctions?: TestSuite[], isManualRun: boolean = false) => {
    if (sharedState.status === 'running') {
        return;
    }

    if (!isManualRun) {
        if (hasInitialRunBeenTriggered) {
            return;
        }
        hasInitialRunBeenTriggered = true;
    }

    if (!testSuiteFunctions || testSuiteFunctions.length === 0) {
        console.warn('runTestsInternal called with no test suites. Completing immediately.');
        sharedState = { status: 'completed', results: [], totalTests: 0 };
        notifySubscribers();
        return;
    }

    resetTimeoutFlag();

    const testSuites = testSuiteFunctions.map(fn => ({
        name: fn.name,
        suite: fn(),
    }));

    const tests: Promise<TestResult>[] = [];
    testSuites.forEach(ts => {
        if (!ts.suite) {
            console.error(`ERROR: Test suite "${ts.name}" failed to load and is null or undefined.`);
        } else {
            tests.push(...ts.suite);
        }
    });
    
    const beforeSnapshot = getLocalStorageSnapshot();
    
    sharedState = { ...sharedState, status: 'running', results: [], totalTests: tests.length };
    notifySubscribers();

    // Allow the UI to update to 'running' state before blocking with tests.
    // This is crucial for effects that track status changes (e.g., idle -> running -> completed).
    await new Promise(resolve => setTimeout(resolve, 0));

    try {
        const results: TestResult[] = [];
        for (const testPromise of tests) {
            const result = await testPromise;
            results.push(result);
            sharedState = { ...sharedState, results: [...sharedState.results, result] };
            notifySubscribers();
        }
        
        sharedState = { status: 'completed', results };

        const failedTests = results.filter(r => r.status === 'failed');
        if (failedTests.length > 0) {
            console.warn(`${failedTests.length} of ${results.length} tests failed.`);
            if (TestRunnerConfig.maxFailedTestsToLog > 0) {
                const loggableFailedTests = failedTests.filter(
                    test => test.name !== 'Intentional Failure Check'
                );
                loggableFailedTests.slice(0, TestRunnerConfig.maxFailedTestsToLog).forEach(failedTest => {
                    console.error(formatSingleFailedTest(failedTest));
                });
            }
        }
    } catch (error: unknown) {
        console.error("The test runner encountered a critical error:", error);
        const errorResult: TestResult = {
            name: "Test Runner Execution",
            status: 'failed',
            duration: 0,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        };
        sharedState = { status: 'completed', results: [errorResult] };
    } finally {
        const afterSnapshot = getLocalStorageSnapshot();
        if (beforeSnapshot !== afterSnapshot && !getTimeoutFlag()) {
            const localStorageLeakTestResult: TestResult = {
                name: "LocalStorage Integrity Check",
                status: 'failed',
                duration: 0,
                error: "Tests modified localStorage. This is not allowed as it can interfere with other tests and application state.",
                stack: `BEFORE:\n${beforeSnapshot}\n\nAFTER:\n${afterSnapshot}`
            };
            sharedState.results.unshift(localStorageLeakTestResult);
        }
        notifySubscribers();
    }
};