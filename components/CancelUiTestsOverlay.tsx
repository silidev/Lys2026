const FILE_PATH = 'components/CancelUiTestsOverlay.tsx';
import React from 'react';
import { createPortal } from 'react-dom';
import { TestRunnerConfig } from '../00configs/common/testing.ts';
import { useBodyScrollLock } from '../common/hooks/effects/useBodyScrollLock.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface CancelUiTestsOverlayProps {
    onCancel: () => void;
    onStartNow: () => void;
}

const CancelUiTestsOverlay: React.FC<CancelUiTestsOverlayProps> = ({ onCancel, onStartNow }) => {
    useBodyScrollLock(true);
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();
    
    return createPortal(
        <div
            className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex flex-col justify-center items-center z-[100] gap-4 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-ui-tests-title"
        >
            <div className="text-center text-white">
                <h2 id="cancel-ui-tests-title" className="text-3xl font-bold">
                    {t('cancelUITestsOverlay.title')}
                </h2>
                <p className="mt-2 text-lg">
                    {t('cancelUITestsOverlay.message', TestRunnerConfig.automaticUiTestDelayS)}
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    id="start-ui-tests-now-button"
                    onClick={onStartNow}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-500 transition-colors text-lg"
                    title={t('cancelUITestsOverlay.tooltips.startNow')}
                    {...longPressHandlers}
                >
                    {t('cancelUITestsOverlay.startNow')}
                </button>
                <button
                    id="cancel-ui-tests-button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-md shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 transition-colors text-lg"
                    title={t('cancelUITestsOverlay.tooltips.cancel')}
                    {...longPressHandlers}
                >
                    {t('cancelUITestsOverlay.cancel')}
                </button>
            </div>
        </div>,
        document.body
    );
};

export default CancelUiTestsOverlay;