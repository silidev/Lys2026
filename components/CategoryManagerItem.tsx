const FILE_PATH = 'components/CategoryManagerItem.tsx';
import React, { useRef, useEffect } from 'react';
import type { Category } from '../types';
import { IconGripVertical, IconTrash, IconPencil, IconChevronUp, IconChevronDown } from '../common/components/icons/index.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface CategoryManagerItemProps {
    category: Category;
    isEditing: boolean;
    editedName: string;
    onEditedNameChange: (name: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditClick: (category: Category) => void;
    onDelete: (categoryId: string) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

const CategoryManagerItem: React.FC<CategoryManagerItemProps> = ({
    category,
    isEditing,
    editedName,
    onEditedNameChange,
    onSaveEdit,
    onCancelEdit,
    onEditClick,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}) => {
    const editInputRef = useRef<HTMLInputElement>(null);
    const isProtected = category.name.toLowerCase() === 'uncategorized';
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [isEditing]);

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onSaveEdit();
        else if (e.key === 'Escape') onCancelEdit();
    };

    const handleDoubleClick = () => {
        if (!isProtected) {
            onEditClick(category);
        }
    };
    
    return (
        <>
            <div className="flex items-center gap-2 flex-grow mr-1">
                <div 
                  className="cursor-grab text-gray-400" 
                  aria-label={t('categoryManagerItem.aria.drag', category.name)}
                  title={t('categoryManagerItem.tooltips.drag')}
                  {...longPressHandlers}
                >
                    <IconGripVertical />
                </div>
                {isEditing ? (
                    <input
                        id={`edit-category-input-${category.id}`}
                        ref={editInputRef}
                        type="text"
                        value={editedName}
                        onChange={(e) => onEditedNameChange(e.target.value)}
                        onBlur={onSaveEdit}
                        onKeyDown={handleEditKeyDown}
                        className="flex-grow bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none border-b border-orange-500"
                        aria-label={t('categoryManagerItem.aria.edit', category.name)}
                        title={t('categoryManagerItem.tooltips.editInput')}
                        {...longPressHandlers}
                    />
                ) : (
                    <span className="text-gray-800 dark:text-gray-200" onDoubleClick={handleDoubleClick}>{category.name}</span>
                )}
            </div>
            <div className="flex items-center flex-shrink-0">
                {!isEditing && (
                    <button
                        id={`edit-category-button-${category.id}`}
                        onClick={() => onEditClick(category)}
                        disabled={isProtected}
                        className="p-1.5 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/50 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={t('categoryManagerItem.aria.edit', category.name)}
                        title={isProtected ? t('categoryManagerItem.tooltips.cannotRename', category.name) : t('categoryManagerItem.tooltips.editIcon')}
                        {...longPressHandlers}
                    >
                        <IconPencil className="h-4 w-4" />
                    </button>
                )}
                <button
                    id={`delete-category-button-${category.id}`}
                    onClick={() => onDelete(category.id)}
                    disabled={category.itemIds.length > 0 || isProtected}
                    className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t('categoryManagerItem.aria.delete', category.name)}
                    title={category.itemIds.length > 0 ? t('categoryManagerItem.tooltips.deleteDisabledItems') : isProtected ? t('categoryManagerItem.tooltips.deleteDisabledProtected', category.name) : t('categoryManagerItem.tooltips.delete')}
                    {...longPressHandlers}
                >
                    <IconTrash className="h-4 w-4" />
                </button>
                {!isProtected && (
                    <>
                        <button
                            id={`move-up-category-button-${category.id}`}
                            onClick={onMoveUp}
                            disabled={isFirst}
                            className="p-1.5 rounded-full text-gray-400 transition-colors hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-orange-400"
                            aria-label={t('categoryManagerItem.aria.moveUp', category.name)}
                            title={t('categoryManagerItem.tooltips.moveUp')}
                            {...longPressHandlers}
                        >
                            <IconChevronUp className="h-4 w-4" />
                        </button>
                        <button
                            id={`move-down-category-button-${category.id}`}
                            onClick={onMoveDown}
                            disabled={isLast}
                            className="p-1.5 rounded-full text-gray-400 transition-colors hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-orange-400"
                            aria-label={t('categoryManagerItem.aria.moveDown', category.name)}
                            title={t('categoryManagerItem.tooltips.moveDown')}
                            {...longPressHandlers}
                        >
                            <IconChevronDown className="h-4 w-4" />
                        </button>
                    </>
                )}
            </div>
        </>
    );
};

export default CategoryManagerItem;