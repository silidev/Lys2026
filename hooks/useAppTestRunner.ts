// hooks/useAppTestRunner.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTestRunner } from '../common/testing/index.ts';
import { allTestSuites, uiTestSuites } from '../testing/index.ts';
import { useTestRunnerSound } from '../testing/reminders/hooks/useTestRunnerSound.ts';
import { TestRunnerConfig } from '../00configs/common/testing.ts';
import type { TestSuite } from '../common/testing/types/testing.ts';
import storageService from '../common/services/storageService.ts';
import { hasInitialRunFired } from '../common/testing/services/testExecutionService.ts';

declare global {
  interface Window {
    __initialRunLogicHasStarted?: boolean;
  }
}

interface UseAppTestRunnerProps {
    _useTestRunner?: typeof useTestRunner;
    _useTestRunnerSound?: typeof useTestRunnerSound;
    _hasInitialRunFired?: typeof hasInitialRunFired;
}

export const useAppTestRunner = ({
    _useTestRunner = useTestRunner,
    _useTestRunnerSound = useTestRunnerSound,
    _hasInitialRunFired = hasInitialRunFired,
}: UseAppTestRunnerProps = {}) => {
    const { testStatus, testResults, totalTests, handleRunTests } = _useTestRunner();
    const [showTestOverlay, setShowTestOverlay] = useState(false);
    const [lastRunSuiteType, setLastRunSuiteType] = useState<'logic' | 'ui'>('logic');
    const [needsReload, setNeedsReload] = useState(false);
    const [isUiTestCountdownActive, setIsUiTestCountdownActive] = useState(false);
    const automaticUiTestTimerRef = useRef<number | null>(null);
    const suitesForUiCountdownRef = useRef<TestSuite[]>([]);

    const startScheduledUiTestsNow = useCallback(() => {
        if (automaticUiTestTimerRef.current) {
            clearTimeout(automaticUiTestTimerRef.current);
            automaticUiTestTimerRef.current = null;
        }
        if (suitesForUiCountdownRef.current.length > 0) {
            handleRunTests(suitesForUiCountdownRef.current, false);
        }
        setIsUiTestCountdownActive(false);
        suitesForUiCountdownRef.current = [];
    }, [handleRunTests]);

    const cancelAutomaticUiTests = useCallback(() => {
        if (automaticUiTestTimerRef.current) {
            clearTimeout(automaticUiTestTimerRef.current);
            automaticUiTestTimerRef.current = null;
        }
        setIsUiTestCountdownActive(false);
        suitesForUiCountdownRef.current = [];
        console.log("Automatic UI test run cancelled by user.");
    }, []);

    useEffect(() => {
        if (_hasInitialRunFired() || window.__initialRunLogicHasStarted) {
            return;
        }
        window.__initialRunLogicHasStarted = true;

        const isMobile = /Mobi/i.test(window.navigator.userAgent);

        if (isMobile && TestRunnerConfig.disablesTestsOnMobile) {
            console.log("Tests disabled on mobile device as per configuration.");
            return;
        }
        
        const disableOnce = storageService.getItem<boolean>('disableRunningUiTestsOnDesktopLoadOnce');
        if (disableOnce) {
            storageService.removeItem('disableRunningUiTestsOnDesktopLoadOnce');
        }

        const suitesToRun: TestSuite[] = [...allTestSuites];
        let suiteType: 'logic' | 'ui' = 'logic';
        
        const shouldRunUiTests = !isMobile && !TestRunnerConfig.disableRunningUiTestsOnDesktopLoad && !disableOnce;

        if (shouldRunUiTests) {
            console.log("Including UI tests in automatic run as per TestRunnerConfig.");
            suitesToRun.push(...uiTestSuites);
            suiteType = 'ui';
        } else if (disableOnce) {
            console.log("UI tests disabled for this load due to one-time flag.");
        }

        // Run tests once on app load
        const runTheTests = () => {
          console.log(`useAppTestRunner: Starting tests with ${suitesToRun.length} suites of type '${suiteType}'.`);
          setLastRunSuiteType(suiteType);
          
          if (suiteType === 'ui' && TestRunnerConfig.automaticUiTestDelayS > 0) {
              setIsUiTestCountdownActive(true);
              suitesForUiCountdownRef.current = suitesToRun;
              automaticUiTestTimerRef.current = window.setTimeout(() => {
                  startScheduledUiTestsNow();
              }, TestRunnerConfig.automaticUiTestDelayS * 1000);
          } else {
              handleRunTests(suitesToRun, false);
          }
        };
        
        // Run tests unconditionally after a short delay to allow UI to render.
        setTimeout(runTheTests, 100);

    }, [handleRunTests, _hasInitialRunFired, startScheduledUiTestsNow]);

    const { handleCloseTestOverlay: baseCloseTestOverlay } = _useTestRunnerSound({
        testStatus,
        testResults,
        setShowTestOverlay,
    });

    const handleCloseAndShowReload = useCallback(() => {
        baseCloseTestOverlay();
        if (lastRunSuiteType === 'ui') {
            setNeedsReload(true);
        }
    }, [baseCloseTestOverlay, lastRunSuiteType]);

    const rerunLogicTests = useCallback(() => {
        baseCloseTestOverlay();
        setLastRunSuiteType('logic');
        // Delay to allow UI to update before blocking with tests
        setTimeout(() => handleRunTests(allTestSuites, true), 100);
    }, [baseCloseTestOverlay, handleRunTests]);

    const runUITests = useCallback(() => {
        baseCloseTestOverlay();
        setLastRunSuiteType('ui');
        setTimeout(() => handleRunTests(uiTestSuites, true), 100);
    }, [baseCloseTestOverlay, handleRunTests]);

    return {
        testStatus,
        testResults,
        totalTests,
        showTestOverlay,
        lastRunSuiteType,
        rerunLogicTests,
        runUITests,
        handleCloseTestOverlay: handleCloseAndShowReload,
        needsReload,
        isUiTestCountdownActive,
        cancelAutomaticUiTests,
        startScheduledUiTestsNow,
    };
};
