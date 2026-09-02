


import { useState, useCallback } from 'react';
import type { ShoppingListItem } from '../types';

export const useMoveItemModal = (
    itemMap: Map<string, ShoppingListItem>,
    onMoveItemToCategory: (itemId: string, newCategoryId: string) => void
) => {
    const [itemToMove, setItemToMove] = useState<ShoppingListItem | null>(null);
    const [categoryIdOfItemToMove, setCategoryIdOfItemToMove] = useState<string | null>(null);

    const handleOpenMoveModal = useCallback((itemId: string, categoryId: string) => {
        setItemToMove(itemMap.get(itemId) || null);
        setCategoryIdOfItemToMove(categoryId);
    }, [itemMap]);

    const handleCloseMoveModal = useCallback(() => {
        setItemToMove(null);
        setCategoryIdOfItemToMove(null);
    }, []);
    
    const handleConfirmMove = useCallback((newCategoryId: string) => {
        if (itemToMove) {
            onMoveItemToCategory(itemToMove.id, newCategoryId);
        }
        handleCloseMoveModal();
    }, [itemToMove, onMoveItemToCategory, handleCloseMoveModal]);

    return {
        itemToMove,
        categoryIdOfItemToMove,
        handleOpenMoveModal,
        handleCloseMoveModal,
        handleConfirmMove,
    };
};
