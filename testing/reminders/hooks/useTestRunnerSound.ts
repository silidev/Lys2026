const FILE_PATH = 'testing/reminders/hooks/useTestRunnerSound.ts';
import { useEffect, useRef, useCallback } from 'react';
import { speak } from '../../../sound/index.ts';
import { TtsRemindersConfig } from '../config.ts';
import { usePrevious } from '../../../common/hooks/effects/usePrevious.ts';
import type { TestResult } from '../../../common/testing/types/testing.ts';
import { TestRunnerConfig } from '../../../00configs/common/testing.ts';

interface UseTestRunnerSoundProps {
    testStatus: 'idle' | 'running' | 'completed';
    testResults: TestResult[];
    setShowTestOverlay: (show: boolean) => void;
}

export const useTestRunnerSound = ({ testStatus, testResults, setShowTestOverlay }: UseTestRunnerSoundProps) => {
    const repeatSoundTimeoutRef = useRef<number | null>(null);
    const initialSoundTimeoutRef = useRef<number | null>(null);
    const prevTestStatus = usePrevious(testStatus);
    const failedTests = testResults.filter(r => r.status === 'failed');

    const handlePlayTestSound = useCallback(async (volume: number = 1) => {
        if (failedTests.length > 0) {
            await speak(TtsRemindersConfig.testFailureTTS, 'de-DE', volume);
        } else {
            await speak(TtsRemindersConfig.testSuccessTTS, 'de-DE', volume);
        }
    }, [failedTests.length]);
    
    const clearTimeouts = useCallback(() => {
        if (repeatSoundTimeoutRef.current) {
            clearTimeout(repeatSoundTimeoutRef.current);
            repeatSoundTimeoutRef.current = null;
        }
        if (initialSoundTimeoutRef.current) {
            clearTimeout(initialSoundTimeoutRef.current);
            initialSoundTimeoutRef.current = null;
        }
    }, []);

    const handleCloseTestOverlay = useCallback(() => {
        setShowTestOverlay(false);
        clearTimeouts();
    }, [setShowTestOverlay, clearTimeouts]);

    useEffect(() => {
        if (prevTestStatus === 'running' && testStatus === 'completed') {
            clearTimeouts(); // Clear any previous timers, just in case

            const isSuccess = failedTests.length === 0;
            if (isSuccess && TestRunnerConfig.disableRunningUiTestsOnDesktopLoad) {
                // Do not show the success overlay when logic test suites succeed and UI tests on desktop load are disabled
                return;
            }

            setShowTestOverlay(true);
            
            initialSoundTimeoutRef.current = window.setTimeout(() => {
                handlePlayTestSound(1.0); // Play initial sound
                
                const reducedVolume = 1 - (TtsRemindersConfig.ttsRepeatVolumeReductionPercent / 100);
                let currentDelay = TtsRemindersConfig.initialTtsRepeatIntervalS * 1000;

                const scheduleNextSound = () => {
                    repeatSoundTimeoutRef.current = window.setTimeout(() => {
                        handlePlayTestSound(reducedVolume);
                        currentDelay *= TtsRemindersConfig.ttsRepeatIntervalMultiplier; // The interval escalates.
                        scheduleNextSound();
                    }, currentDelay);
                };
                
                scheduleNextSound();
            }, TtsRemindersConfig.initialTTSSoundDelayS * 1000);
        }
    }, [testStatus, prevTestStatus, handlePlayTestSound, setShowTestOverlay, clearTimeouts]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimeouts();
        }
    }, [clearTimeouts]);

    return { handleCloseTestOverlay };
};