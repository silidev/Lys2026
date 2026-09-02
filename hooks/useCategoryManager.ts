const FILE_PATH = 'hooks/useCategoryManager.ts';



import { useState, useCallback, type DragEvent } from 'react';
import type { Category } from '../types';
import { REMOVE_FROM_VIEW_CATEGORY_NAME } from '../00configs/app.ts';

export const useCategoryManager = (
    categories: Category[],
    onReorder: (sourceIndex: number, destinationIndex: number) => void,
    onAdd: (name: string) => void,
    onUpdateCategoryName: (categoryId: string, newName: string) => void,
    t: (key: string, ...args: (string | number)[]) => string
) => {
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editedCategoryName, setEditedCategoryName] = useState('');

    const handleDragStart = useCallback((e: DragEvent<HTMLLIElement>, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const cleanupDragState = useCallback(() => {
        setDraggingIndex(null);
        setDragOverIndex(null);
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLLIElement>, destinationIndex: number) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (sourceIndex !== destinationIndex) {
            onReorder(sourceIndex, destinationIndex);
        }
        cleanupDragState();
    }, [onReorder, cleanupDragState]);

    const handleDragOver = useCallback((e: DragEvent<HTMLLIElement>, index: number) => {
        e.preventDefault();
        if (index !== dragOverIndex) {
            setDragOverIndex(index);
        }
    }, [dragOverIndex]);

    const handleSaveAdd = useCallback((name: string) => {
        const trimmedName = name.trim().toLowerCase();
        const lowerCaseDeleteName = REMOVE_FROM_VIEW_CATEGORY_NAME.toLowerCase();
        if (trimmedName === 'uncategorized' || trimmedName === lowerCaseDeleteName) {
            alert(t('alerts.forbiddenCategoryNames', REMOVE_FROM_VIEW_CATEGORY_NAME));
            return;
        }
        onAdd(name);
        setIsAdding(false);
    }, [onAdd, t]);
    
    const handleCancelAdd = useCallback(() => setIsAdding(false), []);
    const handleStartAdd = useCallback(() => setIsAdding(true), []);

    const handleEditClick = useCallback((category: Category) => {
        setEditingCategoryId(category.id);
        setEditedCategoryName(category.name);
    }, []);

    const handleSaveEdit = useCallback(() => {
        const trimmedName = editedCategoryName.trim();
        const lowerTrimmedName = trimmedName.toLowerCase();
        const lowerCaseDeleteName = REMOVE_FROM_VIEW_CATEGORY_NAME.toLowerCase();

        if (lowerTrimmedName === 'uncategorized' || lowerTrimmedName === lowerCaseDeleteName) {
            alert(t('alerts.forbiddenCategoryNames', REMOVE_FROM_VIEW_CATEGORY_NAME));
            setEditingCategoryId(null);
            return;
        }

        const originalCategory = categories.find(s => s.id === editingCategoryId);
        if (editingCategoryId && trimmedName && trimmedName !== originalCategory?.name) {
            onUpdateCategoryName(editingCategoryId, trimmedName);
        }
        setEditingCategoryId(null);
    }, [categories, editingCategoryId, editedCategoryName, onUpdateCategoryName, t]);
    
    const handleCancelEdit = useCallback(() => setEditingCategoryId(null), []);

    return {
        draggingIndex,
        dragOverIndex,
        isAdding,
        editingCategoryId,
        editedCategoryName,
        setEditedCategoryName,
        handleDragStart,
        handleDrop,
        handleDragOver,
        cleanupDragState,
        handleSaveAdd,
        handleCancelAdd,
        handleStartAdd,
        handleEditClick,
        handleSaveEdit,
        handleCancelEdit,
    };
};