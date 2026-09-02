const FILE_PATH = 'components/CategoryManager.tsx';
import React, { useState } from 'react';
import type { Category } from '../types';
import { IconPlus, IconChevronDown, IconChevronUp } from '../common/components/icons/index.ts';
import AddCategoryForm from './AddCategoryForm.tsx';
import CategoryManagerItem from './CategoryManagerItem.tsx';
import { useCategoryManager } from '../hooks/useCategoryManager.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface CategoryManagerProps {
    title: string;
    categories: Category[];
    onReorder: (sourceIndex: number, destinationIndex: number) => void;
    onAdd: (name: string) => void;
    onDelete: (categoryId: string) => void;
    onUpdateCategoryName: (categoryId: string, newName: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ title, categories, onReorder, onAdd, onDelete, onUpdateCategoryName }) => {
    const { t } = useLocalization();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const {
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
    } = useCategoryManager(categories, onReorder, onAdd, onUpdateCategoryName, t);
    const longPressHandlers = useLongPressTooltip();

    const handleMoveUp = (index: number) => {
        if (index > 0) {
            onReorder(index, index - 1);
        }
    };

    const handleMoveDown = (index: number) => {
        if (index < categories.length - 1) {
            // The reorder function expects an "insert before" index. To move an
            // item down one slot (e.g. from index 1 to 2), we want to insert it
            // after the item currently at index 2. This is equivalent to inserting
            // it before the item that will be at index 3 in the final list.
            onReorder(index, index + 2);
        }
    };

    return (
        <section>
            <div 
                id={`category-manager-toggle-${title.replace(/\s+/g, '-')}`}
                className="flex justify-between items-center mb-2 cursor-pointer"
                onClick={() => setIsCollapsed(prev => !prev)}
                aria-expanded={!isCollapsed}
                aria-controls={`category-manager-content-${title.replace(/\s+/g, '-')}`}
            >
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
                <div className="flex items-center">
                    <div 
                        className="text-xs text-gray-500 dark:text-gray-400 pr-2"
                        title={t('categoryManager.tooltips.hideable')}
                        {...longPressHandlers}
                    >
                        
                    </div>
                    {isCollapsed ? <IconChevronDown className="h-5 w-5 text-gray-500" /> : <IconChevronUp className="h-5 w-5 text-gray-500" />}
                </div>
            </div>
            {!isCollapsed && (
                <div 
                    id={`category-manager-content-${title.replace(/\s+/g, '-')}`}
                    className="bg-gray-100 dark:bg-gray-900/50 p-2 rounded-md"
                >
                    <ul className="space-y-1" onDragLeave={cleanupDragState}>
                        {categories.map((category, index) => {
                            const isDragging = draggingIndex === index;
                            const isDragOver = dragOverIndex === index;
                            const opacityClass = isDragging ? 'opacity-50' : 'opacity-100';
                            const dropIndicatorClass = isDragOver && !isDragging ? 'border-t-2 border-orange-500' : 'border-t-transparent';
                            const isUncategorized = category.name.toLowerCase() === 'uncategorized';

                            return (
                                <li 
                                    key={category.id}
                                    draggable={!isUncategorized}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={cleanupDragState}
                                    className={`flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm transition-all duration-200 ${opacityClass} ${dropIndicatorClass}`}
                                >
                                <CategoryManagerItem
                                        category={category}
                                        isEditing={editingCategoryId === category.id}
                                        editedName={editedCategoryName}
                                        onEditedNameChange={setEditedCategoryName}
                                        onSaveEdit={handleSaveEdit}
                                        onCancelEdit={handleCancelEdit}
                                        onEditClick={handleEditClick}
                                        onDelete={onDelete}
                                        onMoveUp={() => handleMoveUp(index)}
                                        onMoveDown={() => handleMoveDown(index)}
                                        isFirst={index === 0}
                                        isLast={index === categories.length - 1}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                    <div className="mt-2">
                        {isAdding ? (
                            <AddCategoryForm onSave={handleSaveAdd} onCancel={handleCancelAdd} />
                        ) : (
                            <button
                                onClick={handleStartAdd}
                                className="w-full flex items-center justify-center p-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-white/50 dark:hover:bg-black/20 rounded-md transition"
                                aria-label={t('categoryManager.addCategory')}
                                title={t('categoryManager.tooltips.addCategory')}
                                {...longPressHandlers}
                            >
                                <IconPlus className="h-5 w-5 mr-2" />
                                {t('categoryManager.addCategory')}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default CategoryManager;