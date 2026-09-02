const FILE_PATH = 'common/testing/services/tests/intentionalFailure.test.ts';
import type { TestResult } from '../../types/testing.ts';
import { runTest, assert } from './helpers.ts';
import { TestRunnerConfig } from '../../../../00configs/common/testing.ts';

declare global {
  interface Window {
    __SHOULD_TEST_FAIL__?: boolean;
  }
}

const testIntentionalFailure = async () => {
    if (window.__SHOULD_TEST_FAIL__ === true) {
        // Reset the flag immediately so subsequent test runs will pass.
        window.__SHOULD_TEST_FAIL__ = false;
        if (TestRunnerConfig.testFailureDelayS > 0) {
            await new Promise(resolve => setTimeout(resolve, TestRunnerConfig.testFailureDelayS * 1000));
        }
        assert(false, 'This test was set to fail intentionally.');
    }
};

export const runAllIntentionalFailureTests = (suiteName: string, fileName: string): Promise<TestResult>[] => [
    runTest('Intentional Failure Check', testIntentionalFailure, testIntentionalFailure.name, suiteName, fileName),
];