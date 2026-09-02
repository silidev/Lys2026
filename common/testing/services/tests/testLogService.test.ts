const FILE_PATH = 'common/testing/services/tests/testLogService.test.ts';
import type { TestResult } from '../../index.ts';
import { runTest, assertEquals } from './helpers.ts';
import { generateFailedTestsLog, generateFullTestLog } from '../testLogService.ts';

const testGenerateLog = () => {
    const failedTests: TestResult[] = [
        { name: 'Test 1', status: 'failed', duration: 123, error: 'Assertion failed', suiteName: 'SuiteA', testFunctionName: 'test1', fileName: 'fileA.ts' },
        { name: 'Test 2', status: 'failed', duration: 45.6, error: 'Timeout', suiteName: 'SuiteB', testFunctionName: 'test2', fileName: 'fileB.ts' },
    ];
    const log = generateFailedTestsLog(failedTests);
    const expectedLog = `FAIL: Test 1 (123ms)
  Source: test1 in SuiteA
  Path:   fileA.ts
  Error:  Assertion failed

FAIL: Test 2 (46ms)
  Source: test2 in SuiteB
  Path:   fileB.ts
  Error:  Timeout`;
    assertEquals(log, expectedLog, `Generated log is incorrect. Expected:\n${expectedLog}\nGot:\n${log}`);
};

const testGenerateLogEmpty = () => {
    const log = generateFailedTestsLog([]);
    assertEquals(log, '', 'Log for no failed tests should be empty');
};

const testGenerateLogUndefined = () => {
    const log = generateFailedTestsLog(undefined);
    assertEquals(log, '', 'Log for undefined tests should be empty');
};

const testGenerateLogWithStack = () => {
    const failedTests: TestResult[] = [
        { name: 'Test 3', status: 'failed', duration: 50, error: 'Has stack', stack: 'Error: Has stack\n at myFunc (file.js:10:5)', suiteName: 'SuiteC', testFunctionName: 'test3', fileName: 'fileC.ts' },
    ];
    const log = generateFailedTestsLog(failedTests);
    const expectedLog = `FAIL: Test 3 (50ms)
  Source: test3 in SuiteC
  Path:   fileC.ts
  Error:  Has stack
  Stack: Error: Has stack
 at myFunc (file.js:10:5)`;
    assertEquals(log, expectedLog, `Generated log with stack is incorrect. Expected:\n${expectedLog}\nGot:\n${log}`);
};

const testGenerateLogWithSanitizedStack = () => {
    const failedTests: TestResult[] = [
        {
            name: 'Test with messy stack',
            status: 'failed',
            duration: 50,
            error: 'Has messy stack',
            stack: 'Error: Has messy stack\n at myFunc (data:application/javascript;base64,YWxlcnQoMSk=):10:5'
        },
    ];
    const log = generateFailedTestsLog(failedTests);
    const expectedLog = `FAIL: Test with messy stack (50ms)
  Source: (unknown function) in (unknown suite)
  Path:   (unknown file)
  Error:  Has messy stack
  Stack: Error: Has messy stack
 at myFunc (sanitized-url):10:5`;
    assertEquals(log, expectedLog, `Generated log with sanitized stack is incorrect. Expected:\n${expectedLog}\nGot:\n${log}`);
};

const testGenerateFullLog = () => {
    const results: TestResult[] = [
        { name: 'Test 1', status: 'passed', duration: 123 },
        { name: 'Test 2', status: 'failed', duration: 45.6, error: 'Timeout', stack: 'stack trace', testFunctionName: 'test2', suiteName: 'SuiteA', fileName: 'fileA.ts' },
        { name: 'Test 3', status: 'passed', duration: 10 },
    ];
    const log = generateFullTestLog(results);
    const expectedLog = `FAIL: Test 2 (46ms)\n  Source: test2 in SuiteA\n  Path:   fileA.ts\n  Error:  Timeout\n  Stack: stack trace`;
    assertEquals(log, expectedLog, `Generated full log is incorrect. Expected:\n${expectedLog}\nGot:\n${log}`);
};

const testGenerateFullLogAllPassed = () => {
    const results: TestResult[] = [
        { name: 'Test 1', status: 'passed', duration: 123 },
        { name: 'Test 3', status: 'passed', duration: 10 },
    ];
    const log = generateFullTestLog(results);
    assertEquals(log, '', `Generated full log for all passed tests should be an empty string. Got:\n${log}`);
};


const testGenerateFullLogEmpty = () => {
    const log = generateFullTestLog([]);
    assertEquals(log, 'No tests were run.', 'Log for no tests should be a specific message');
};

export const runAllTestLogServiceTests = (suiteName: string, fileName: string): Promise<TestResult>[] => [
    runTest('Test Log Service: Generate Log', testGenerateLog, testGenerateLog.name, suiteName, fileName),
    runTest('Test Log Service: Empty Input', testGenerateLogEmpty, testGenerateLogEmpty.name, suiteName, fileName),
    runTest('Test Log Service: Undefined Input', testGenerateLogUndefined, testGenerateLogUndefined.name, suiteName, fileName),
    runTest('Test Log Service: Generate Log with Stack', testGenerateLogWithStack, testGenerateLogWithStack.name, suiteName, fileName),
    runTest('Test Log Service: Sanitized Stack', testGenerateLogWithSanitizedStack, testGenerateLogWithSanitizedStack.name, suiteName, fileName),
    runTest('Test Log Service: Generate Full Log', testGenerateFullLog, testGenerateFullLog.name, suiteName, fileName),
    runTest('Test Log Service: Generate Full Log All Passed', testGenerateFullLogAllPassed, testGenerateFullLogAllPassed.name, suiteName, fileName),
    runTest('Test Log Service: Generate Full Log Empty', testGenerateFullLogEmpty, testGenerateFullLogEmpty.name, suiteName, fileName),
];
