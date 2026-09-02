const FILE_PATH = 'components/ReloadOverlay.tsx';
import React from 'react';
import { createPortal } from 'react-dom';
import storageService from '../common/services/storageService.ts';
import { useBodyScrollLock } from '../common/hooks/effects/useBodyScrollLock.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

const ReloadOverlay: React.FC = () => {
    useBodyScrollLock(true);
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();

    const handleDisableUiTestsOnce = () => {
        storageService.setItem('disableRunningUiTestsOnDesktopLoadOnce', true);
        history.go(0);
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex flex-col justify-center items-center z-[100] gap-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reload-title"
        >
            <div className="text-center text-white">
                <h2 id="reload-title" className="text-3xl font-bold">
                    {t('reloadOverlay.title')}
                </h2>
            </div>
            <button
                id="reload-disable-ui-tests-once-button"
                onClick={handleDisableUiTestsOnce}
                className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-md shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-yellow-400 transition-colors"
                title={t('reloadOverlay.tooltip')}
                {...longPressHandlers}
            >
                {t('reloadOverlay.button')}
            </button>
        </div>,
        document.body
    );
};

export default ReloadOverlay;