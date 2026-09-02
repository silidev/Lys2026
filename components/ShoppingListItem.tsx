import React, { useState } from 'react';
import { ShoppingListItem as ShoppingListItemType, ViewMode } from '../types';
import { IconChevronUp, IconChevronDown, IconPencil } from '../common/components/icons/index.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';
import { AppConfig } from '../00configs/app.ts';
import AmountControl from './AmountControl.tsx';
import { getDisplayName } from '../common/services/itemService.ts';
import ClickableText from './ClickableText.tsx';

interface ShoppingListItemProps {
  item: ShoppingListItemType;
  index: number;
  onUpdateAmount: (id: string, delta: number) => void;
  onToggleItemCompleted: (id: string) => void;
  onOpenEditModal: (id: string, categoryId: string) => void;
  onDragStart: (
    e: React.DragEvent<HTMLLIElement>,
    categoryId: string,
    index: number
  ) => void;
  onDrop: (
    e: React.DragEvent<HTMLLIElement>,
    categoryId: string,
    index: number
  ) => void;
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  isDragging: boolean;
  currentCategoryId: string;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  mode: ViewMode;
  onOpenMoveModal: (id: string, categoryId: string) => void;
  isUncategorized: boolean;
  onSelectItem?: (id: string) => void;
  showMoveControls?: boolean;
}

const ShoppingListItemComponent: React.FC<ShoppingListItemProps> = ({
  item,
  index,
  onUpdateAmount,
  onToggleItemCompleted,
  onOpenEditModal,
  onDragStart,
  onDrop,
  onDragEnd,
  isDragging,
  currentCategoryId,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  mode,
  onOpenMoveModal,
  isUncategorized,
  onSelectItem,
  showMoveControls = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const longPressHandlers = useLongPressTooltip();
  const { t } = useLocalization();

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const opacityClass = isDragging ? 'opacity-50' : 'opacity-100';
  const dropIndicatorClass = isDragOver
    ? 'border-t-2 border-orange-500'
    : 'border-t-transparent';

  const getDisplayAmount = (item: ShoppingListItemType): string | number => {
    if (item.amount) {
        return item.amount;
    }
    return 1;
  };

  const displayAmount = getDisplayAmount(item);
  const displayName = getDisplayName(item, mode);
  
  const borderClass = item.defaultCompleted ? 'border-2 border-yellow-400 dark:border-yellow-500' : 'border border-gray-200 dark:border-gray-700';
  const isCompleted = item.amount === '0';


  return (
    <li
      aria-labelledby={`item-name-${item.id}`}
      data-id={item.id}
      draggable="true"
      onDragStart={(e) => onDragStart(e, currentCategoryId, index)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        e.stopPropagation();
        setIsDragOver(false);
        onDrop(e, currentCategoryId, index)
      }}
      onDragEnd={onDragEnd}
      onTouchMove={(e) => {
        if (isDragging) {
          e.preventDefault();
        }
       }}
      className={`
        flex items-center justify-between py-${AppConfig.listItemInternalPaddingVerticalUnit} pr-${AppConfig.listItemRightPaddingUnit}
        rounded-lg bg-white
        shadow-sm transition-all duration-300
        hover:shadow-md
        dark:bg-gray-900/50 ${opacityClass} ${dropIndicatorClass} ${borderClass}
      `}
    >
      <div className={`flex flex-grow items-center gap-0 mr-1 px-${AppConfig.listItemInternalPaddingHorizontalUnit}`}>
        {mode === 'shop' && !isCompleted ? (
            <div className={`flex-shrink-0 text-right pr-2 text-gray-600 dark:text-gray-400 ${AppConfig.amountContainerMinWidthClass}`}>
                {(item.amount || '1') !== '1' ? `${item.amount || '1'} x` : ''}
            </div>
        ) : null}
        <div
            id={`item-name-${item.id}`}
            onClick={() => {
                if (mode === 'home' && onSelectItem) {
                    onSelectItem(item.id);
                } else if (mode === 'shop') {
                    onToggleItemCompleted(item.id);
                }
            }}
            onDoubleClick={() => onOpenEditModal(item.id, currentCategoryId)}
            className={`
              flex-grow break-words text-gray-800
              transition-colors dark:text-gray-200
              ${isCompleted
                ? 'line-through text-gray-500 dark:text-gray-400'
                : ''
              }
            `}
        >
            <ClickableText text={displayName} />
        </div>
      </div>
      <div className="ml-1 flex flex-shrink-0 items-center gap-0.5">
        {showMoveControls && (
          <>
            <button
              id={`move-up-item-${item.id}-button`}
              onClick={() => onMoveUp(item.id)}
              disabled={isFirst}
              className="p-1.5 rounded-full text-gray-400 transition-colors hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-orange-400"
              aria-label={t('shoppingListItem.aria.moveUp', displayName)}
              title={t('shoppingListItem.tooltips.moveUp')}
              {...longPressHandlers}
            >
                <IconChevronUp className="h-4 w-4" />
            </button>
            <button
              id={`move-down-item-${item.id}-button`}
              onClick={() => onMoveDown(item.id)}
              disabled={isLast}
              className="p-1.5 rounded-full text-gray-400 transition-colors hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-orange-400"
              aria-label={t('shoppingListItem.aria.moveDown', displayName)}
              title={t('shoppingListItem.tooltips.moveDown')}
              {...longPressHandlers}
            >
                <IconChevronDown className="h-4 w-4" />
            </button>
          </>
        )}
        <button
          id={`edit-item-${item.id}-button`}
          onClick={() => onOpenEditModal(item.id, currentCategoryId)}
          className="p-1.5 rounded-full text-gray-400 transition-colors hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:hover:text-orange-400"
          aria-label={t('shoppingListItem.aria.editItem', displayName)}
          title={t('shoppingListItem.tooltips.editItem')}
          {...longPressHandlers}
        >
            <IconPencil className="h-4 w-4" />
        </button>
        
        {mode === 'home' && (
            <AmountControl
                id={`amount-control-${item.id}`}
                amountToDisplay={displayAmount}
                onIncrease={() => onUpdateAmount(item.id, 1)}
                onDecrease={() => onUpdateAmount(item.id, -1)}
                displayName={displayName}
            />
        )}
      </div>
    </li>
  );
};

export default ShoppingListItemComponent;