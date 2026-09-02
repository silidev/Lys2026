const FILE_PATH = 'components/AppFooter.tsx';
import React from 'react';
import { versionDate } from '../00alwaysUpdate/version.ts';
import { getAppVersionString, getVersionAgeInDays, formatTimestamp, formatDaysAgo } from '../common/services/versionUtils.ts';
import type { TestResult } from '../common/testing/types/testing.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface AppFooterProps {
    testStatus: 'idle' | 'running' | 'completed';
    testResults: TestResult[];
    totalTests: number | undefined;
    lastBackupTimestamp: number | null;
}

const AppFooter: React.FC<AppFooterProps> = ({ testStatus, testResults, totalTests, lastBackupTimestamp }) => {
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();
    const finishedTests = testResults.length;
    let testDisplay: React.ReactNode = null;

    if (testStatus === 'running' && totalTests && totalTests > 0) {
        testDisplay = (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('appFooter.testsRunning', finishedTests, totalTests)}
            </p>
        );
    } else if (testStatus === 'completed' && totalTests && totalTests > 0) {
        const failedCount = testResults.filter(r => r.status === 'failed').length;
        if (failedCount > 0) {
             testDisplay = (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {t('appFooter.testsFailed', failedCount, totalTests)}
                </p>
             );
        } else {
             testDisplay = (
                <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                    {t('appFooter.testsPassed', totalTests)}
                </p>
             );
        }
    }

    const versionString = getAppVersionString(versionDate);
    const daysAgo = getVersionAgeInDays(versionDate);
    const daysAgoFormatted = daysAgo.toFixed(1);

    const handleReload = (e: React.MouseEvent) => {
        e.preventDefault();
        history.go(0);
    };

    return (
        <footer className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('appFooter.localSave')}
            </p>
            {lastBackupTimestamp ? (
                <p 
                    className="text-xs text-gray-400 dark:text-gray-500 mt-1" 
                    title={t('appFooter.tooltips.lastBackup', formatTimestamp(lastBackupTimestamp))}
                    {...longPressHandlers}
                >
                    {t('appFooter.lastBackup', formatDaysAgo(lastBackupTimestamp, t))}
                </p>
            ) : null}
            {testDisplay}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('appFooter.version', versionString, daysAgoFormatted)}
                {' - '}
                <a 
                    href="#" 
                    onClick={handleReload} 
                    className="hover:underline" 
                    title={t('appFooter.tooltips.reload')}
                    {...longPressHandlers}
                >
                    {t('appFooter.reload')}
                </a>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('appFooter.copyright')}
            </p>
        </footer>
    );
};


export default AppFooter;
