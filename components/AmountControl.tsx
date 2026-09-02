const FILE_PATH = 'components/AmountControl.tsx';
import React from 'react';
import { IconPlus, IconMinus } from '../common/components/icons/index.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface AmountControlProps {
  amountToDisplay: string | number;
  onIncrease: () => void;
  onDecrease: () => void;
  displayName: string;
  id?: string;
}

const AmountControl: React.FC<AmountControlProps> = ({ amountToDisplay, onIncrease, onDecrease, displayName, id }) => {
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();

    return (
        <div className="relative z-20 flex items-center gap-0.5 text-gray-700 dark:text-gray-200 flex-shrink-0">
            <button
                id={id ? `${id}-increase` : undefined}
                type="button"
                onClick={onIncrease}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-[0px] transform scale-[1.3]"
                aria-label={t('shoppingListItem.aria.increaseQuantity', displayName)}
                title={t('shoppingListItem.tooltips.increaseQuantity')}
                {...longPressHandlers}
            >
                <IconPlus className="h-4 w-4" />
            </button>
            <input
                id={id}
                type="text"
                readOnly
                value={amountToDisplay}
                className="font-semibold text-center w-10 bg-transparent border-0 focus:ring-0 p-0 text-gray-700 dark:text-gray-200"
                aria-label={t('shoppingListItem.aria.quantity', displayName)}
                title={t('shoppingListItem.tooltips.currentQuantity')}
                {...longPressHandlers}
            />
            <button
                id={id ? `${id}-decrease` : undefined}
                type="button"
                onClick={onDecrease}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 mr-[-5px] transform scale-[1.3]"
                aria-label={t('shoppingListItem.aria.decreaseQuantity', displayName)}
                title={t('shoppingListItem.tooltips.decreaseQuantity')}
                {...longPressHandlers}
            >
                <IconMinus className="h-4 w-4" />
            </button>
        </div>
    );
};

export default AmountControl;