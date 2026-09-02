const FILE_PATH = 'common/services/searchService.ts';
import type { Category, ShoppingListItem } from '../../types';
import { REMOVE_FROM_VIEW_CATEGORY_NAME } from '../../00configs/app.ts';

/**
 * Filters categories and their items based on a search term.
 *
 * @param categories The categories to filter.
 * @param itemMap A map of all shopping list items.
 * @param searchTerm The text to search for within item names.
 * @returns An array of categories containing only the items that match the search term.
 *          Categories without any matching items are excluded.
 */
export const filterVisibleCategories = (
    categories: Category[],
    itemMap: Map<string, ShoppingListItem>,
    searchTerm: string
): Category[] => {
    const trimmedSearchTerm = searchTerm.trim();
    const lowerCaseDeleteName = REMOVE_FROM_VIEW_CATEGORY_NAME.toLowerCase();

    if (!trimmedSearchTerm) {
        // No search term: filter out the "Remove from this view" category.
        const initiallyVisible = categories.filter(s => s.name.toLowerCase() !== lowerCaseDeleteName);
        // Return a deep copy to avoid potential mutation issues downstream
        return initiallyVisible.map(s => ({ ...s, itemIds: [...s.itemIds] }));
    }

    // With search term: search across all categories, including "Remove from this view".
    const lowerCaseSearchTerm = trimmedSearchTerm.toLowerCase();
    
    return categories.map(category => {
        const filteredItemIds = category.itemIds.filter(itemId => {
            const item = itemMap.get(itemId);
            if (!item) return false;
            
            const matchName = item.name.toLowerCase().includes(lowerCaseSearchTerm);
            const matchAlias = item.alias?.toLowerCase().includes(lowerCaseSearchTerm);
            
            return matchName || matchAlias;
        });
        
        return {
            ...category,
            itemIds: filteredItemIds
        };
    }).filter(category => category.itemIds.length > 0);
};