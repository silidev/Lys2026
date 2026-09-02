const FILE_PATH = 'components/AddCategoryForm.tsx';
import React, { useRef, useEffect, useState } from 'react';
import { IconCheck, IconX } from '../common/components/icons/index.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface AddCategoryFormProps {
    onSave: (name: string) => void;
    onCancel: () => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSave();
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input
                id="add-category-input"
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow p-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-orange-500 focus:outline-none transition text-sm"
                placeholder={t('addCategoryForm.placeholder')}
                aria-label={t('addCategoryForm.placeholder')}
                title={t('addCategoryForm.tooltips.name')}
                {...longPressHandlers}
            />
            <button
                id="save-new-category-button"
                type="submit"
                disabled={!name.trim()}
                className="p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900/50 focus:ring-green-500 disabled:opacity-50"
                aria-label={t('addCategoryForm.save')}
                title={t('addCategoryForm.tooltips.save')}
                {...longPressHandlers}
            >
                <IconCheck className="h-5 w-5" />
            </button>
            <button
                id="cancel-add-category-button"
                type="button"
                onClick={onCancel}
                className="p-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900/50 focus:ring-gray-400"
                aria-label={t('addCategoryForm.cancel')}
                title={t('addCategoryForm.tooltips.cancel')}
                {...longPressHandlers}
            >
                <IconX className="h-5 w-5" />
            </button>
        </form>
    );
};

export default AddCategoryForm;