const FILE_PATH = 'components/SettingsModal.tsx';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingListData, ViewMode } from '../types';
import type { Theme } from '../hooks/useTheme';
import { IconX } from '../common/components/icons/index.ts';
import AutomaticBackup from './settings/AutomaticBackup.tsx';
import Appearance from './settings/Appearance.tsx';
import CategoryManagement from './settings/CategoryManagement.tsx';
import { useBodyScrollLock } from '../common/hooks/effects/useBodyScrollLock.ts';
import AdvancedFeatures from './settings/AdvancedFeatures.tsx';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  backupData: ShoppingListData;
  onReorderCategory: (sourceIndex: number, destinationIndex: number, mode: ViewMode) => void;
  onAddCategory: (name: string, mode: ViewMode) => void;
  onDeleteCategory: (categoryId: string, mode: ViewMode) => void;
  onUpdateCategoryName: (categoryId: string, newName: string, mode: ViewMode) => void;
  backupIntervalHours: number;
  onSetBackupInterval: (hours: number) => void;
  lastBackupTimestamp: number | null;
  newItemDefaultCompleted: boolean;
  onSetNewItemDefaultCompleted: (value: boolean) => void;
  advancedMode: boolean;
  onSetAdvancedMode: (value: boolean) => void;
  enableSplitItemNames: boolean;
  onSetEnableSplitItemNames: (value: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, setTheme, backupData, onReorderCategory, onAddCategory, onDeleteCategory, onUpdateCategoryName, backupIntervalHours, onSetBackupInterval, lastBackupTimestamp, newItemDefaultCompleted, onSetNewItemDefaultCompleted, advancedMode, onSetAdvancedMode, enableSplitItemNames, onSetEnableSplitItemNames }) => {
  useBodyScrollLock(isOpen);
  const longPressHandlers = useLongPressTooltip();
  const { t } = useLocalization();
  
  useEffect(() => {
    // This effect handles the browser's back button.
    if (isOpen) {
      // Push a state when the modal opens.
      window.history.pushState({ lysSettingsOpen: true }, '');
      const handlePopState = () => {
        // When the user navigates back, popstate fires. We close the modal.
        onClose();
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

  const handleLocalClose = () => {
    // To close the modal (e.g., via the X button), we navigate back.
    // This triggers the popstate listener, which then calls onClose, ensuring
    // a single, consistent way of closing the modal.
    if (window.history.state?.lysSettingsOpen) {
      window.history.back();
    } else {
      // Failsafe in case history state is not as expected.
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 id="settings-title" className="text-xl font-bold">{t('settingsModal.title')}</h2>
          <button
            id="close-settings-modal-button"
            onClick={handleLocalClose}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label={t('settingsModal.close')}
            title={t('settingsModal.tooltips.close')}
            {...longPressHandlers}
          >
            <IconX className="h-6 w-6" />
          </button>
        </header>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <Appearance theme={theme} setTheme={setTheme} />

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <CategoryManagement
            backupData={backupData}
            onReorderCategory={onReorderCategory}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
            onUpdateCategoryName={onUpdateCategoryName}
          />
          
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <AutomaticBackup backupIntervalHours={backupIntervalHours} onSetBackupInterval={onSetBackupInterval} lastBackupTimestamp={lastBackupTimestamp} />
          
          <AdvancedFeatures
            defaultValue={newItemDefaultCompleted}
            onDefaultValueChange={onSetNewItemDefaultCompleted}
            advancedMode={advancedMode}
            onAdvancedModeChange={onSetAdvancedMode}
            enableSplitItemNames={enableSplitItemNames}
            onEnableSplitItemNamesChange={onSetEnableSplitItemNames}
           />

        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;