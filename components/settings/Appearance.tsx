// components/settings/Appearance.tsx
import React from 'react';
import type { Theme } from '../../hooks/useTheme.ts';
import { useLongPressTooltip } from '../../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../../localization/i18n.ts';

interface AppearanceProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const Appearance: React.FC<AppearanceProps> = ({ theme, setTheme }) => {
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();
    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
    };
    
    const getButtonClass = (buttonTheme: Theme) => {
        const base = "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800";
        if (theme === buttonTheme) {
          return `${base} bg-orange-600 text-white`;
        }
        return `${base} bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`;
    };

    return (
        <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">{t('appearanceSettings.title')}</h3>
            <div className="flex space-x-2 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg">
                <button id="theme-light-button" onClick={() => handleThemeChange('light')} className={getButtonClass('light')} title={t('appearanceSettings.tooltips.light')} {...longPressHandlers}>{t('appearanceSettings.light')}</button>
                <button id="theme-dark-button" onClick={() => handleThemeChange('dark')} className={getButtonClass('dark')} title={t('appearanceSettings.tooltips.dark')} {...longPressHandlers}>{t('appearanceSettings.dark')}</button>
                <button id="theme-system-button" onClick={() => handleThemeChange('system')} className={getButtonClass('system')} title={t('appearanceSettings.tooltips.system')} {...longPressHandlers}>{t('appearanceSettings.system')}</button>
            </div>
        </section>
    );
};

export default Appearance;