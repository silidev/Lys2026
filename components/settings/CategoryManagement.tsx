// components/settings/CategoryManagement.tsx
import React from 'react';
import type { ShoppingListData, ViewMode } from '../../types.ts';
import CategoryManager from '../CategoryManager.tsx';
import { getManageableCategories, type DeleteCategoryOptions } from '../../common/services/categoryService.ts';
import { useLocalization } from '../../localization/i18n.ts';

const FILE_PATH = 'components/settings/CategoryManagement.tsx';

interface CategoryManagementProps {
    backupData: ShoppingListData;
    onReorderCategory: (sourceIndex: number, destinationIndex: number, mode: ViewMode) => void;
    onAddCategory: (name: string, mode: ViewMode) => void;
    onDeleteCategory: (categoryId: string, mode: ViewMode, options?: DeleteCategoryOptions) => void;
    onUpdateCategoryName: (categoryId: string, newName: string, mode: ViewMode) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
    backupData,
    onReorderCategory,
    onAddCategory,
    onDeleteCategory,
    onUpdateCategoryName,
}) => {
    const { t } = useLocalization();
    return (
        <div className="space-y-4">
            <CategoryManager
                title={t('categoryManagementSettings.homeTitle')}
                categories={getManageableCategories(backupData.homeCategories)}
                onReorder={(sourceIndex, destinationIndex) => onReorderCategory(sourceIndex, destinationIndex, 'home')}
                onAdd={(name) => onAddCategory(name, 'home')}
                onDelete={(categoryId, options) => onDeleteCategory(categoryId, 'home', options)}
                onUpdateCategoryName={(categoryId, newName) => onUpdateCategoryName(categoryId, newName, 'home')}
            />
            <CategoryManager
                title={t('categoryManagementSettings.shopTitle')}
                categories={getManageableCategories(backupData.shopCategories)}
                onReorder={(sourceIndex, destinationIndex) => onReorderCategory(sourceIndex, destinationIndex, 'shop')}
                onAdd={(name) => onAddCategory(name, 'shop')}
                onDelete={(categoryId, options) => onDeleteCategory(categoryId, 'shop', options)}
                onUpdateCategoryName={(categoryId, newName) => onUpdateCategoryName(categoryId, newName, 'shop')}
            />
        </div>
    );
};
export default CategoryManagement;
