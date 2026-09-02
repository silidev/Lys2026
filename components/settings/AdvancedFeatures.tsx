const FILE_PATH = 'components/settings/AdvancedFeatures.tsx';
import React from 'react';
import { useLongPressTooltip } from '../../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../../localization/i18n.ts';

interface AdvancedFeaturesProps {
  defaultValue: boolean;
  onDefaultValueChange: (value: boolean) => void;
  advancedMode: boolean;
  onAdvancedModeChange: (value: boolean) => void;
  enableSplitItemNames: boolean;
  onEnableSplitItemNamesChange: (value: boolean) => void;
}

const AdvancedFeatures: React.FC<AdvancedFeaturesProps> = ({ defaultValue, onDefaultValueChange, advancedMode, onAdvancedModeChange, enableSplitItemNames, onEnableSplitItemNamesChange }) => {
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();
    return (
        <section>
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">{t('advancedFeaturesSettings.title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {t('advancedFeaturesSettings.description')}
            </p>
            <div className="flex items-start mb-2">
                <input
                    id="advanced-mode-checkbox"
                    type="checkbox"
                    checked={advancedMode}
                    onChange={(e) => onAdvancedModeChange(e.target.checked)}
                    className="h-4 w-4 mt-1 flex-shrink-0 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    title={t('advancedFeaturesSettings.tooltips.advancedMode')}
                    {...longPressHandlers}
                />
                <label
                    htmlFor="advanced-mode-checkbox"
                    className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                    title={t('advancedFeaturesSettings.tooltips.advancedMode')}
                    {...longPressHandlers}
                >
                    {t('advancedFeaturesSettings.advancedMode')}
                </label>
            </div>
            <div className="flex items-start">
                <input
                    id="new-item-default-completed"
                    type="checkbox"
                    checked={defaultValue}
                    onChange={(e) => onDefaultValueChange(e.target.checked)}
                    className="h-4 w-4 mt-1 flex-shrink-0 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    title={t('advancedFeaturesSettings.tooltips.checkOnReset')}
                    {...longPressHandlers}
                />
                <label
                    htmlFor="new-item-default-completed"
                    className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                    title={t('advancedFeaturesSettings.tooltips.checkOnReset')}
                    {...longPressHandlers}
                >
                    {t('advancedFeaturesSettings.checkOnReset')}
                </label>
            </div>
            <div className="flex items-start mt-2">
                <input
                    id="enable-split-item-names"
                    type="checkbox"
                    checked={enableSplitItemNames}
                    onChange={(e) => onEnableSplitItemNamesChange(e.target.checked)}
                    className="h-4 w-4 mt-1 flex-shrink-0 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    title={t('advancedFeaturesSettings.tooltips.enableSplitItemNames')}
                    {...longPressHandlers}
                />
                <label
                    htmlFor="enable-split-item-names"
                    className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                    title={t('advancedFeaturesSettings.tooltips.enableSplitItemNames')}
                    {...longPressHandlers}
                >
                    {t('advancedFeaturesSettings.enableSplitItemNames')}
                </label>
            </div>
        </section>
    );
};

export default AdvancedFeatures;