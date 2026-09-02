const FILE_PATH = 'testing/index.ts';
import { configure } from '@testing-library/dom';
import { logicTestSuites } from './testSuites.ts';
import type { TestSuite } from '../common/testing/types/testing.ts';
import { TestRunnerConfig } from '../00configs/common/testing.ts';

// Set a global timeout for async utilities to handle slow test environments.
configure({
  asyncUtilTimeout: TestRunnerConfig.testTimeoutS * 1000,
  // The user wants to suppress the long error message with the DOM tree dump.
  // This custom error handler will only show the first line of any "find" error.
  getElementError: (message) => {
    if (!message) {
      return new Error('Empty error message from getElementError.');
    }
    const error = new Error(message.split('\n')[0]);
    error.stack = '';
    return error;
  },
});

export { logicTestSuites, uiTestSuites } from './testSuites.ts';

// The main test suite for automatic runs.
export const allTestSuites: TestSuite[] = logicTestSuites;