const FILE_PATH = 'common/services/listService.ts';
// common/services/listService.ts
import type { ShoppingListData, ShoppingListItem, Category, ViewMode, ItemLocation } from '../../types';
import { REMOVE_FROM_VIEW_CATEGORY_NAME } from '../../00configs/app.ts';

const addItemToCategories = (categories: Category[], newItemId: string): Category[] => {
    const newCategories = [...categories];
    const uncategorizedIndex = newCategories.findIndex(s => s.name.toLowerCase() === 'uncategorized');

    if (uncategorizedIndex !== -1) {
        // "Uncategorized" exists, add the new item to the front of its itemIds.
        const targetCategory = newCategories[uncategorizedIndex];
        const updatedCategory = {
            ...targetCategory,
            itemIds: [newItemId, ...targetCategory.itemIds],
        };
        newCategories[uncategorizedIndex] = updatedCategory;
        return newCategories;
    } else {
        // "Uncategorized" does not exist. Create it and prepend it.
        const newUncategorizedCategory: Category = {
            id: crypto.randomUUID(),
            name: 'Uncategorized',
            itemIds: [newItemId],
        };
        return [newUncategorizedCategory, ...newCategories];
    }
};

export const addItem = (data: ShoppingListData, name: string, defaultCompleted: boolean): [ShoppingListData, string] => {
    const newItem: ShoppingListItem = { id: crypto.randomUUID(), name, amount: '1', defaultCompleted, isRush: true };

    const newData: ShoppingListData = {
        ...data,
        items: [...data.items, newItem],
        shopCategories: addItemToCategories(data.shopCategories, newItem.id),
        homeCategories: addItemToCategories(data.homeCategories, newItem.id),
    };
    return [newData, newItem.id];
};

export const deleteItem = (data: ShoppingListData, id: string): ShoppingListData => {
    return {
      items: data.items.filter((item) => item.id !== id),
      shopCategories: data.shopCategories.map(s => ({...s, itemIds: s.itemIds.filter(itemId => itemId !== id)})),
      homeCategories: data.homeCategories.map(s => ({...s, itemIds: s.itemIds.filter(itemId => itemId !== id)})),
    };
};

export const cloneItem = (data: ShoppingListData, itemId: string): ShoppingListData => {
    const originalItem = data.items.find(i => i.id === itemId);
    if (!originalItem) return data;

    const newItemId = crypto.randomUUID();
    const newItem: ShoppingListItem = { ...originalItem, id: newItemId };

    const cloneInCategories = (categories: Category[]): Category[] => {
        return categories.map(cat => {
            if (cat.itemIds.includes(itemId)) {
                const index = cat.itemIds.indexOf(itemId);
                const newItemIds = [...cat.itemIds];
                newItemIds.splice(index + 1, 0, newItemId); // Insert after original
                return { ...cat, itemIds: newItemIds };
            }
            return cat;
        });
    };

    return {
        ...data,
        items: [...data.items, newItem],
        shopCategories: cloneInCategories(data.shopCategories),
        homeCategories: cloneInCategories(data.homeCategories),
    };
};

export const reorderItem = (data: ShoppingListData, source: ItemLocation, destination: ItemLocation, mode: ViewMode): ShoppingListData => {
    const categoriesKey = mode === 'shop' ? 'shopCategories' : 'homeCategories';
    const categories = [...data[categoriesKey]];

    const sourceCategoryIndex = categories.findIndex(s => s.id === source.categoryId);
    const destCategoryIndex = categories.findIndex(s => s.id === destination.categoryId);

    if (sourceCategoryIndex === -1 || destCategoryIndex === -1) {
        return data;
    }
    
    const sourceCategoryItems = [...categories[sourceCategoryIndex].itemIds];
    const [movedItemId] = sourceCategoryItems.splice(source.index, 1);
    
    if (!movedItemId) {
        return data;
    }

    if (source.categoryId === destination.categoryId) {
        sourceCategoryItems.splice(destination.index, 0, movedItemId);
        categories[sourceCategoryIndex] = { ...categories[sourceCategoryIndex], itemIds: sourceCategoryItems };
    } else {
        const destCategoryItems = [...categories[destCategoryIndex].itemIds];
        destCategoryItems.splice(destination.index, 0, movedItemId);
        categories[sourceCategoryIndex] = { ...categories[sourceCategoryIndex], itemIds: sourceCategoryItems };
        categories[destCategoryIndex] = { ...categories[destCategoryIndex], itemIds: destCategoryItems };
    }

    return { ...data, [categoriesKey]: categories };
};

export const moveItemToCategory = (data: ShoppingListData, itemId: string, newCategoryId: string, mode: ViewMode): ShoppingListData => {
    const categoriesKey = mode === 'shop' ? 'shopCategories' : 'homeCategories';
    const otherCategoriesKey = mode === 'shop' ? 'homeCategories' : 'shopCategories';
    
    const currentCategories = data[categoriesKey];
    const otherViewCategories = data[otherCategoriesKey];

    const newCategoryInCurrentView = currentCategories.find(s => s.id === newCategoryId);
    const lowerCaseDeleteName = REMOVE_FROM_VIEW_CATEGORY_NAME.toLowerCase();

    // Check for permanent deletion condition
    if (newCategoryInCurrentView && newCategoryInCurrentView.name.toLowerCase() === lowerCaseDeleteName) {
        const deleteCategoryInOtherView = otherViewCategories.find(s => s.name.toLowerCase() === lowerCaseDeleteName);
        if (deleteCategoryInOtherView && deleteCategoryInOtherView.itemIds.includes(itemId)) {
            // Item is moved to "Remove" in the current view, and it's already in "Remove" in the other view.
            // So, delete it permanently.
            return deleteItem(data, itemId);
        }
    }

    // Standard move logic
    const sourceCategory = currentCategories.find(s => s.itemIds.includes(itemId));

    if (!sourceCategory || sourceCategory.id === newCategoryId) {
        return data; // No change needed
    }

    const updatedCategories = currentCategories.map(category => {
        if (category.id === sourceCategory.id) {
            // Remove item from source
            return { ...category, itemIds: category.itemIds.filter(id => id !== itemId) };
        }
        if (category.id === newCategoryId) {
            // Add item to destination
            return { ...category, itemIds: [...category.itemIds, itemId] };
        }
        return category; // Unchanged
    });

    return { ...data, [categoriesKey]: updatedCategories };
};