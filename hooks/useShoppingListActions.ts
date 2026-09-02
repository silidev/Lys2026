

import { useCallback } from 'react';
import type { Category, ItemLocation } from '../types';

type OnReorderItem = (source: ItemLocation, destination: ItemLocation) => void;

export const useShoppingListActions = (
    categories: Category[],
    onReorderItem: OnReorderItem
) => {
    const handleMoveItemUp = useCallback((itemId: string) => {
        const category = categories.find(s => s.itemIds.includes(itemId));
        if (!category) return;
        const index = category.itemIds.indexOf(itemId);
        if (index > 0) {
          onReorderItem(
            { categoryId: category.id, index: index },
            { categoryId: category.id, index: index - 1 }
          );
        }
    }, [categories, onReorderItem]);

    const handleMoveItemDown = useCallback((itemId: string) => {
        const category = categories.find(s => s.itemIds.includes(itemId));
        if (!category) return;
        const index = category.itemIds.indexOf(itemId);
        if (index < category.itemIds.length - 1) {
          onReorderItem(
            { categoryId: category.id, index: index },
            { categoryId: category.id, index: index + 1 }
          );
        }
    }, [categories, onReorderItem]);

    return { handleMoveItemUp, handleMoveItemDown };
};