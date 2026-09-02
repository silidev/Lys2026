// components/settings/AutomaticBackup.tsx
import React from 'react';
import { formatDaysAgo, formatTimestamp } from '../../common/services/versionUtils.ts';
import { useLongPressTooltip } from '../../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../../localization/i18n.ts';

interface AutomaticBackupProps {
    backupIntervalHours: number;
    onSetBackupInterval: (hours: number) => void;
    lastBackupTimestamp: number | null;
}

const AutomaticBackup: React.FC<AutomaticBackupProps> = ({ backupIntervalHours, onSetBackupInterval, lastBackupTimestamp }) => {
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();
    const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
         if (e.target.value === '' || (!isNaN(value) && value >= 0)) {
            onSetBackupInterval(isNaN(value) ? 0 : value);
         }
      };

    return (
        <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">{t('autoBackupSettings.title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {t('autoBackupSettings.description')}
            </p>
            <div className="flex items-center gap-2">
                <label htmlFor="backup-interval" className="text-sm text-gray-600 dark:text-gray-300">{t('autoBackupSettings.label')}</label>
                <input
                    type="number"
                    id="backup-interval"
                    value={backupIntervalHours}
                    onChange={handleIntervalChange}
                    min="0"
                    className="w-20 p-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none transition dark:text-white"
                    aria-label={t('autoBackupSettings.label')}
                    title={t('autoBackupSettings.tooltips.interval')}
                    {...longPressHandlers}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{t('autoBackupSettings.hours')}</span>
            </div>
            {lastBackupTimestamp ? (
                <p 
                    className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic" 
                    title={t('autoBackupSettings.tooltips.lastBackup', formatTimestamp(lastBackupTimestamp))}
                    {...longPressHandlers}
                >
                    {t('autoBackupSettings.lastBackup', formatDaysAgo(lastBackupTimestamp, t))}
                </p>
            ) : null}
        </section>
    );
};

export default AutomaticBackup;
