

import { useState, useCallback } from 'react';
import type { Category, ShoppingListItem, DragItemData, ItemLocation } from '../types';
import type React from 'react';

interface DragAndDropProps {
    categories: Category[];
    itemMap: Map<string, ShoppingListItem>;
    onReorderItem: (source: ItemLocation, destination: ItemLocation) => void;
}

const isDragItemData = (data: unknown): data is DragItemData => {
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    const d = data as DragItemData;
    return (
      typeof d.itemId === 'string' &&
      typeof d.categoryId === 'string' &&
      typeof d.index === 'number'
    );
};

const getDragData = (e: React.DragEvent): DragItemData | null => {
    try {
        const rawData = e.dataTransfer.getData('application/json');
        if (!rawData) return null;
        
        const sourceData: unknown = JSON.parse(rawData);
        if (isDragItemData(sourceData)) {
            return sourceData;
        }
    } catch (error: unknown) {
        console.error('Failed to parse drag-and-drop data:', error);
    }
    return null;
};


export const useShoppingListDragAndDrop = ({ categories, itemMap, onReorderItem }: DragAndDropProps) => {
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
    const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
    
    const cleanupDragState = useCallback(() => {
        setDraggingItemId(null);
        setDragOverCategoryId(null);
    }, []);

    const handleDragStart = useCallback((e: React.DragEvent<HTMLLIElement>, categoryId: string, index: number) => {
        const item = itemMap.get(e.currentTarget.dataset.id || '');
        if (item && e.dataTransfer) {
            try {
                const dragData: DragItemData = { itemId: item.id, categoryId, index };
                e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                e.dataTransfer.effectAllowed = 'move';
                setDraggingItemId(item.id);
            } catch (error: unknown) {
                console.error("Failed to set drag data:", error);
            }
        }
    }, [itemMap]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLLIElement>, destinationCategoryId: string, destinationIndex: number) => {
        e.preventDefault();
        const sourceData = getDragData(e);
        if (sourceData) {
            onReorderItem(
                { categoryId: sourceData.categoryId, index: sourceData.index },
                { categoryId: destinationCategoryId, index: destinationIndex }
            );
        }
        cleanupDragState();
    }, [onReorderItem, cleanupDragState]);

    const handleDragEnd = useCallback((_e: React.DragEvent) => {
        cleanupDragState();
    }, [cleanupDragState]);

    const handleCategoryDrop = useCallback((e: React.DragEvent<HTMLElement>, destinationCategoryId: string) => {
        e.preventDefault();
        const sourceData = getDragData(e);
        if (sourceData) {
            const destinationCategory = categories.find(s => s.id === destinationCategoryId);
            if (destinationCategory) {
                onReorderItem(
                    { categoryId: sourceData.categoryId, index: sourceData.index },
                    { categoryId: destinationCategoryId, index: destinationCategory.itemIds.length }
                );
            }
        }
        cleanupDragState();
    }, [categories, onReorderItem, cleanupDragState]);

    const handleCategoryDragOver = useCallback((e: React.DragEvent<HTMLElement>, categoryId: string) => {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
        setDragOverCategoryId(categoryId);
    }, []);

    const handleCategoryDragLeave = useCallback(() => {
        setDragOverCategoryId(null);
    }, []);

    return {
        draggingItemId,
        dragOverCategoryId,
        handleDragStart,
        handleDrop,
        handleDragEnd,
        handleCategoryDrop,
        handleCategoryDragOver,
        handleCategoryDragLeave,
    };
};