const FILE_PATH = 'components/AddItemForm.tsx';
import React, { forwardRef } from 'react';
import { IconPlus, IconX } from '../common/components/icons/index.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface AddItemFormProps {
  onAddItem: () => void;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

const AddItemForm = forwardRef<HTMLInputElement, AddItemFormProps>(
  ({ onAddItem, value, onChange, onClear }, ref) => {
  const longPressHandlers = useLongPressTooltip();
  const { t } = useLocalization();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (value.trim()) {
      onAddItem();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && onClear) {
      e.preventDefault();
      onClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-grow">
        <input
          ref={ref}
          id="add-item-input"
          type="text"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
          aria-label={t('addItemForm.aria.newItem')}
          placeholder={t('addItemForm.placeholder')}
          title={t('addItemForm.tooltips.newItem')}
          {...longPressHandlers}
        />
        {value && onClear && (
          <button
            id="clear-add-item-input-button"
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={t('addItemForm.aria.clear')}
            title={t('addItemForm.tooltips.clear')}
            {...longPressHandlers}
          >
            <IconX className="h-5 w-5" />
          </button>
        )}
      </div>
      <button
        id="add-item-button"
        type="submit"
        className="bg-orange-600 text-white p-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
        disabled={!value.trim()}
        aria-label={t('addItemForm.aria.add')}
        title={t('addItemForm.tooltips.add')}
        {...longPressHandlers}
      >
        <IconPlus className="h-6 w-6" />
      </button>
    </form>
  );
});

AddItemForm.displayName = 'AddItemForm';

export default AddItemForm;