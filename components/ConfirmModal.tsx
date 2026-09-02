const FILE_PATH = 'components/ConfirmModal.tsx';
import React from 'react';
import { createPortal } from 'react-dom';
import { IconAlertTriangle } from '../common/components/icons/index.ts';
import { useBodyScrollLock } from '../common/hooks/effects/useBodyScrollLock.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText,
  cancelText,
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
}) => {
  useBodyScrollLock(isOpen);
  const longPressHandlers = useLongPressTooltip();
  const { t } = useLocalization();

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return createPortal(
    <div
      id="confirm-modal"
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[60] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <IconAlertTriangle className="h-6 w-6 mr-3 text-yellow-500 flex-shrink-0" />
          <h2 id="confirm-modal-title" className="text-xl font-bold">
            {title}
          </h2>
        </header>

        <div className="p-4 text-gray-700 dark:text-gray-300">
          {children}
        </div>
        
        <footer className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            id="confirm-modal-cancel-button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            title={t('confirmModal.tooltips.cancel')}
            {...longPressHandlers}
          >
            {cancelText ?? t('confirmModal.cancel')}
          </button>
          <button
            id="confirm-modal-confirm-button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ${confirmButtonClass}`}
            title={t('confirmModal.tooltips.confirm')}
            {...longPressHandlers}
          >
            {confirmText ?? t('confirmModal.confirm')}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;