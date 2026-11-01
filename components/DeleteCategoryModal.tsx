const FILE_PATH = 'components/DeleteCategoryModal.tsx';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Category } from '../types.ts';
import { IconAlertTriangle, IconTrash, IconFolder, IconX } from '../common/components/icons/index.ts';
import { useBodyScrollLock } from '../common/hooks/effects/useBodyScrollLock.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

export interface DeleteCategoryModalProps {
    isOpen: boolean;
    category: Category | null;
    availableCategories: Category[];
    onClose: () => void;
    onConfirmMove: (targetCategoryId: string) => void;
    onConfirmDeleteAll: () => void;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
    isOpen,
    category,
    availableCategories,
    onClose,
    onConfirmMove,
    onConfirmDeleteAll,
}) => {
    useBodyScrollLock(isOpen);
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();

    // Select default target category: prefer 'Uncategorized', otherwise first available
    const [selectedTargetId, setSelectedTargetId] = useState<string>('');

    useEffect(() => {
        if (availableCategories.length > 0) {
            const uncategorized = availableCategories.find(
                c => c.name.toLowerCase() === 'uncategorized'
            );
            if (uncategorized) {
                setSelectedTargetId(uncategorized.id);
            } else {
                setSelectedTargetId(availableCategories[0].id);
            }
        } else {
            setSelectedTargetId('');
        }
    }, [availableCategories, isOpen]);

    if (!isOpen || !category) {
        return null;
    }

    const itemCount = category.itemIds.length;

    const handleMove = () => {
        onConfirmMove(selectedTargetId);
        onClose();
    };

    const handleDeleteAll = () => {
        onConfirmDeleteAll();
        onClose();
    };

    return createPortal(
        <div
            id="delete-category-modal"
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[60] p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-modal-title"
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="flex items-center">
                        <IconAlertTriangle className="h-6 w-6 mr-3 text-amber-500 flex-shrink-0" />
                        <h2 id="delete-category-modal-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t('deleteCategoryModal.title', category.name)}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        aria-label={t('deleteCategoryModal.cancel')}
                        title={t('deleteCategoryModal.tooltips.cancel')}
                        {...longPressHandlers}
                    >
                        <IconX className="h-5 w-5" />
                    </button>
                </header>

                {/* Content */}
                <div className="p-5 space-y-4 text-gray-700 dark:text-gray-300">
                    <p className="text-sm">
                        {t('deleteCategoryModal.message', itemCount)}
                    </p>

                    {/* Option 1: Move items */}
                    <div className="border border-orange-200 dark:border-orange-800/60 bg-orange-50/40 dark:bg-orange-950/20 rounded-lg p-3.5 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-orange-900 dark:text-orange-200">
                            <IconFolder className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <span>{t('deleteCategoryModal.moveOptionTitle')}</span>
                        </div>

                        {availableCategories.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="delete-category-target-select"
                                    className="text-xs font-medium text-gray-600 dark:text-gray-400"
                                >
                                    {t('deleteCategoryModal.selectCategory')}
                                </label>
                                <select
                                    id="delete-category-target-select"
                                    value={selectedTargetId}
                                    onChange={(e) => setSelectedTargetId(e.target.value)}
                                    className="w-full p-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    title={t('deleteCategoryModal.tooltips.targetSelect')}
                                    {...longPressHandlers}
                                >
                                    {availableCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name} ({cat.itemIds.length})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            id="confirm-delete-category-move-button"
                            onClick={handleMove}
                            className="w-full py-2 px-3 text-sm font-medium bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-md shadow-sm transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                            title={t('deleteCategoryModal.tooltips.moveButton')}
                            {...longPressHandlers}
                        >
                            {t('deleteCategoryModal.moveAndConfirm', itemCount)}
                        </button>
                    </div>

                    {/* Option 2: Delete items as well */}
                    <div className="border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 rounded-lg p-3.5 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-red-900 dark:text-red-200">
                            <IconTrash className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <span>{t('deleteCategoryModal.deleteOptionTitle')}</span>
                        </div>
                        <p className="text-xs text-red-700 dark:text-red-300">
                            {t('deleteCategoryModal.deleteItemsWarning', itemCount)}
                        </p>
                        <button
                            id="confirm-delete-category-all-button"
                            onClick={handleDeleteAll}
                            className="w-full py-2 px-3 text-sm font-medium bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-md shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-500"
                            title={t('deleteCategoryModal.tooltips.deleteItemsButton')}
                            {...longPressHandlers}
                        >
                            {t('deleteCategoryModal.deleteAndConfirm', itemCount)}
                        </button>
                    </div>
                </div>

                {/* Footer / Cancel */}
                <footer className="flex justify-end p-3.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        id="delete-category-modal-cancel-button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        title={t('deleteCategoryModal.tooltips.cancel')}
                        {...longPressHandlers}
                    >
                        {t('deleteCategoryModal.cancel')}
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
};

export default DeleteCategoryModal;
