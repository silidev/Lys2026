const FILE_PATH = 'components/HelpModal.tsx';
import React from 'react';
import { createPortal } from 'react-dom';
import { IconQuestionMarkCircle, IconX } from '../common/components/icons/index.ts';
import { useBodyScrollLock } from '../common/hooks/effects/useBodyScrollLock.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);
  const longPressHandlers = useLongPressTooltip();
  const { t } = useLocalization();

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[60] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <IconQuestionMarkCircle className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0" />
          <h2 id="help-modal-title" className="text-xl font-bold">
            {t('helpModal.title')}
          </h2>
          <button
            id="close-help-modal-button"
            onClick={onClose}
            className="ml-auto p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label={t('helpModal.close')}
            title={t('helpModal.tooltips.close')}
            {...longPressHandlers}
          >
            <IconX className="h-6 w-6" />
          </button>
        </header>

        <div className="p-4 space-y-3 text-gray-700 dark:text-gray-300">
          <p>{t('helpModal.para1')}</p>
          <p>{t('helpModal.para2')}</p>
          <p>{t('helpModal.para3')}</p>
          <p>
            {t('helpModal.para4')}{' '}
            <strong className="font-semibold">{t('helpModal.para4_strong')}</strong>
            {t('helpModal.para4_cont')}
          </p>
        </div>
        
        <footer className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            id="got-it-help-modal-button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-orange-500 transition"
            title={t('helpModal.tooltips.gotIt')}
            {...longPressHandlers}
          >
            {t('helpModal.gotIt')}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default HelpModal;