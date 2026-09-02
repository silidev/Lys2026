const FILE_PATH = 'components/ModeSwitcher.tsx';
import React from 'react';
import { ViewMode } from '../types';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface ModeSwitcherProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange }) => {
  const longPressHandlers = useLongPressTooltip();
  const { t } = useLocalization();
  const getButtonClass = (buttonMode: ViewMode) => {
    const base = "px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center";
    if (mode === buttonMode) {
      return `${base} bg-orange-600 text-white shadow`;
    }
    return `${base} bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`;
  };

  return (
    <div className="flex flex-row space-x-2 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg" role="tablist" aria-label={t('modeSwitcher.aria.label')} aria-orientation="horizontal">
      <button
        role="tab"
        aria-selected={mode === 'home'}
        onClick={() => onModeChange('home')}
        className={getButtonClass('home')}
        id="mode-tab-home"
        aria-controls="shopping-list-panel"
        title={t('modeSwitcher.tooltips.home')}
        {...longPressHandlers}
      >
        {t('modeSwitcher.home')}
      </button>
      <button
        role="tab"
        aria-selected={mode === 'shop'}
        onClick={() => onModeChange('shop')}
        className={getButtonClass('shop')}
        id="mode-tab-shop"
        aria-controls="shopping-list-panel"
        title={t('modeSwitcher.tooltips.shop')}
        {...longPressHandlers}
      >
        {t('modeSwitcher.shop')}
      </button>
    </div>
  );
};

export default ModeSwitcher;