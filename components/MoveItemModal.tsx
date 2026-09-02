const FILE_PATH = 'components/MoveItemModal.tsx';
import React from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingListItem, Category, ViewMode } from '../types.ts';
import { IconPlus } from '../common/components/icons/index.ts';
import { useBodyScrollLock } from '../common/hooks/effects/useBodyScrollLock.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface MoveItemModalProps {
  item: ShoppingListItem;
  categories: Category[];
  currentCategoryId: string;
  onMove: (newCategoryId: string) => void;
  onClose: () => void;
  onAddNewCategory: (newCategoryName: string) => void;
  viewMode: ViewMode;
}

const MoveItemModal: React.FC<MoveItemModalProps> = ({ item, categories, currentCategoryId, onMove, onClose, onAddNewCategory, viewMode }) => {
  useBodyScrollLock(true);
  const longPressHandlers = useLongPressTooltip();
  const { t } = useLocalization();
  
  const handleAddNewCategory = () => {
    const newCategoryName = window.prompt(t('moveItemModal.prompt'));
    if (newCategoryName && newCategoryName.trim()) {
      onAddNewCategory(newCategoryName.trim());
    }
  };

  const viewModeName = viewMode === 'home' ? t('modeSwitcher.home') : t('modeSwitcher.shop');

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[55] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="move-item-title"
    >
      <div
        id="move-item-modal"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 id="move-item-title" className="text-lg font-bold truncate">
            {t('moveItemModal.title_prefix')}<span className="text-orange-600 dark:text-orange-400">{item.name}</span>{t('moveItemModal.title_suffix')}
          </h2>
        </header>

        <div className="p-2 flex-1 overflow-y-auto">
          <p className="text-sm text-gray-600 dark:text-gray-400 px-1 pb-2">{t('moveItemModal.destination', viewModeName)}</p>
          <ul className="space-y-1">
            {sortedCategories.map((category) => (
              <li key={category.id}>
                <button
                  id={`move-item-to-category-${category.id}-button`}
                  onClick={() => onMove(category.id)}
                  disabled={category.id === currentCategoryId}
                  className="w-full text-left p-2 rounded-md transition-colors text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
                  aria-label={t('moveItemModal.aria.moveTo', category.name)}
                  title={t('moveItemModal.tooltips.move', category.name)}
                  {...longPressHandlers}
                >
                  {category.name}
                  {category.id === currentCategoryId && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{t('moveItemModal.current')}</span>}
                </button>
              </li>
            ))}
             <li className="border-t border-gray-200 dark:border-gray-700 my-1 !mt-2 pt-1">
                <button
                  id="add-new-category-in-move-modal-button"
                  onClick={handleAddNewCategory}
                  className="w-full text-left p-2 rounded-md transition-colors flex items-center text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  title={t('moveItemModal.tooltips.addNew')}
                  {...longPressHandlers}
                >
                  <IconPlus className="h-5 w-5 mr-2" />
                  {t('moveItemModal.addNewCategory')}
                </button>
              </li>
          </ul>
        </div>
        <footer className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              id="cancel-move-item-modal-button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              title={t('moveItemModal.tooltips.cancel')}
              {...longPressHandlers}
            >
                {t('moveItemModal.cancel')}
            </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default MoveItemModal;