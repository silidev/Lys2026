import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  ShoppingListItem as ShoppingListItemType,
  Category,
  ViewMode,
  ItemLocation
} from '../types';
import ItemEditModal from './ItemEditModal.tsx';
import MoveItemModal from './MoveItemModal.tsx';
import { useCategoryEditing } from '../hooks/useCategoryEditing.ts';
import { useShoppingListActions } from '../hooks/useShoppingListActions.ts';
import EmptyShoppingList from './EmptyShoppingList.tsx';
import ShoppingListCategory from './ShoppingListCategory.tsx';
import { getVisibleCategories } from '../common/services/categoryService.ts';
import { AppConfig } from '../00configs/app.ts';
import { useShoppingListDragAndDrop } from '../hooks/useShoppingListDragAndDrop.ts';
import { useLocalization } from '../localization/i18n.ts';
import ShoppingListItemComponent from './ShoppingListItem.tsx';

interface ShoppingListProps {
  categories: Category[];
  allCurrentCategories: Category[];
  allShopCategories: Category[];
  allHomeCategories: Category[];
  itemMap: Map<string, ShoppingListItemType>;
  onUpdateItemAmount: (id: string, delta: number) => void;
  onToggleItemCompleted: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onCloneItem: (id: string) => void;
  onReorderItem: (
    source: ItemLocation,
    destination: ItemLocation
  ) => void;
  onMoveItemToCategory: (id: string, newCategoryId: string, mode: ViewMode) => void;
  onUpdateItem: (id: string, updates: Partial<Pick<ShoppingListItemType, 'name' | 'amount' | 'nameShop' | 'alias' | 'nameExport'>>) => void;
  onToggleDefaultCompleted: (id: string) => void;
  onToggleItemUrgent: (id: string) => void;
  onToggleItemUrgentOnce: (id: string) => void;
  onToggleHideUntilReset: (id: string) => void;
  onUpdateCategoryName: (
    categoryId: string,
    newName: string
  ) => void;
  mode: ViewMode;
  hideCompleted: boolean;
  showOnlyUrgent: boolean;
  showOnlyDefaultCompleted: boolean;
  searchTerm: string;
  onAddCategoryAndMoveItem: (newCategoryName: string, itemId: string, mode: ViewMode) => void;
  itemToAutoEditId?: string | null;
  onAutoEditComplete?: () => void;
  advancedMode: boolean;
  enableSplitItemNames: boolean;
  lastInteractedInHomeViewId: string | null;
  onSetLastInteractedInHomeViewId: (id: string | null) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({
  categories,
  allCurrentCategories,
  allShopCategories,
  allHomeCategories,
  itemMap,
  onUpdateItemAmount,
  onToggleItemCompleted,
  onDeleteItem,
  onCloneItem,
  onReorderItem,
  onMoveItemToCategory,
  onUpdateItem,
  onToggleDefaultCompleted,
  onToggleItemUrgent,
  onToggleItemUrgentOnce,
  onToggleHideUntilReset,
  onUpdateCategoryName,
  mode,
  hideCompleted,
  showOnlyUrgent,
  showOnlyDefaultCompleted,
  searchTerm,
  onAddCategoryAndMoveItem,
  itemToAutoEditId = null,
  onAutoEditComplete = () => {},
  advancedMode,
  enableSplitItemNames,
  lastInteractedInHomeViewId,
  onSetLastInteractedInHomeViewId,
}) => {
  const { t } = useLocalization();
  const [editingItemInfo, setEditingItemInfo] = useState<{ id: string; categoryId: string; } | null>(null);
  const [movingItemInfo, setMovingItemInfo] = useState<{ id: string; categoryId: string; viewMode: ViewMode } | null>(null);
  const scrollPositionRef = useRef(0);

  const visibleCategories = useMemo(() => {
    if (searchTerm.trim()) {
      return categories;
    }
    return getVisibleCategories(categories, itemMap, hideCompleted);
  }, [categories, itemMap, hideCompleted, searchTerm]);

  const { categoriesToRender, seldomNeededItems } = useMemo(() => {
    if (mode !== 'home') {
        return { categoriesToRender: visibleCategories, seldomNeededItems: [] };
    }

    const seldomItems: ShoppingListItemType[] = [];
    const processedCategories = visibleCategories.map(category => {
        const newItemIds = category.itemIds.filter(itemId => {
            const item = itemMap.get(itemId);
            if (item?.defaultCompleted) {
                seldomItems.push(item);
                return false;
            }
            return true;
        });
        return { ...category, itemIds: newItemIds };
    }).filter(category => category.itemIds.length > 0);
    
    const finalSeldomItems = hideCompleted
        ? seldomItems.filter(item => item.amount !== '0')
        : seldomItems;
        
    finalSeldomItems.sort((a, b) => a.name.localeCompare(b.name));

    return { categoriesToRender: processedCategories, seldomNeededItems: finalSeldomItems };
  }, [visibleCategories, itemMap, mode, hideCompleted]);

  const totalOriginalItemCount = useMemo(() => {
    return allCurrentCategories.reduce(
      (count, category) => count + category.itemIds.length,
      0
    );
  }, [allCurrentCategories]);

  const itemsInCurrentView = useMemo(() => {
    return categories.reduce(
      (count, category) => count + category.itemIds.length,
      0
    );
  }, [categories]);

  const {
    editingCategoryId,
    editedCategoryName,
    setEditedCategoryName,
    categoryInputRef,
    handleCategoryEditClick,
    handleCategorySave,
    handleCategoryKeyDown,
  } = useCategoryEditing(categories, onUpdateCategoryName, t);

  const {
    draggingItemId,
    dragOverCategoryId,
    handleDragStart,
    handleDrop,
    handleDragEnd,
    handleCategoryDrop,
    handleCategoryDragOver,
    handleCategoryDragLeave,
  } = useShoppingListDragAndDrop({ categories, itemMap, onReorderItem });
  
  const { handleMoveItemUp, handleMoveItemDown } = useShoppingListActions(
    categories,
    onReorderItem
  );

  const handleOpenEditModal = useCallback((itemId: string, categoryId: string) => {
    scrollPositionRef.current = window.scrollY;
    setEditingItemInfo({ id: itemId, categoryId });
  }, []);
  const handleCloseEditModal = useCallback(() => {
    setEditingItemInfo(null);
    setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, 0);
  }, []);

  const handleOpenMoveModal = useCallback((itemId: string, categoryId: string) => {
    setMovingItemInfo({ id: itemId, categoryId, viewMode: mode });
  }, [mode]);
  const handleCloseMoveModal = useCallback(() => setMovingItemInfo(null), []);

  const handleMoveRequestFromEditModal = useCallback((viewMode: ViewMode) => {
    if (editingItemInfo) {
      setMovingItemInfo({ id: editingItemInfo.id, categoryId: editingItemInfo.categoryId, viewMode });
    }
  }, [editingItemInfo]);
  
  useEffect(() => {
    if (itemToAutoEditId && onAutoEditComplete) {
        const category = allCurrentCategories.find(s => s.itemIds.includes(itemToAutoEditId));
        if (category) {
            handleOpenEditModal(itemToAutoEditId, category.id);
        }
        onAutoEditComplete();
    }
  }, [itemToAutoEditId, onAutoEditComplete, allCurrentCategories, handleOpenEditModal]);
  
  const itemToEdit = useMemo(() => 
    editingItemInfo ? itemMap.get(editingItemInfo.id) : null,
    [editingItemInfo, itemMap]
  );
  
  const itemToMove = useMemo(() =>
    movingItemInfo ? itemMap.get(movingItemInfo.id) : null,
    [movingItemInfo, itemMap]
  );

  let finalLastInteractedInHomeViewId = lastInteractedInHomeViewId;
  let categoryForTopLine: string | null = null;

  if (mode === 'home' && lastInteractedInHomeViewId) {
      const lastCheckedItem = itemMap.get(lastInteractedInHomeViewId);
      if (lastCheckedItem && lastCheckedItem.amount === '0' && hideCompleted) {
          const allItemIdsWithCategories: {id: string, categoryId: string}[] = [];
          allCurrentCategories.forEach(s => s.itemIds.forEach(id => allItemIdsWithCategories.push({id, categoryId: s.id})));

          const hiddenItemIndex = allItemIdsWithCategories.findIndex(item => item.id === lastInteractedInHomeViewId);

          if(hiddenItemIndex > -1) {
              let predecessorId : string | null = null;
              for(let i = hiddenItemIndex - 1; i >= 0; i--) {
                  const potentialPredecessor = allItemIdsWithCategories[i];
                  if(itemMap.get(potentialPredecessor.id)?.amount !== '0') {
                      predecessorId = potentialPredecessor.id;
                      break;
                  }
              }

              if(predecessorId) {
                  finalLastInteractedInHomeViewId = predecessorId;
              } else {
                  finalLastInteractedInHomeViewId = null; 
                  if(visibleCategories.length > 0) {
                      categoryForTopLine = visibleCategories[0].id;
                  }
              }
          }
      }
  }

  const hasVisibleContent = categoriesToRender.length > 0 || (mode === 'home' && seldomNeededItems.length > 0);

  if (!hasVisibleContent) {
    if (searchTerm.trim()) {
        return (
            <div 
                id="search-no-results"
                className="text-center py-8 px-4 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
            >
                <p className="text-xl font-medium">
                  {t('shoppingList.search.noResults')}
                </p>
            </div>
        );
    }
    if (totalOriginalItemCount === 0) {
        return <EmptyShoppingList mode={mode} />;
    }
    if ((showOnlyUrgent || showOnlyDefaultCompleted) && itemsInCurrentView === 0) {
        const filterMessages: string[] = [];
        if (showOnlyUrgent) filterMessages.push(`'${t('shoppingList.filterNames.urgent')}'`);
        if (showOnlyDefaultCompleted) filterMessages.push(`'${t('shoppingList.filterNames.checkedOnReset')}'`);
        
        const message = t('shoppingList.empty.filtered', filterMessages.join(' and '));

        return (
            <div 
                id="shopping-list-panel"
                role="tabpanel"
                aria-labelledby={`mode-tab-${mode}`}
                className="text-center py-8 px-4 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
            >
                <p className="text-xl font-medium">{message}</p>
                <p className="mt-2">{t('shoppingList.empty.markInEdit')}</p>
            </div>
        );
    }
    if (hideCompleted) {
        const filterMessages: string[] = [];
        if (showOnlyUrgent) filterMessages.push(t('shoppingList.filterNames.urgent'));
        if (showOnlyDefaultCompleted) filterMessages.push(`"${t('shoppingList.filterNames.checkedOnReset')}"`);
        
        const message = filterMessages.length > 0
            ? t('shoppingList.empty.allFilteredCompleted', filterMessages.join(' and '))
            : t('shoppingList.empty.allCompleted');

        return (
            <div 
                id="shopping-list-panel"
                role="tabpanel"
                aria-labelledby={`mode-tab-${mode}`}
                className="text-center py-8 px-4 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
            >
                <p className="text-xl font-medium">{message}</p>
                <p className="mt-2">
                  {t('shoppingList.empty.showCheckedPrompt')}
                </p>
            </div>
        );
    }
  }

  return (
    <>
      <div 
        className={AppConfig.interCategoryVerticalSpacingClass}
        id="shopping-list-panel"
        role="tabpanel"
        aria-labelledby={`mode-tab-${mode}`}
      >
        {categoriesToRender.map((category) => (
          <ShoppingListCategory
            key={category.id}
            category={category}
            itemMap={itemMap}
            editingCategoryId={editingCategoryId}
            editedCategoryName={editedCategoryName}
            categoryInputRef={categoryInputRef}
            dragOverCategoryId={dragOverCategoryId}
            draggingItemId={draggingItemId}
            onUpdateItemAmount={onUpdateItemAmount}
            onToggleItemCompleted={onToggleItemCompleted}
            onOpenEditModal={handleOpenEditModal}
            onOpenMoveModal={handleOpenMoveModal}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onMoveUp={handleMoveItemUp}
            onMoveDown={handleMoveItemDown}
            handleCategoryDrop={handleCategoryDrop}
            handleCategoryDragOver={handleCategoryDragOver}
            handleCategoryDragLeave={handleCategoryDragLeave}
            handleCategoryEditClick={handleCategoryEditClick}
            setEditedCategoryName={setEditedCategoryName}
            handleCategorySave={handleCategorySave}
            handleCategoryKeyDown={handleCategoryKeyDown}
            hideCompleted={hideCompleted}
            mode={mode}
            lastInteractedInHomeViewId={finalLastInteractedInHomeViewId}
            onSelectItem={onSetLastInteractedInHomeViewId}
            drawLineAtTop={category.id === categoryForTopLine}
          />
        ))}
      </div>
      {mode === 'home' && seldomNeededItems.length > 0 && (
          <section id="seldom-needed-section" className="mt-4">
              <div className={`border-b border-gray-200 dark:border-gray-700 pb-1 mb-2 sticky top-16 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-20 ${AppConfig.categoryHeaderVerticalPaddingClass}`}>
                <div className="relative flex justify-center items-center group">
                    <h2 className={`w-full text-lg font-semibold ${AppConfig.categoryHeaderStyleClass}`}>
                        {t('shoppingList.filterNames.checkedOnReset')}
                    </h2>
                </div>
              </div>
              <ul className={`${AppConfig.listItemVerticalSpacingClass} pb-2`}>
                  {seldomNeededItems.map((item) => {
                      const originalCategory = allCurrentCategories.find(c => c.itemIds.includes(item.id));
                      const isUncategorized = originalCategory?.name.toLowerCase() === 'uncategorized';
                      const fallbackCategoryId = allCurrentCategories.find(c => c.name.toLowerCase() === 'uncategorized')?.id ?? allCurrentCategories[0]?.id;
                      const currentCategoryId = originalCategory?.id ?? fallbackCategoryId;
                      
                      if (!currentCategoryId) {
                        return null;
                      }

                      return (
                          <ShoppingListItemComponent
                              key={item.id}
                              item={item}
                              index={0} // Not used as reordering is disabled
                              onUpdateAmount={onUpdateItemAmount}
                              onToggleItemCompleted={onToggleItemCompleted}
                              onOpenEditModal={(id) => handleOpenEditModal(id, currentCategoryId)}
                              onOpenMoveModal={(id) => handleOpenMoveModal(id, currentCategoryId)}
                              currentCategoryId={currentCategoryId}
                              onDragStart={(e) => e.preventDefault()}
                              onDrop={(e) => e.preventDefault()}
                              onDragEnd={(e) => e.preventDefault()}
                              isDragging={false}
                              onMoveUp={() => {}}
                              onMoveDown={() => {}}
                              isFirst={true} // Disables up arrow
                              isLast={true} // Disables down arrow
                              mode={mode}
                              isUncategorized={isUncategorized}
                              onSelectItem={onSetLastInteractedInHomeViewId}
                              showMoveControls={item.id === finalLastInteractedInHomeViewId}
                          />
                      );
                  })}
              </ul>
          </section>
      )}
      {itemToEdit && editingItemInfo && (
        <ItemEditModal
          item={itemToEdit}
          onClose={handleCloseEditModal}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onCloneItem={onCloneItem}
          onToggleDefaultCompleted={onToggleDefaultCompleted}
          onToggleItemUrgent={onToggleItemUrgent}
          onToggleItemUrgentOnce={onToggleItemUrgentOnce}
          onToggleHideUntilReset={onToggleHideUntilReset}
          onMoveRequest={handleMoveRequestFromEditModal}
          advancedMode={advancedMode}
          enableSplitItemNames={enableSplitItemNames}
          isChildModalOpen={!!movingItemInfo}
        />
      )}
      {itemToMove && movingItemInfo && (
        <MoveItemModal
          item={itemToMove}
          categories={movingItemInfo.viewMode === 'shop' ? allShopCategories : allHomeCategories}
          currentCategoryId={movingItemInfo.categoryId}
          onMove={(newCategoryId) => {
            onMoveItemToCategory(movingItemInfo.id, newCategoryId, movingItemInfo.viewMode);
            handleCloseMoveModal();
          }}
          onClose={handleCloseMoveModal}
          onAddNewCategory={(newCategoryName) => {
            onAddCategoryAndMoveItem(newCategoryName, movingItemInfo.id, movingItemInfo.viewMode);
            handleCloseMoveModal();
          }}
          viewMode={movingItemInfo.viewMode}
        />
      )}
    </>
  );
};

export default ShoppingList;