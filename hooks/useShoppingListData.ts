const FILE_PATH = 'hooks/useShoppingListData.ts';
import { useMemo, useCallback } from 'react';
import { ShoppingListData, ViewMode, ItemLocation, ShoppingListItem } from '../types';
import { defaultData } from '../data/defaultData.ts';
import * as itemService from '../common/services/itemService.ts';
import * as categoryService from '../common/services/categoryService.ts';
import * as listService from '../common/services/listService.ts';
import { useUndoableState } from './useUndoableState.ts';
import { demoItemsToAdd } from '../data/demoData.ts';

export const useShoppingListData = (mode: ViewMode, setLastInteractedInHomeViewId: (id: string | null) => void) => {
    const { 
      state: data,
      setState: setData,
      setStateWithoutHistory,
      undo: handleUndo,
      redo: handleRedo,
      canUndo,
      canRedo,
    } = useUndoableState<ShoppingListData>('shopping-list-data', defaultData);

    const { items, shopCategories, homeCategories: dataHomeCategories } = data;

    const itemMap = useMemo(() => new Map(items.map(item => [item.id, item])), [items]);
    const currentCategories = (mode === 'shop' ? shopCategories : dataHomeCategories);

    const handleAddItem = useCallback((name: string, defaultCompleted: boolean): string => {
      let newItemId = '';
      setData(prevData => {
        const [newData, createdItemId] = listService.addItem(prevData, name, defaultCompleted);
        newItemId = createdItemId;
        return newData;
      });
      return newItemId;
    }, [setData]);

    const handleUpdateItemAmount = useCallback((id: string, delta: number) => {
        setData(prevData => {
            const newData = itemService.updateItemAmount(prevData, id, delta);
            
            if (mode === 'home') {
                setLastInteractedInHomeViewId(id);
            }
            return newData;
        });
    }, [setData, mode, setLastInteractedInHomeViewId]);
  
    const handleToggleItemCompleted = useCallback((id: string) => {
        setData(prevData => itemService.toggleItemCompleted(prevData, id));
    }, [setData]);

    const handleDeleteItem = useCallback((id: string) => {
      setData(prevData => listService.deleteItem(prevData, id));
    }, [setData]);
    
    const handleCloneItem = useCallback((id: string) => {
        setData(prevData => listService.cloneItem(prevData, id));
    }, [setData]);
  
    const handleReset = useCallback((isUrgentReset: boolean) => {
      setData(prevData => {
        return itemService.resetPotentiallyUrgentItems(prevData, isUrgentReset);
      });
    }, [setData]);
    
    const handleRestore = useCallback((restoredData: ShoppingListData) => {
      setData(restoredData);
    }, [setData]);

    const handleReorderItem = useCallback((source: ItemLocation, destination: ItemLocation) => {
        setData(prevData => listService.reorderItem(prevData, source, destination, mode));
    }, [mode, setData]);
  
    const handleMoveItemToCategory = useCallback((itemId: string, newCategoryId: string, modeToUpdate: ViewMode) => {
        setData(prevData => listService.moveItemToCategory(prevData, itemId, newCategoryId, modeToUpdate));
    }, [setData]);
  
    const handleReorderCategory = useCallback((sourceIndex: number, destinationIndex: number, modeToEdit: ViewMode) => {
        setStateWithoutHistory(prevData => categoryService.reorderCategory(prevData, sourceIndex, destinationIndex, modeToEdit));
    }, [setStateWithoutHistory]);

    const handleUpdateItem = useCallback((id: string, updates: Partial<Pick<ShoppingListItem, 'name' | 'amount' | 'nameShop' | 'alias' | 'nameExport'>>) => {
      setData(prevData => itemService.updateItem(prevData, id, updates));
    }, [setData]);
    
    const handleUpdateCategoryName = useCallback((categoryId: string, newName: string, modeToUpdate: ViewMode) => {
        setData(prevData => categoryService.updateCategoryName(prevData, categoryId, newName, modeToUpdate));
    }, [setData]);

    const handleAddCategory = useCallback((name: string, modeToAdd: ViewMode) => {
        setData(prevData => categoryService.addCategory(prevData, name, modeToAdd));
    }, [setData]);
    
    const handleAddCategoryAndMoveItem = useCallback((newCategoryName: string, itemId: string, modeToUpdate: ViewMode) => {
        setData(prevData => categoryService.addCategoryAndMoveItem(prevData, newCategoryName, itemId, modeToUpdate));
    }, [setData]);

    const handleDeleteCategory = useCallback((categoryId: string, modeToDelete: ViewMode) => {
        setData(prevData => categoryService.deleteCategory(prevData, categoryId, modeToDelete));
    }, [setData]);

    const handleToggleDefaultCompleted = useCallback((id: string) => {
        setData(prevData => itemService.toggleDefaultCompleted(prevData, id));
    }, [setData]);

    const handleToggleItemUrgent = useCallback((id: string) => {
        setData(prevData => itemService.toggleItemUrgent(prevData, id));
    }, [setData]);

    const handleToggleItemUrgentOnce = useCallback((id: string) => {
        setData(prevData => itemService.toggleItemUrgentOnce(prevData, id));
    }, [setData]);

    const handleToggleHideUntilReset = useCallback((id: string) => {
        setData(prevData => itemService.toggleHideUntilReset(prevData, id));
    }, [setData]);

    const handleAddDemoData = useCallback(() => {
        setData(prevData => {
            let currentData = prevData;
            for (const itemName of demoItemsToAdd) {
                const [newData] = listService.addItem(currentData, itemName, false);
                currentData = newData;
            }
            
            // Merged from handleAdd20SectionsAndItems
            let newDataWithSections = { 
                ...currentData,
                items: [...currentData.items],
                shopCategories: [...currentData.shopCategories],
                homeCategories: [...currentData.homeCategories],
            };
    
            const newItems = [
                { id: crypto.randomUUID(), name: 'Added Item A for testing', amount: '1' },
                { id: crypto.randomUUID(), name: 'Added Item B for testing', amount: '1' },
            ];
            
            newDataWithSections.items.push(...newItems);
            
            const newItemIds = newItems.map(item => item.id);
            
            let targetShopCategoryId: string | null = null;
            let targetHomeCategoryId: string | null = null;
    
            for (let i = 1; i <= 20; i++) {
                const newShopCategory = {
                    id: crypto.randomUUID(),
                    name: `Test Shop Section ${i}`,
                    itemIds: [] as string[],
                };
                newDataWithSections.shopCategories.push(newShopCategory);
    
                const newHomeCategory = {
                    id: crypto.randomUUID(),
                    name: `Test Home Section ${i}`,
                    itemIds: [] as string[],
                };
                newDataWithSections.homeCategories.push(newHomeCategory);
    
                if (i === 10) { // Add items to the 10th new category
                    targetShopCategoryId = newShopCategory.id;
                    targetHomeCategoryId = newHomeCategory.id;
                }
            }
    
            if (targetShopCategoryId) {
                const targetCategory = newDataWithSections.shopCategories.find(c => c.id === targetShopCategoryId);
                if(targetCategory) {
                    targetCategory.itemIds.push(...newItemIds);
                }
            }
            if (targetHomeCategoryId) {
                const targetCategory = newDataWithSections.homeCategories.find(c => c.id === targetHomeCategoryId);
                if(targetCategory) {
                    targetCategory.itemIds.push(...newItemIds);
                }
            }
    
            return newDataWithSections;
        });
    }, [setData]);

    const handleConvertHiddenSections = useCallback(() => {
        // This function is deprecated and the related file is removed.
    }, []);

    return {
        data,
        itemMap,
        currentCategories,
        handleAddItem,
        handleUpdateItemAmount,
        handleToggleItemCompleted,
        handleDeleteItem,
        handleCloneItem,
        handleReset,
        handleRestore,
        handleReorderItem,
        handleMoveItemToCategory,
        handleReorderCategory,
        handleUpdateItem,
        handleUpdateCategoryName,
        handleAddCategory,
        handleDeleteCategory,
        handleToggleDefaultCompleted,
        handleToggleItemUrgent,
        handleToggleItemUrgentOnce,
        handleToggleHideUntilReset,
        handleUndo,
        handleRedo,
        canUndo,
        canRedo,
        handleAddCategoryAndMoveItem,
        handleAddDemoData,
        handleConvertHiddenSections,
    };
};