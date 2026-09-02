// components/EmptyShoppingList.tsx
import React from 'react';
import type { ViewMode } from '../types';
import { useLocalization } from '../localization/i18n.ts';

interface EmptyShoppingListProps {
    mode: ViewMode;
}

const EmptyShoppingList: React.FC<EmptyShoppingListProps> = ({ mode }) => {
  const { t } = useLocalization();
  return (
    <div 
      id="shopping-list-panel"
      role="tabpanel"
      aria-labelledby={`mode-tab-${mode}`}
      className="text-center py-8 px-4 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
    >
      <p id="empty-list-title" className="text-xl font-medium">{t('emptyShoppingList.title')}</p>
      <p className="mt-2">{t('emptyShoppingList.prompt')}</p>
    </div>
  );
};

export default EmptyShoppingList;