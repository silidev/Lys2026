const FILE_PATH = 'components/TestResultOverlay.tsx';
import React, { useState, useCallback, useEffect, useRef }from 'react';
import { createPortal } from 'react-dom';
import type { TestResult } from '../common/testing/types/testing.ts';
import { generateFullTestLog } from '../common/testing/services/testLogService.ts';
import { IconCheck, IconAlertTriangle, IconX, IconDuplicate, IconCpuChip, IconReload } from '../common/components/icons/index.ts';
import { useBodyScrollLock } from '../common/hooks/effects/useBodyScrollLock.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface TestResultOverlayProps {
  results: TestResult[];
  onClose: () => void;
  onRunUITests?: () => void;
  lastRunSuiteType: 'logic' | 'ui';
}

const TestResultOverlay: React.FC<TestResultOverlayProps> = ({ results, onClose, onRunUITests, lastRunSuiteType }) => {
  useBodyScrollLock(true);
  const longPressHandlers = useLongPressTooltip();
  const { t } = useLocalization();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const failedTests = results.filter(r => r.status === 'failed');
  const hasFailed = failedTests.length > 0;
  const passedTestsCount = results.length - failedTests.length;
  const logText = generateFullTestLog(results);
  
  const handleCopyLog = useCallback(() => {
    if (isCopied) return;
    navigator.clipboard.writeText(logText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch((err: unknown) => {
      console.error("Failed to copy log from overlay:", err);
      alert("Could not copy log to clipboard.");
    });
  }, [logText, isCopied]);

  const handleReload = useCallback(() => {
    history.go(0);
  }, []);

  const handleCloseButton = useCallback(() => {
    if (!hasFailed) {
      history.back();
    } else {
      onClose();
    }
  }, [hasFailed, onClose]);

  const handleRunUITestsAndClose = useCallback(() => {
    if (onRunUITests) {
      history.back();
      onRunUITests();
    }
  }, [onRunUITests]);

  useEffect(() => {
    if (hasFailed) {
      return;
    }

    // Auto-focus the overlay so key events are captured immediately.
    overlayRef.current?.focus();

    history.pushState(null, '', window.location.href);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
      }
      if (event.key === 'Escape') {
        history.back();
      } else if (onRunUITests) {
        handleRunUITestsAndClose();
      }
    };

    const handlePopState = () => {
      onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasFailed, onClose, onRunUITests, handleRunUITestsAndClose]);


  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    handleCloseButton();
  };

  const bgColor = hasFailed ? 'bg-red-800/95' : 'bg-green-800/95';
  const headerText = hasFailed ? t('testResultOverlay.failedTitle') : t('testResultOverlay.passedTitle', passedTestsCount);
  const Icon = hasFailed ? IconAlertTriangle : IconCheck;

  const overlayContent = (
    <div
      ref={overlayRef}
      tabIndex={-1}
      className={`
        fixed inset-0 z-50 flex flex-col p-4 sm:p-6
        text-white ${bgColor} animate-fade-in-up outline-none
      `}
      role="dialog"
      aria-labelledby="test-overlay-title"
      aria-modal="true"
      onContextMenu={handleContextMenu}
    >
      <header className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Icon className="w-8 h-8 mr-3 flex-shrink-0" />
          <div>
            <h2 id="test-overlay-title" className="text-2xl font-bold">{headerText}</h2>
            {hasFailed && <p>{t('testResultOverlay.failedMessage', failedTests.length, results.length)}</p>}
          </div>
        </div>
        <button
          id="close-test-overlay-button"
          onClick={handleCloseButton}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label={t('testResultOverlay.close')}
          title={t('testResultOverlay.tooltips.close')}
          {...longPressHandlers}
        >
          <IconX className="w-7 h-7" />
        </button>
      </header>
      
      <div className="flex-1 bg-black/50 rounded-lg p-3 overflow-y-auto">
        <pre className="text-sm font-mono whitespace-pre-wrap break-words select-text">
          {logText}
        </pre>
      </div>

      <footer className="mt-4 flex justify-end gap-2">
        {lastRunSuiteType === 'ui' && !hasFailed ? (
            <button
                id="reload-test-overlay-button"
                onClick={handleReload}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                title={t('testResultOverlay.tooltips.reload')}
                {...longPressHandlers}
            >
                <IconReload className="w-5 h-5 mr-2" />
                {t('testResultOverlay.reload')}
            </button>
        ) : (
            onRunUITests && (
                <button
                    id="run-ui-tests-overlay-button"
                    onClick={hasFailed ? onRunUITests : handleRunUITestsAndClose}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    title={t('testResultOverlay.tooltips.runUITests')}
                    {...longPressHandlers}
                >
                    <IconCpuChip className="w-5 h-5 mr-2" />
                    {t('testResultOverlay.runUITests')}
                </button>
            )
        )}
        <button
          id="copy-log-overlay-button"
          onClick={handleCopyLog}
          disabled={isCopied}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-70 transition-colors"
          title={t('testResultOverlay.tooltips.copyLog')}
          {...longPressHandlers}
        >
          <IconDuplicate className="w-5 h-5 mr-2" />
          {isCopied ? t('testResultOverlay.logCopied') : t('testResultOverlay.copyLog')}
        </button>
      </footer>
    </div>
  );

  return createPortal(overlayContent, document.body);
};

export default TestResultOverlay;