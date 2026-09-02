const FILE_PATH = 'common/testing/types/testing.ts';
export interface TestResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: string;
  stack?: string;
  testFunctionName?: string;
  suiteName?: string;
  fileName?: string;
}

export type TestSuite = () => Promise<TestResult>[];