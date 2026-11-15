const FILE_PATH = 'components/StartupFindingsModal.tsx';
import React from 'react';
import { createPortal } from 'react-dom';
import {
  IconAlertTriangle,
} from '../common/components/icons/index.ts';
import {
  useBodyScrollLock,
} from '../common/hooks/effects/useBodyScrollLock.ts';
import {
  useLongPressTooltip,
} from '../common/longPressTooltip/LongPressProvider.tsx';
import type {
  FindingSeverity,
  StartupFinding,
} from '../common/services/localStorageAuditTypes.ts';
import { useLocalization } from '../localization/i18n.ts';

interface StartupFindingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  findings: StartupFinding[];
}

const ROW_STYLES: Record<FindingSeverity, string> = {
  info:
    'bg-blue-50 dark:bg-blue-950/60 border-blue-300 ' +
    'dark:border-blue-700 text-blue-900 dark:text-blue-100',
  warning:
    'bg-amber-50 dark:bg-amber-950/60 border-amber-300 ' +
    'dark:border-amber-700 text-amber-900 dark:text-amber-100',
  error:
    'bg-red-50 dark:bg-red-950/60 border-red-300 ' +
    'dark:border-red-700 text-red-900 dark:text-red-100',
};

const BADGE_STYLES: Record<FindingSeverity, string> = {
  info: 'bg-blue-600 text-white',
  warning: 'bg-amber-600 text-white',
  error: 'bg-red-600 text-white',
};

const StartupFindingsModal: React.FC<
  StartupFindingsModalProps
> = ({ isOpen, onClose, findings }) => {
  useBodyScrollLock(isOpen);
  const longPressHandlers = useLongPressTooltip();
  const { t } = useLocalization();

  if (!isOpen || findings.length === 0) {
    return null;
  }

  return createPortal(
    <div
      id="startup-findings-modal"
      className={
        'fixed inset-0 bg-black bg-opacity-70 ' +
        'backdrop-blur-sm flex justify-center ' +
        'items-center z-[70] p-4'
      }
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="startup-findings-title"
    >
      <div
        className={
          'bg-white dark:bg-gray-800 border-2 ' +
          'border-orange-500 rounded-lg shadow-2xl ' +
          'w-full max-w-lg max-h-[85vh] flex flex-col'
        }
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className={
            'flex items-center p-4 bg-orange-500 ' +
            'text-white rounded-t-sm'
          }
        >
          <IconAlertTriangle
            className="h-6 w-6 mr-3 flex-shrink-0"
          />
          <h2
            id="startup-findings-title"
            className="text-lg font-extrabold"
          >
            {t('startupModal.title')}
          </h2>
        </header>

        <div
          className={
            'p-4 space-y-3 overflow-y-auto ' +
            'text-gray-800 dark:text-gray-100'
          }
        >
          <p className="text-sm font-medium">
            {t('startupModal.subtitle')}
          </p>
          <ul
            id="startup-findings-list"
            className="space-y-2 text-xs"
          >
            {findings.map((finding, idx) => (
              <li
                key={`${finding.severity}-${idx}`}
                className={
                  'p-2.5 border rounded-md break-words ' +
                  ROW_STYLES[finding.severity]
                }
              >
                <span
                  className={
                    'inline-block px-1.5 py-0.5 mr-2 ' +
                    'rounded font-bold uppercase text-[10px] ' +
                    BADGE_STYLES[finding.severity]
                  }
                >
                  {t(`startupModal.severity.${finding.severity}`)}
                </span>
                <span className="font-medium">
                  {finding.message}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <footer
          className={
            'flex justify-end p-4 border-t ' +
            'border-gray-200 dark:border-gray-700'
          }
        >
          <button
            id="startup-findings-ok-button"
            onClick={onClose}
            className={
              'px-5 py-2 text-sm font-bold bg-orange-500 ' +
              'text-white rounded-md hover:bg-orange-600 ' +
              'focus:outline-none focus:ring-2 ' +
              'focus:ring-offset-2 focus:ring-orange-500 ' +
              'dark:focus:ring-offset-gray-800 transition'
            }
            title={t('startupModal.tooltips.ok')}
            {...longPressHandlers}
          >
            {t('startupModal.ok')}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default StartupFindingsModal;
