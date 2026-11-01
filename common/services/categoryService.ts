const FILE_PATH = 'common/services/categoryService.ts';

import type { ShoppingListData, Category, ViewMode, ShoppingListItem } from '../../types';
import { REMOVE_FROM_VIEW_CATEGORY_NAME } from '../../00configs/app.ts';

export const reorderCategory = (data: ShoppingListData, manageableSourceIndex: number, manageableDestinationIndex: number, modeToEdit: ViewMode): ShoppingListData => {
    const categoriesKey = modeToEdit === 'shop' ? 'shopCategories' : 'homeCategories';
    const allCategories = data[categoriesKey];

    const manageableCategories = getManageableCategories(allCategories);

    if (manageableSourceIndex < 0 || manageableSourceIndex >= manageableCategories.length) {
        return data;
    }

    const sourceCategory = manageableCategories[manageableSourceIndex];
    const realSourceIndex = allCategories.findIndex(c => c.id === sourceCategory.id);

    let realDestinationIndex: number;
    if (manageableDestinationIndex >= manageableCategories.length) {
        const lastManageable = manageableCategories[manageableCategories.length - 1];
        realDestinationIndex = allCategories.findIndex(c => c.id === lastManageable.id) + 1;
    } else {
        const destinationCategory = manageableCategories[manageableDestinationIndex];
        realDestinationIndex = allCategories.findIndex(c => c.id === destinationCategory.id);
    }
    
    if (realSourceIndex === -1) {
        return data;
    }
    
    const newCategories = Array.from(allCategories);
    const [removed] = newCategories.splice(realSourceIndex, 1);

    if (realSourceIndex < realDestinationIndex) {
        newCategories.splice(realDestinationIndex - 1, 0, removed);
    } else {
        newCategories.splice(realDestinationIndex, 0, removed);
    }

    return {
        ...data,
        [categoriesKey]: newCategories,
    };
};

export const updateCategoryName = (data: ShoppingListData, categoryId: string, newName: string, modeToUpdate: ViewMode): ShoppingListData => {
    const categoriesKey = modeToUpdate === 'shop' ? 'shopCategories' : 'homeCategories';
    const categories = data[categoriesKey];
    
    const categoryToUpdate = categories.find(s => s.id === categoryId);

    // Prevent renaming "Uncategorized" categories
    if (categoryToUpdate && (categoryToUpdate.name.toLowerCase() === 'uncategorized')) {
        return data;
    }

    const updatedCategories = categories.map(category =>
        category.id === categoryId ? { ...category, name: newName } : category
    );
    return {
        ...data,
        [categoriesKey]: updatedCategories,
    };
};

export const addCategory = (data: ShoppingListData, name: string, modeToAdd: ViewMode): ShoppingListData => {
    const categoriesKey = modeToAdd === 'shop' ? 'shopCategories' : 'homeCategories';
    const newCategory: Category = {
        id: crypto.randomUUID(),
        name: name.trim(),
        itemIds: [],
    };
    const newCategories = [...data[categoriesKey], newCategory];
    return {
        ...data,
        [categoriesKey]: newCategories,
    };
};

export interface DeleteCategoryOptions {
    action: 'move' | 'deleteItems';
    targetCategoryId?: string;
}

export const deleteCategory = (
    data: ShoppingListData,
    categoryId: string,
    modeToDelete: ViewMode,
    options?: DeleteCategoryOptions
): ShoppingListData => {
    const categoriesKey = modeToDelete === 'shop' ? 'shopCategories' : 'homeCategories';
    const otherKey = modeToDelete === 'shop' ? 'homeCategories' : 'shopCategories';
    const categories = data[categoriesKey];

    const categoryToDelete = categories.find(s => s.id === categoryId);
    if (!categoryToDelete) {
        console.warn(`Attempted to delete category ${categoryId} which is not found.`);
        return data;
    }

    // If category has no items, standard delete
    if (categoryToDelete.itemIds.length === 0) {
        return {
            ...data,
            [categoriesKey]: categories.filter(s => s.id !== categoryId),
        };
    }

    // Category has items: check options
    if (!options) {
        console.warn(`Attempted to delete category ${categoryId} which is not empty, but no delete options were provided.`);
        return data;
    }

    if (options.action === 'move') {
        const itemsToMove = categoryToDelete.itemIds;
        const targetId = options.targetCategoryId;

        let targetCategory = targetId
            ? categories.find(c => c.id === targetId && c.id !== categoryId)
            : undefined;

        if (!targetCategory) {
            targetCategory = categories.find(c => c.name.toLowerCase() === 'uncategorized' && c.id !== categoryId);
        }

        let newCategories: Category[];
        if (targetCategory) {
            const foundTargetId = targetCategory.id;
            newCategories = categories
                .filter(c => c.id !== categoryId)
                .map(c => {
                    if (c.id === foundTargetId) {
                        const existingSet = new Set(c.itemIds);
                        const toAdd = itemsToMove.filter(id => !existingSet.has(id));
                        return { ...c, itemIds: [...c.itemIds, ...toAdd] };
                    }
                    return c;
                });
        } else {
            // Target category doesn't exist, create "Uncategorized"
            const newUncategorized: Category = {
                id: crypto.randomUUID(),
                name: 'Uncategorized',
                itemIds: [...itemsToMove],
            };
            newCategories = [newUncategorized, ...categories.filter(c => c.id !== categoryId)];
        }

        return {
            ...data,
            [categoriesKey]: newCategories,
        };
    }

    if (options.action === 'deleteItems') {
        const itemIdsToDelete = new Set(categoryToDelete.itemIds);
        const newItems = data.items.filter(item => !itemIdsToDelete.has(item.id));
        const newOtherCategories = data[otherKey].map(c => ({
            ...c,
            itemIds: c.itemIds.filter(id => !itemIdsToDelete.has(id)),
        }));
        const newCategories = categories
            .filter(c => c.id !== categoryId)
            .map(c => ({
                ...c,
                itemIds: c.itemIds.filter(id => !itemIdsToDelete.has(id)),
            }));

        return {
            ...data,
            items: newItems,
            [categoriesKey]: newCategories,
            [otherKey]: newOtherCategories,
        };
    }

    return data;
};

export const deleteCategoryAndMoveItems = (
    data: ShoppingListData,
    categoryId: string,
    targetCategoryId: string,
    modeToDelete: ViewMode
): ShoppingListData => {
    return deleteCategory(data, categoryId, modeToDelete, { action: 'move', targetCategoryId });
};

export const deleteCategoryAndItems = (
    data: ShoppingListData,
    categoryId: string,
    modeToDelete: ViewMode
): ShoppingListData => {
    return deleteCategory(data, categoryId, modeToDelete, { action: 'deleteItems' });
};


export const getVisibleCategories = (
    categories: Category[],
    itemMap: Map<string, ShoppingListItem>,
    hideCompleted: boolean
): Category[] => {
    const lowerCaseDeleteName = REMOVE_FROM_VIEW_CATEGORY_NAME.toLowerCase();

    const mappedCategories = categories
        .filter(category => category.name.toLowerCase() !== lowerCaseDeleteName)
        .map(category => {
            const filteredItemIds = category.itemIds.filter(itemId => {
                const item = itemMap.get(itemId);
                if (!item || item.hideUntilReset) {
                    return false;
                }
                if (hideCompleted && item.amount === '0') {
                    return false;
                }
                return true;
            });
            return { ...category, itemIds: filteredItemIds };
        });

    if (hideCompleted) {
        return mappedCategories.filter(category => category.itemIds.length > 0);
    }

    return mappedCategories;
};

export const addCategoryAndMoveItem = (data: ShoppingListData, newCategoryName: string, itemId: string, mode: ViewMode): ShoppingListData => {
    const categoriesKey = mode === 'shop' ? 'shopCategories' : 'homeCategories';
    const categories = data[categoriesKey];

    // 1. Remove item from its current category
    let itemRemoved = false;
    const categoriesWithoutItem = categories.map(s => {
        if (s.itemIds.includes(itemId)) {
            itemRemoved = true;
            return { ...s, itemIds: s.itemIds.filter(id => id !== itemId) };
        }
        return s;
    });
    
    if (!itemRemoved) return data; // Should not happen if UI is correct

    // 2. Create and add the new category with the item
    const newCategory: Category = {
        id: crypto.randomUUID(),
        name: newCategoryName.trim(),
        itemIds: [itemId],
    };
    
    const finalCategories = [...categoriesWithoutItem, newCategory];

    return {
        ...data,
        [categoriesKey]: finalCategories,
    };
};

export const getManageableCategories = (categories: Category[]): Category[] => {
    const lowerCaseDeleteName = REMOVE_FROM_VIEW_CATEGORY_NAME.toLowerCase();
    return categories.filter(s => s.name.toLowerCase() !== lowerCaseDeleteName);
};