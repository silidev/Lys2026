const FILE_PATH = 'testing/suites/hooks/useAppTestRunner.test.suite.ts';
import { renderHook, act } from '@testing-library/react';
import sinon from 'sinon';
import { useAppTestRunner } from '../../../hooks/useAppTestRunner.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { TestRunnerConfig } from '../../../00configs/common/testing.ts';

const setupTestRunnerHook = (hasInitialRunFired = true) => {
    const handleRunTestsSpy = sinon.spy();
    const mockUseTestRunner = () => ({
        testStatus: 'idle' as const,
        testResults: [],
        totalTests: 0,
        handleRunTests: handleRunTestsSpy,
    });
    const mockUseTestRunnerSound = () => ({
        handleCloseTestOverlay: sinon.spy(),
    });
    const mockHasInitialRunFired = () => hasInitialRunFired;
    const { result, unmount } = renderHook(() => useAppTestRunner({
        _useTestRunner: mockUseTestRunner,
        _useTestRunnerSound: mockUseTestRunnerSound,
        _hasInitialRunFired: mockHasInitialRunFired,
    }));
    return { result, unmount, handleRunTestsSpy };
};

const testNoReloadOverlayAfterLogicTests = async () => {
    const { result } = setupTestRunnerHook();
    
    assertEquals(result.current.needsReload, false, "Initial needsReload state should be false");

    // Simulate a logic test run being initiated. This sets lastRunSuiteType='logic'
    act(() => {
        result.current.rerunLogicTests();
    });
    
    // After rerunLogicTests, `lastRunSuiteType` is 'logic'.
    // Now simulate the overlay being closed.
    act(() => {
        result.current.handleCloseTestOverlay();
    });

    // Since we ran logic tests, it should remain false.
    assertEquals(result.current.needsReload, false, "needsReload should be false after logic tests");
};

const testReloadOverlayAfterUITests = async () => {
    const { result } = setupTestRunnerHook();
    
    assertEquals(result.current.needsReload, false, "Initial needsReload state should be false");

    // Simulate a UI test run being initiated. This sets lastRunSuiteType='ui'
    act(() => {
        result.current.runUITests();
    });
    
    // After runUITests, `lastRunSuiteType` is 'ui'.
    // Now simulate the overlay being closed.
    act(() => {
        result.current.handleCloseTestOverlay();
    });

    // Since we ran UI tests, it should be true.
    assertEquals(result.current.needsReload, true, "needsReload should be true after UI tests");
};

const testNoReloadOverlayWhenUITestsSkippedOnLoadViaFlag = async (_user: User, mockStorage: MockStorageService) => {
    // This is the key condition for the test: the flag is set.
    mockStorage.setItem('disableRunningUiTestsOnDesktopLoadOnce', true);

    // Allow the hook's useEffect to run by deleting the flag set by the test helper
    if (window.__initialRunLogicHasStarted) {
        delete window.__initialRunLogicHasStarted;
    }

    const { result, unmount } = setupTestRunnerHook(false);

    const originalLog = console.log;
    console.log = sinon.spy();

    // Wait for the setTimeout in the hook's useEffect to complete
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
    });

    console.log = originalLog;
    
    assertEquals(result.current.needsReload, false, "needsReload should be false initially");

    // Simulate the user closing the test overlay.
    act(() => {
        result.current.handleCloseTestOverlay();
    });

    // Because `lastRunSuiteType` was 'logic', `needsReload` should remain false.
    assertEquals(result.current.needsReload, false, "needsReload should be false when initial UI tests are skipped via flag");
    
    // The hook should also remove the flag from storage after reading it.
    assertEquals(mockStorage.getItem('disableRunningUiTestsOnDesktopLoadOnce'), null);

    unmount();
};

const testDisablesAllTestsOnMobile = async (_user: User) => {
    const userAgentStub = sinon.stub(window.navigator, 'userAgent').value('Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1');
    const { handleRunTestsSpy, unmount } = setupTestRunnerHook(false);

    // The hook's useEffect has a timeout before running tests.
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Since TestRunnerConfig.disablesTestsOnMobile is true, no tests should run.
    // This will fail with the current implementation.
    const shouldRunTests = !TestRunnerConfig.disablesTestsOnMobile;
    assertEquals(handleRunTestsSpy.called, shouldRunTests, "handleRunTests should not be called on mobile when tests are disabled in config.");

    unmount();
    userAgentStub.restore();
};

export function useAppTestRunnerTestSuite() {
    const SUITE_NAME = useAppTestRunnerTestSuite.name;
    return [
        runComponentTest(
            'useAppTestRunner: needsReload should be false after logic tests',
            testNoReloadOverlayAfterLogicTests,
            SUITE_NAME,
            FILE_PATH
        ),
        runComponentTest(
            'useAppTestRunner: needsReload should be true after UI tests',
            testReloadOverlayAfterUITests,
            SUITE_NAME,
            FILE_PATH
        ),
        runComponentTest(
            'useAppTestRunner: no reload overlay when UI tests skipped on load via flag',
            testNoReloadOverlayWhenUITestsSkippedOnLoadViaFlag,
            SUITE_NAME,
            FILE_PATH
        ),
        runComponentTest(
            'useAppTestRunner: should not run any tests on mobile when disabled in config',
            testDisablesAllTestsOnMobile,
            SUITE_NAME,
            FILE_PATH
        ),
    ];
}