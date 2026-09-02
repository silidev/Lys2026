const FILE_PATH = 'hooks/useCategoryEditing.ts';



import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import type { Category } from '../types';
import { REMOVE_FROM_VIEW_CATEGORY_NAME } from '../00configs/app.ts';

export const useCategoryEditing = (
    categories: Category[],
    onUpdateCategoryName: (categoryId: string, newName: string) => void,
    t: (key: string, ...args: (string | number)[]) => string
) => {
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editedCategoryName, setEditedCategoryName] = useState('');
    const categoryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingCategoryId && categoryInputRef.current) {
            categoryInputRef.current.focus();
            categoryInputRef.current.select();
        }
    }, [editingCategoryId]);

    const handleCategoryEditClick = useCallback((category: Category) => {
        setEditingCategoryId(category.id);
        setEditedCategoryName(category.name);
    }, []);
    
    const handleCategorySave = useCallback(() => {
        const trimmedName = editedCategoryName.trim();
        const lowerTrimmedName = trimmedName.toLowerCase();
        const lowerCaseDeleteName = REMOVE_FROM_VIEW_CATEGORY_NAME.toLowerCase();

        if (lowerTrimmedName === 'uncategorized' || lowerTrimmedName === lowerCaseDeleteName) {
            alert(t('alerts.forbiddenCategoryNames', REMOVE_FROM_VIEW_CATEGORY_NAME));
            setEditingCategoryId(null);
            return;
        }

        const category = categories.find(s => s.id === editingCategoryId);
        if (editingCategoryId && trimmedName && trimmedName !== category?.name) {
          onUpdateCategoryName(editingCategoryId, trimmedName);
        }
        setEditingCategoryId(null);
    }, [categories, editingCategoryId, editedCategoryName, onUpdateCategoryName, t]);

    const handleCategoryKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          handleCategorySave();
        } else if (e.key === 'Escape') {
          setEditingCategoryId(null);
        }
    }, [handleCategorySave]);

    return {
        editingCategoryId,
        editedCategoryName,
        setEditedCategoryName,
        categoryInputRef,
        handleCategoryEditClick,
        handleCategorySave,
        handleCategoryKeyDown,
    };
};