const FILE_PATH = 'components/settings/DataManagement.tsx';
import React from 'react';
import { IconDownload, IconUpload } from '../../common/components/icons/index.ts';
import { useLongPressTooltip } from '../../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../../localization/i18n.ts';

interface DataManagementProps {
    onBackup: () => void;
    onRestore: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onBackup, onRestore }) => {
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();
    return (
        <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">{t('dataManagementSettings.title')}</h3>
            <div className="space-y-2">
                <button
                    onClick={onBackup}
                    className="w-full flex items-center justify-center p-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                    title={t('dataManagementSettings.tooltips.backup')}
                    {...longPressHandlers}
                >
                    <IconDownload className="h-5 w-5 mr-2" />
                    {t('dataManagementSettings.backupNow')}
                </button>
                <button
                    onClick={onRestore}
                    className="w-full flex items-center justify-center p-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-green-500"
                    title={t('dataManagementSettings.tooltips.restore')}
                    {...longPressHandlers}
                >
                    <IconUpload className="h-5 w-5 mr-2" />
                    {t('dataManagementSettings.restoreFromFile')}
                </button>
            </div>
        </section>
    );
};

export default DataManagement;