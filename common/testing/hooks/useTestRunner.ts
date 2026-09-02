const FILE_PATH = 'common/testing/hooks/useTestRunner.ts';
import { useState, useEffect, useCallback } from 'react';
import type { TestSuite } from '../types/testing.ts';
import { 
    runTestsInternal,
    subscribeToTestState,
    unsubscribeFromTestState,
    getSharedTestState,
    type TestRunState,
} from '../services/testExecutionService.ts';

export const useTestRunner = () => {
    const [testRun, setTestRun] = useState<TestRunState>(getSharedTestState());

    useEffect(() => {
        subscribeToTestState(setTestRun);
        return () => {
            unsubscribeFromTestState(setTestRun);
        };
    }, []);

    const handleRunTests = useCallback((testSuites?: TestSuite[], isManualRun: boolean = false) => {
        runTestsInternal(testSuites, isManualRun);
    }, []);

    return {
        testStatus: testRun.status,
        testResults: testRun.results,
        totalTests: testRun.totalTests,
        handleRunTests,
    };
};