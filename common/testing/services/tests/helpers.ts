const FILE_PATH = 'common/testing/services/tests/helpers.ts';
import type { TestResult } from '../../types/testing.ts';
import { TestRunnerConfig } from '../../../../00configs/common/testing.ts';

// A lock to ensure tests that modify global state (navigator.clipboard) run serially.
let clipboardTestPromise: Promise<TestResult | void> = Promise.resolve();
let hasTimedOut = false;

export const resetTimeoutFlag = () => {
    hasTimedOut = false;
};

export const getTimeoutFlag = () => {
    return hasTimedOut;
};

export const runTest = async (name: string, testFn: () => Promise<void> | void, testFunctionName?: string, suiteName?: string, fileName?: string): Promise<TestResult> => {
    
    const run = async (): Promise<TestResult> => {
        if (hasTimedOut) {
            return { name, status: 'failed', duration: 0, error: 'Skipped due to previous test timeout', testFunctionName, suiteName, fileName };
        }

        const startTime = performance.now();
        const originalClipboard = navigator.clipboard;

        // Use a closure to maintain mock state, which is more robust than relying on `this`.
        const mockState = { text: '' };
        const mockClipboard = {
            writeText: async (text: string) => {
                mockState.text = text;
            },
            readText: async () => {
                return mockState.text;
            },
            // A synchronous helper for tests to inspect the clipboard's state
            _getText: () => {
                return mockState.text;
            }
        };

        // Mock clipboard for the duration of the test to avoid permission errors
        // and to allow for synchronous inspection of what was "copied".
        Object.defineProperty(navigator, 'clipboard', {
            value: mockClipboard,
            configurable: true,
            writable: true,
        });

        let timer: number | null = null;
        try {
            // The test function is wrapped in a promise to handle both sync and async functions.
            const testExecutionPromise = (async () => {
                await testFn();
            })();

            const timeoutPromise = new Promise<never>((_, reject) => {
                timer = window.setTimeout(
                    () => {
                        hasTimedOut = true;
                        reject(new Error(`Test timed out after ${TestRunnerConfig.testTimeoutS}s.`));
                    },
                    TestRunnerConfig.testTimeoutS * 1000
                );
            });

            await Promise.race([testExecutionPromise, timeoutPromise]);
            
            const duration = performance.now() - startTime;
            return { name, status: 'passed', duration, testFunctionName, suiteName, fileName };
        } catch (e: unknown) {
            const duration = performance.now() - startTime;
            const error = e instanceof Error ? e.message : String(e);
            const stack = e instanceof Error ? e.stack : undefined;
            return { name, status: 'failed', duration, error, stack, testFunctionName, suiteName, fileName };
        } finally {
            if (timer) {
                clearTimeout(timer);
            }
            // Restore the original clipboard functionality
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                writable: true,
            });
        }
    };
    
    // Chain the execution of this test to the promise of the previous one to avoid race conditions.
    const newTestPromise = clipboardTestPromise.then(run);
    clipboardTestPromise = newTestPromise;
    return newTestPromise;
};

export const assertEquals = <T,>(actual: T, expected: T, message: string | null = null) => {  
  const expectedJson = JSON.stringify(expected)  
  const actualJson = JSON.stringify(actual)  
  if (actualJson !== expectedJson) {  
    if (actual instanceof Date && expected instanceof Date  
        && actual.getTime()===expected.getTime())  
      return  
    console.log("*************** actual  :\n" + actualJson)  
    console.log("*************** expected:\n" + expectedJson)  
    if (typeof expected === 'string' && typeof actual === 'string') {  
      const expectedShortened = expected.substring(0, 20).replace(/\n/g, '')  
      const actualShortened = actual.substring(0, 20).replace(/\n/g, '')  
      throw new Error(message  
          || `Assertion failed: Actual: ${actualShortened}, but expected ${expectedShortened}`)  
    }  
    throw new Error(message  
        || `Assertion failed: Actual: ${actualJson}, but expected ${expectedJson}`)  
  }  
}

export const assertEqualsWithoutJson = <T,>(actual: T, expected: T, message: string | null = null) => {
    if (actual !== expected) {
        throw new Error(message || `Assertion failed: Actual value is not strictly equal to the expected value.`);
    }
};

export const assert = (condition: boolean, message: string) => {
    if (!condition) {
        throw new Error(message);
    }
};