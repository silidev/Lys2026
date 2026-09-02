const FILE_PATH = 'common/testing/services/testLogService.ts';
import type { TestResult } from '../types/testing.ts';

/**
 * Removes noisy base64 data URLs from stack traces.
 * @param stack The original stack trace.
 * @returns A cleaned stack trace or undefined if the input was undefined.
 */
const cleanStack = (stack?: string): string | undefined => {
    if (!stack) return undefined;
    return stack.replace(/data:application\/javascript;base64,[a-zA-Z0-9+/=]+/g, 'sanitized-url');
};

/**
 * Formats a single failed test result into a log string.
 * @param test A TestResult object.
 * @returns A formatted string for the failed test, or an empty string if the test did not fail.
 */
export const formatSingleFailedTest = (test: TestResult): string => {
    if (test.status !== 'failed') {
        return '';
    }
    let log = `FAIL: ${test.name} (${test.duration.toFixed(0)}ms)\n`;

    const funcName = test.testFunctionName || '(unknown function)';
    const suiteName = test.suiteName || '(unknown suite)';
    const fileName = test.fileName || '(unknown file)';
    
    log += `  Source: ${funcName} in ${suiteName}\n` +
           `  Path:   ${fileName}\n` +
           `  Error:  ${test.error}`;

    if (test.stack) {
      log += `\n  Stack: ${cleanStack(test.stack)}`;
    }
    
    return log;
};


/**
 * Generates a formatted log string from an array of failed test results.
 * @param failedTests An array of TestResult objects where status is 'failed'.
 * @returns A formatted string detailing the failed tests, or an empty string if there are no failures.
 */
export const generateFailedTestsLog = (failedTests?: TestResult[]): string => {
  if (!failedTests || failedTests.length === 0) {
    return '';
  }
  return failedTests.map(formatSingleFailedTest).filter(Boolean).join('\n\n');
};

/**
 * Generates a formatted log string from all test results.
 * @param results An array of TestResult objects.
 * @returns A formatted string detailing all test outcomes.
 */
export const generateFullTestLog = (results?: TestResult[]): string => {
  if (!results || results.length === 0) {
    return 'No tests were run.';
  }
  const failedTests = results.filter(r => r.status === 'failed');
  return generateFailedTestsLog(failedTests);
};
