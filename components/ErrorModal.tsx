const FILE_PATH = 'components/ErrorModal.tsx';
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
import { useLocalization } from '../localization/i18n.ts';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  useBodyScrollLock(isOpen);
  const longPressHandlers = useLongPressTooltip();
  const { t } = useLocalization();

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      id="error-modal"
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-[70] p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 border-4 border-red-600 rounded-lg shadow-2xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center p-4 bg-red-600 text-white rounded-t-sm">
          <IconAlertTriangle className="h-7 w-7 mr-3 flex-shrink-0" />
          <h2
            id="error-modal-title"
            className="text-xl font-extrabold"
          >
            {title}
          </h2>
        </header>

        <div className="p-4 space-y-3 text-gray-800 dark:text-gray-100">
          <div
            id="error-modal-message"
            className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-700 rounded-md text-sm font-medium text-red-900 dark:text-red-100 break-words whitespace-pre-wrap"
          >
            {message}
          </div>
        </div>

        <footer className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            id="error-modal-close-button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-red-500 transition"
            title={t('errorModal.tooltips.close')}
            {...longPressHandlers}
          >
            {t('errorModal.close')}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default ErrorModal;
