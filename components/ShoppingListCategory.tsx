// components/ShoppingListCategory.tsx
import React from 'react';
import { ShoppingListItem as ShoppingListItemType, Category, ViewMode } from '../types';
import ShoppingListItemComponent from './ShoppingListItem';
import { IconPencil } from '../common/components/icons/index.ts';
import { AppConfig, REMOVE_FROM_VIEW_CATEGORY_NAME } from '../00configs/app.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

const FILE_PATH = 'components/ShoppingListCategory.tsx';

interface ShoppingListCategoryProps {
    category: Category;
    itemMap: Map<string, ShoppingListItemType>;
    editingCategoryId: string | null;
    editedCategoryName: string;
    categoryInputRef: React.RefObject<HTMLInputElement>;
    dragOverCategoryId: string | null;
    draggingItemId: string | null;
    onUpdateItemAmount: (id: string, delta: number) => void;
    onToggleItemCompleted: (id: string) => void;
    onOpenMoveModal: (id: string, categoryId: string) => void;
    onOpenEditModal: (id: string, categoryId: string) => void;
    onDragStart: (e: React.DragEvent<HTMLLIElement>, categoryId: string, index: number) => void;
    onDrop: (e: React.DragEvent<HTMLLIElement>, categoryId: string, index: number) => void;
    onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    handleCategoryDrop: (e: React.DragEvent<HTMLElement>, categoryId: string) => void;
    handleCategoryDragOver: (e: React.DragEvent<HTMLElement>, categoryId: string) => void;
    handleCategoryDragLeave: () => void;
    handleCategoryEditClick: (category: Category) => void;
    setEditedCategoryName: (name: string) => void;
    handleCategorySave: () => void;
    handleCategoryKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    hideCompleted: boolean;
    mode: ViewMode;
    lastInteractedInHomeViewId: string | null;
    onSelectItem: (id: string) => void;
    drawLineAtTop?: boolean;
}

const ShoppingListCategory: React.FC<ShoppingListCategoryProps> = ({
    category, itemMap, editingCategoryId, editedCategoryName, categoryInputRef, dragOverCategoryId,
    draggingItemId, onUpdateItemAmount, onToggleItemCompleted, onOpenEditModal, onDragStart, onDrop, onDragEnd, onMoveUp, onMoveDown,
    onOpenMoveModal,
    handleCategoryDrop, handleCategoryDragOver, handleCategoryDragLeave, handleCategoryEditClick, setEditedCategoryName, handleCategorySave, handleCategoryKeyDown,
    hideCompleted, mode, lastInteractedInHomeViewId, drawLineAtTop, onSelectItem
}) => {
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();
    const itemIdsToRender = category.itemIds;

    const isUncategorized = category.name.toLowerCase() === 'uncategorized';
    const isProtected = category.name.toLowerCase() === 'uncategorized' || category.name.toLowerCase() === REMOVE_FROM_VIEW_CATEGORY_NAME.toLowerCase();

    return (
        <section
            id={`category-${category.id}`}
            onDrop={(e) => handleCategoryDrop(e, category.id)}
            onDragOver={(e) => handleCategoryDragOver(e, category.id)}
            onDragLeave={handleCategoryDragLeave}
            className={`rounded-lg transition-colors duration-200 ${dragOverCategoryId === category.id ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-transparent'}`}
        >
            <div 
              className={`border-b border-gray-200 dark:border-gray-700 pb-1 mb-2 sticky top-16 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-20 ${AppConfig.categoryHeaderVerticalPaddingClass}`}
            >
              {editingCategoryId === category.id ? (
                <input
                  id={`edit-category-name-input-${category.id}`}
                  ref={categoryInputRef}
                  type="text"
                  value={editedCategoryName}
                  onChange={(e) => setEditedCategoryName(e.target.value)}
                  onBlur={handleCategorySave}
                  onKeyDown={handleCategoryKeyDown}
                  className="text-lg font-semibold bg-transparent w-full focus:outline-none text-gray-800 dark:text-gray-100"
                  aria-label={t('shoppingListCategory.aria.edit', category.name)}
                  title={t('shoppingListCategory.tooltips.editName')}
                  {...longPressHandlers}
                />
              ) : (
                <div className="relative flex justify-center items-center group">
                  <h2
                    className={`w-full text-lg font-semibold ${AppConfig.categoryHeaderStyleClass}`}
                    onDoubleClick={() => !isProtected && handleCategoryEditClick(category)}
                  >
                    {category.name}
                  </h2>
                  {!isProtected && (
                    <button 
                      id={`edit-category-button-${category.id}`}
                      onClick={() => handleCategoryEditClick(category)}
                      className="absolute right-0 p-1 rounded-full text-gray-400 hover:text-orange-600 hover:bg-gray-200 dark:hover:text-orange-400 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label={t('shoppingListCategory.aria.edit', category.name)}
                      title={t('shoppingListCategory.tooltips.editIcon')}
                      {...longPressHandlers}
                    >
                      <IconPencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            {drawLineAtTop && <div className="h-[3px] bg-orange-500 dark:bg-orange-400 mx-2 my-2 rounded-full" />}
            {itemIdsToRender.length > 0 ? (
              <ul className={`${AppConfig.listItemVerticalSpacingClass} pb-2`}>
                {itemIdsToRender.map((itemId, index) => {
                  const item = itemMap.get(itemId);
                  if (!item) return null;
                  const shouldShowLineBelow = mode === 'home' && item.id === lastInteractedInHomeViewId;
                  return (
                    <React.Fragment key={item.id}>
                      <ShoppingListItemComponent
                        item={item}
                        index={index}
                        onUpdateAmount={onUpdateItemAmount}
                        onToggleItemCompleted={onToggleItemCompleted}
                        onOpenEditModal={onOpenEditModal}
                        onOpenMoveModal={onOpenMoveModal}
                        currentCategoryId={category.id}
                        onDragStart={onDragStart}
                        onDrop={onDrop}
                        onDragEnd={onDragEnd}
                        isDragging={draggingItemId === item.id}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                        isFirst={index === 0}
                        isLast={index === itemIdsToRender.length - 1}
                        mode={mode}
                        isUncategorized={isUncategorized}
                        onSelectItem={onSelectItem}
                        showMoveControls={mode !== 'home' || item.id === lastInteractedInHomeViewId}
                      />
                      {shouldShowLineBelow && <div className="h-[3px] bg-orange-500 dark:bg-orange-400 mx-2 my-2 rounded-full" />}
                    </React.Fragment>
                  );
                })}
              </ul>
            ) : (
               <div className="min-h-[50px] flex items-center justify-center m-2">
                   <p id={`empty-category-message-${category.id}`} className="px-2 text-sm text-gray-500 dark:text-gray-400 italic">
                       {category.itemIds.length > 0 ? t('shoppingListCategory.allCompleted') : t('shoppingListCategory.empty')}
                   </p>
               </div>
            )}
        </section>
    );
};
export default ShoppingListCategory;